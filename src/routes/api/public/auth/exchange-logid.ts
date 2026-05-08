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

          // logid is the ghl_users.id — look up the linked app user
          const { data: ghlUser, error: ghlErr } = await supabaseAdmin
            .from("ghl_users")
            .select("id, app_user_id, email")
            .eq("id", logid)
            .maybeSingle();

          if (ghlErr) {
            console.error("[exchange-logid] ghl_users error:", ghlErr);
            return Response.json({ error: "Server error" }, { status: 500 });
          }
          if (!ghlUser?.app_user_id) {
            return Response.json({ error: "User not found" }, { status: 404 });
          }

          const { data: userData, error: userErr } =
            await supabaseAdmin.auth.admin.getUserById(ghlUser.app_user_id);
          if (userErr || !userData?.user?.email) {
            console.error("[exchange-logid] user lookup failed:", userErr);
            return Response.json({ error: "User not found" }, { status: 404 });
          }

          const { data: linkData, error: linkErr } =
            await supabaseAdmin.auth.admin.generateLink({
              type: "magiclink",
              email: userData.user.email,
            });
          if (linkErr || !linkData?.properties?.hashed_token) {
            console.error("[exchange-logid] generateLink failed:", linkErr);
            return Response.json({ error: "Could not generate session" }, { status: 500 });
          }

          return Response.json({
            email: userData.user.email,
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
