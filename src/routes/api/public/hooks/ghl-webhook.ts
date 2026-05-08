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
  const n = [p.firstName, p.lastName].filter(Boolean).join(" ").trim();
  return n || p.name || null;
}

async function handleEvent(payload: any) {
  const type: string = payload?.type ?? "";
  const id: string | undefined = payload?.id;
  if (!id) return { skipped: true, reason: "missing id" };

  const isContact = type.startsWith("Contact");
  const isUser = type.startsWith("User");
  if (!isContact && !isUser) return { skipped: true, reason: `unsupported type ${type}` };

  const table = isContact ? "ghl_contacts" : "ghl_users";

  if (type.endsWith("Delete")) {
    const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
    if (error) throw error;
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
  return { ok: true, action: "upserted", table, id };
}

export const Route = createFileRoute("/api/public/hooks/ghl-webhook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const events = Array.isArray(body) ? body : [body];
          const results = [];
          for (const evt of events) {
            const payload = evt?.body ?? evt;
            results.push(await handleEvent(payload));
          }
          return json({ success: true, results });
        } catch (e: any) {
          console.error("ghl-webhook error:", e);
          return json({ success: false, error: e?.message ?? "unknown" }, 500);
        }
      },
    },
  },
});
