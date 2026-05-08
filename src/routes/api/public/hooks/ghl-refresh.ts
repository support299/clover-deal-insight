import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const GHL_CLIENT_ID = "69fe0a4d9cd6a4f8e8fb4d15-mox49qdl";
const GHL_TOKEN_URL = "https://services.leadconnectorhq.com/oauth/token";
const GHL_LOCATION_TOKEN_URL = "https://services.leadconnectorhq.com/oauth/locationToken";
const GHL_LOCATION_ID = "32Xlzcg72vsKh62gCqEz";

type TokenResp = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  locationId?: string;
  companyId?: string;
  userType?: string;
};

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

        // 1) Refresh the company-level token row
        const { data: companyRow, error } = await admin
          .from("ghl_tokens")
          .select("id, refresh_token")
          .is("location_id", null)
          .limit(1)
          .maybeSingle();
        if (error) return Response.json({ error: error.message }, { status: 500 });
        if (!companyRow) return Response.json({ skipped: "no company token" });

        const body = new URLSearchParams({
          client_id: GHL_CLIENT_ID,
          client_secret: clientSecret,
          grant_type: "refresh_token",
          refresh_token: companyRow.refresh_token,
          user_type: "Company",
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
        const token = JSON.parse(text) as TokenResp;
        const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString();
        const { error: updErr } = await admin
          .from("ghl_tokens")
          .update({
            access_token: token.access_token,
            refresh_token: token.refresh_token ?? companyRow.refresh_token,
            expires_at: expiresAt,
            location_id: null,
            company_id: token.companyId ?? null,
            user_type: token.userType ?? "Company",
            scope: token.scope ?? null,
            raw: token as unknown as Database["public"]["Tables"]["ghl_tokens"]["Update"]["raw"],
          })
          .eq("id", companyRow.id);
        if (updErr) return Response.json({ error: updErr.message }, { status: 500 });

        // 2) Re-mint location token using the fresh company access token
        let locationResult: unknown = null;
        if (token.companyId) {
          const locBody = new URLSearchParams({
            companyId: token.companyId,
            locationId: GHL_LOCATION_ID,
          });
          const locRes = await fetch(GHL_LOCATION_TOKEN_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
              Version: "2021-07-28",
              Authorization: `Bearer ${token.access_token}`,
            },
            body: locBody.toString(),
          });
          const locText = await locRes.text();
          if (!locRes.ok) {
            return Response.json(
              { company_refreshed: true, location_error: `GHL ${locRes.status}: ${locText}` },
              { status: 502 },
            );
          }
          const locTok = JSON.parse(locText) as TokenResp;
          const locExpires = new Date(Date.now() + locTok.expires_in * 1000).toISOString();
          const locId = locTok.locationId ?? GHL_LOCATION_ID;
          const { data: existingLoc } = await admin
            .from("ghl_tokens")
            .select("id")
            .eq("location_id", locId)
            .maybeSingle();
          const locRow = {
            access_token: locTok.access_token,
            refresh_token: locTok.refresh_token ?? "",
            expires_at: locExpires,
            location_id: locId,
            company_id: locTok.companyId ?? token.companyId,
            user_type: locTok.userType ?? "Location",
            scope: locTok.scope ?? null,
            raw: locTok as unknown as Database["public"]["Tables"]["ghl_tokens"]["Insert"]["raw"],
          };
          if (existingLoc) {
            await admin.from("ghl_tokens").update(locRow).eq("id", existingLoc.id);
          } else {
            await admin.from("ghl_tokens").insert(locRow);
          }
          locationResult = { location_id: locId, expires_at: locExpires };
        }

        return Response.json({
          success: true,
          company: { expires_at: expiresAt, company_id: token.companyId },
          location: locationResult,
        });
      },
    },
  },
});
