import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const GHL_CLIENT_ID = "69fe0a4d9cd6a4f8e8fb4d15-mox49qdl";
const GHL_TOKEN_URL = "https://services.leadconnectorhq.com/oauth/token";

function adminClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function authedAdminUserId(accessToken: string): Promise<string> {
  if (!accessToken) throw new Error("Missing access token");
  const userClient = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
  const { data, error } = await userClient.auth.getUser(accessToken);
  if (error || !data?.user) throw new Error("Unauthorized");
  const userId = data.user.id;

  const admin = adminClient();
  const { data: roleRow, error: roleErr } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (roleErr) throw new Error(roleErr.message);
  if (!roleRow) throw new Error("Forbidden: admin role required");
  return userId;
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope?: string;
  locationId?: string;
  companyId?: string;
  userType?: string;
};

async function postToken(params: Record<string, string>): Promise<TokenResponse> {
  const body = new URLSearchParams({
    client_id: GHL_CLIENT_ID,
    client_secret: process.env.GHL_CLIENT_SECRET!,
    ...params,
  });
  const res = await fetch(GHL_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`GHL token error ${res.status}: ${text}`);
  }
  return JSON.parse(text) as TokenResponse;
}

async function persistToken(token: TokenResponse) {
  const admin = adminClient();
  const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString();
  const { data: existing } = await admin.from("ghl_tokens").select("id").limit(1).maybeSingle();
  const row = {
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: expiresAt,
    location_id: token.locationId ?? null,
    company_id: token.companyId ?? null,
    user_type: token.userType ?? null,
    scope: token.scope ?? null,
    raw: token as any,
  };
  if (existing) {
    const { error } = await admin.from("ghl_tokens").update(row).eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from("ghl_tokens").insert(row);
    if (error) throw new Error(error.message);
  }
}

export const exchangeGhlCode = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string; redirectUri: string; accessToken: string }) => data)
  .handler(async ({ data }) => {
    if (!process.env.GHL_CLIENT_SECRET) throw new Error("GHL_CLIENT_SECRET not configured");
    await authedAdminUserId(data.accessToken);
    const token = await postToken({
      grant_type: "authorization_code",
      code: data.code,
      redirect_uri: data.redirectUri,
      user_type: "Location",
    });
    await persistToken(token);
    return { success: true };
  });

export const refreshGhlToken = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string }) => data)
  .handler(async ({ data }) => {
    if (!process.env.GHL_CLIENT_SECRET) throw new Error("GHL_CLIENT_SECRET not configured");
    await authedAdminUserId(data.accessToken);
    const admin = adminClient();
    const { data: row, error } = await admin
      .from("ghl_tokens")
      .select("refresh_token")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("No GHL connection found. Please onboard first.");
    const token = await postToken({
      grant_type: "refresh_token",
      refresh_token: row.refresh_token,
      user_type: "Location",
    });
    await persistToken(token);
    return { success: true };
  });

export const getGhlStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string }) => data)
  .handler(async ({ data }) => {
    await authedAdminUserId(data.accessToken);
    const admin = adminClient();
    const { data: row, error } = await admin
      .from("ghl_tokens")
      .select("access_token, refresh_token, expires_at, location_id, company_id, user_type, scope, updated_at")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { token: row };
  });
