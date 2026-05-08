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
      const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
      if (error) throw error;
      await logDelivery({
        status: "success",
        type,
        entity_id: id,
        entity_table: table,
        action: "deleted",
        payload,
      });
      return { ok: true, action: "deleted", table, id };
    }

    const row = {
      id,
      name: buildName(payload),
      email: payload?.email ?? null,
      phone: payload?.phone ?? null,
      type,
      location_id: payload?.locationId ?? null,
      raw: payload,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin.from(table).upsert(row, { onConflict: "id" });
    if (error) throw error;

    await logDelivery({
      status: "success",
      type,
      entity_id: id,
      entity_table: table,
      action: "upserted",
      payload,
    });
    return { ok: true, action: "upserted", table, id };
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
