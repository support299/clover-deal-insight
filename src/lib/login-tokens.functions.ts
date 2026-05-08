import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function randomToken(): string {
  // 24 bytes -> 32 char base64url
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Admin-only: create a single-use, 24h auto-login token for an app user.
 * Returns the token and a ready-to-use login URL.
 */
export const createLoginToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const d = data as { userId?: string; baseUrl?: string };
    if (!d?.userId) throw new Error("userId required");
    return { userId: String(d.userId), baseUrl: d.baseUrl ? String(d.baseUrl) : undefined };
  })
  .handler(async ({ data, context }) => {
    // Verify caller is admin
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const isAdmin = (roles ?? []).some((r: { role: string }) => r.role === "admin");
    if (!isAdmin) throw new Error("Forbidden");

    const token = randomToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabaseAdmin.from("login_tokens").insert({
      token,
      user_id: data.userId,
      expires_at: expiresAt,
    });
    if (error) throw new Error(error.message);

    const base = data.baseUrl?.replace(/\/$/, "") ?? "";
    return { token, expiresAt, url: base ? `${base}/?logid=${token}` : `/?logid=${token}` };
  });
