import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-ghl-signature, x-wh-signature",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function buildName(p: any): string | null {
  const n = [p?.firstName, p?.lastName].filter(Boolean).join(" ").trim();
  return n || p?.name || null;
}

async function getLocationAccessToken(locationId?: string | null): Promise<string | null> {
  const q = supabaseAdmin
    .from("ghl_tokens")
    .select("access_token, location_id")
    .not("location_id", "is", null);
  const { data, error } = locationId
    ? await q.eq("location_id", locationId).maybeSingle()
    : await q.limit(1).maybeSingle();
  if (error) {
    console.error("getLocationAccessToken error", error);
    return null;
  }
  return data?.access_token ?? null;
}

async function fetchContactAssignedUserId(
  contactId: string,
  locationId?: string | null,
): Promise<string | null> {
  const token = await getLocationAccessToken(locationId);
  if (!token) return null;
  try {
    const res = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
      headers: {
        Accept: "application/json",
        Version: "2021-07-28",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      console.error("GHL contact fetch failed", res.status, await res.text());
      return null;
    }
    const json: any = await res.json();
    return json?.contact?.assignedTo ?? null;
  } catch (e) {
    console.error("GHL contact fetch error", e);
    return null;
  }
}

async function logDelivery(entry: {
  status: "success" | "error" | "skipped";
  type?: string | null;
  entity_id?: string | null;
  entity_table?: string | null;
  action?: string | null;
  error?: string | null;
  payload?: any;
}) {
  try {
    await supabaseAdmin.from("ghl_webhook_logs").insert({
      status: entry.status,
      type: entry.type ?? null,
      entity_id: entry.entity_id ?? null,
      entity_table: entry.entity_table ?? null,
      action: entry.action ?? null,
      error: entry.error ?? null,
      payload: entry.payload ?? null,
    });
  } catch (e) {
    console.error("ghl-webhook: failed to write audit log", e);
  }
}

async function handleEvent(payload: any) {
  const type: string = payload?.type ?? "";
  const id: string | undefined = payload?.id;

  if (!id) {
    const result = { skipped: true, reason: "missing id" };
    await logDelivery({ status: "skipped", type, error: "missing id", payload });
    return result;
  }

  const isContact = type.startsWith("Contact");
  const isUser = type.startsWith("User");
  if (!isContact && !isUser) {
    const result = { skipped: true, reason: `unsupported type ${type}` };
    await logDelivery({
      status: "skipped",
      type,
      entity_id: id,
      error: `unsupported type ${type}`,
      payload,
    });
    return result;
  }

  const table = isContact ? "ghl_contacts" : "ghl_users";

  try {
    if (type.endsWith("Delete")) {
      // Per requirement: do NOT delete the contact/user row. Just record event.
      await logDelivery({
        status: "skipped",
        type,
        entity_id: id,
        entity_table: table,
        action: "delete-ignored",
        payload,
      });
      return { ok: true, action: "delete-ignored", table, id };
    }

    const name = buildName(payload);
    const email: string | null = payload?.email ?? null;
    const phone: string | null = payload?.phone ?? null;

    const row: Record<string, any> = {
      id,
      name,
      email,
      phone,
      type,
      location_id: payload?.locationId ?? null,
      raw: payload,
      updated_at: new Date().toISOString(),
    };

    if (isContact) {
      const assignedUserId = await fetchContactAssignedUserId(id, payload?.locationId);
      if (assignedUserId) row.user_id = assignedUserId;
    }

    let appUserId: string | null = null;

    if (isUser) {
      // Find existing app user link
      const { data: existing } = await supabaseAdmin
        .from("ghl_users")
        .select("app_user_id")
        .eq("id", id)
        .maybeSingle();
      appUserId = (existing as any)?.app_user_id ?? null;

      let createdWithDefault = false;
      if (!appUserId && type !== "UserDelete" && email) {
        // Create a new auth user; the handle_new_user trigger creates a
        // profile + 'agent' role automatically.
        const { data: created, error: createErr } =
          await supabaseAdmin.auth.admin.createUser({
            email,
            password: "P!nnacl3Adm!n#W3lln3ss",
            email_confirm: true,
            user_metadata: { display_name: name ?? email },
          });
        if (createErr) {
          // Fall back: try to find an existing auth user with this email
          console.error("admin.createUser failed", createErr);
          const { data: list } = await supabaseAdmin.auth.admin.listUsers();
          const match = list?.users?.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase(),
          );
          if (match) appUserId = match.id;
        } else {
          appUserId = created.user?.id ?? null;
          createdWithDefault = true;
        }
      }

      if (appUserId) {
        row.app_user_id = appUserId;
        // Sync name/email/phone into the app profile
        const profileUpdate: Record<string, any> = {};
        if (name) profileUpdate.display_name = name;
        if (email) profileUpdate.email = email;
        if (phone) profileUpdate.phone = phone;
        if (createdWithDefault) profileUpdate.must_change_password = true;
        if (Object.keys(profileUpdate).length > 0) {
          const { error: pErr } = await supabaseAdmin
            .from("profiles")
            .update(profileUpdate as any)
            .eq("id", appUserId);
          if (pErr) console.error("profiles update error", pErr);
        }
        // Also sync into the auth user (email + display_name metadata)
        const authUpdate: Record<string, any> = {};
        if (email) {
          authUpdate.email = email;
          authUpdate.email_confirm = true;
        }
        if (name) authUpdate.user_metadata = { display_name: name };
        if (Object.keys(authUpdate).length > 0) {
          const { error: aErr } = await supabaseAdmin.auth.admin.updateUserById(
            appUserId,
            authUpdate as any,
          );
          if (aErr) console.error("auth user update error", aErr);
        }
      }
    }

    const { error } = await supabaseAdmin.from(table).upsert(row as any, { onConflict: "id" });
    if (error) throw error;

    await logDelivery({
      status: "success",
      type,
      entity_id: id,
      entity_table: table,
      action: appUserId ? "upserted+app-synced" : "upserted",
      payload,
    });
    return { ok: true, action: "upserted", table, id, app_user_id: appUserId };
  } catch (err: any) {
    await logDelivery({
      status: "error",
      type,
      entity_id: id,
      entity_table: table,
      error: err?.message ?? String(err),
      payload,
    });
    throw err;
  }
}

export const Route = createFileRoute("/api/public/hooks/ghl-webhook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        let body: any;
        try {
          body = await request.json();
        } catch (e: any) {
          await logDelivery({ status: "error", error: `invalid json: ${e?.message ?? e}` });
          return json({ success: false, error: "invalid json" }, 400);
        }

        const events = Array.isArray(body) ? body : [body];
        const results: any[] = [];
        for (const evt of events) {
          const payload = evt?.body ?? evt;
          try {
            results.push(await handleEvent(payload));
          } catch (e: any) {
            console.error("ghl-webhook event error:", e);
            results.push({ ok: false, error: e?.message ?? "unknown" });
          }
        }
        return json({ success: true, results });
      },
    },
  },
});
