import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/auth/exchange-logid")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as { logid?: string };
          const logid = body.logid?.trim();
          if (!logid) {
            return Response.json({ error: "Missing logid" }, { status: 400 });
          }

          const { data: tokenRow, error: tokenErr } = await supabaseAdmin
            .from("login_tokens")
            .select("token, user_id, expires_at, used_at")
            .eq("token", logid)
            .maybeSingle();

          if (tokenErr) {
            console.error("[exchange-logid] db error:", tokenErr);
            return Response.json({ error: "Server error" }, { status: 500 });
          }
          if (!tokenRow) {
            return Response.json({ error: "Invalid login link" }, { status: 404 });
          }
          if (tokenRow.used_at) {
            return Response.json({ error: "Login link already used" }, { status: 410 });
          }
          if (new Date(tokenRow.expires_at).getTime() < Date.now()) {
            return Response.json({ error: "Login link expired" }, { status: 410 });
          }

          // Resolve user email
          const { data: userData, error: userErr } =
            await supabaseAdmin.auth.admin.getUserById(tokenRow.user_id);
          if (userErr || !userData?.user?.email) {
            console.error("[exchange-logid] user lookup failed:", userErr);
            return Response.json({ error: "User not found" }, { status: 404 });
          }
          const email = userData.user.email;

          // Generate a magic link; we only need the hashed_token to verifyOtp on the client
          const { data: linkData, error: linkErr } =
            await supabaseAdmin.auth.admin.generateLink({
              type: "magiclink",
              email,
            });
          if (linkErr || !linkData?.properties?.hashed_token) {
            console.error("[exchange-logid] generateLink failed:", linkErr);
            return Response.json({ error: "Could not generate session" }, { status: 500 });
          }

          // Mark token used (single-use)
          await supabaseAdmin
            .from("login_tokens")
            .update({ used_at: new Date().toISOString() })
            .eq("token", logid);

          return Response.json({
            email,
            token_hash: linkData.properties.hashed_token,
          });
        } catch (e) {
          console.error("[exchange-logid] unexpected:", e);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
