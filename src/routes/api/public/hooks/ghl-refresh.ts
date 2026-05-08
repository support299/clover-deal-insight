import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const GHL_CLIENT_ID = "69fe0a4d9cd6a4f8e8fb4d15-mox49qdl";
const GHL_TOKEN_URL = "https://services.leadconnectorhq.com/oauth/token";

export const Route = createFileRoute("/api/public/hooks/ghl-refresh")({
  server: {
    handlers: {
      POST: async () => {
        const clientSecret = process.env.GHL_CLIENT_SECRET;
        if (!clientSecret) {
          return Response.json({ error: "GHL_CLIENT_SECRET not configured" }, { status: 500 });
        }
        const admin = createClient<Database>(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );
        const { data: row, error } = await admin
          .from("ghl_tokens")
          .select("id, refresh_token")
          .limit(1)
          .maybeSingle();
        if (error) return Response.json({ error: error.message }, { status: 500 });
        if (!row) return Response.json({ skipped: "no token" });

        const body = new URLSearchParams({
          client_id: GHL_CLIENT_ID,
          client_secret: clientSecret,
          grant_type: "refresh_token",
          refresh_token: row.refresh_token,
          user_type: "Location",
        });
        const res = await fetch(GHL_TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
          body: body.toString(),
        });
        const text = await res.text();
        if (!res.ok) {
          return Response.json({ error: `GHL ${res.status}: ${text}` }, { status: 502 });
        }
        const token = JSON.parse(text) as {
          access_token: string;
          refresh_token: string;
          expires_in: number;
          scope?: string;
          locationId?: string;
          companyId?: string;
          userType?: string;
        };
        const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString();
        const { error: updErr } = await admin
          .from("ghl_tokens")
          .update({
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            expires_at: expiresAt,
            location_id: token.locationId ?? null,
            company_id: token.companyId ?? null,
            user_type: token.userType ?? null,
            scope: token.scope ?? null,
            raw: token as unknown as Record<string, unknown>,
          })
          .eq("id", row.id);
        if (updErr) return Response.json({ error: updErr.message }, { status: 500 });
        return Response.json({ success: true, expires_at: expiresAt });
      },
    },
  },
});
