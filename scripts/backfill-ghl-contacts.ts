import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

const LOCATION_ID = "32Xlzcg72vsKh62gCqEz";

const { data: tok } = await sb
  .from("ghl_tokens")
  .select("access_token")
  .eq("location_id", LOCATION_ID)
  .maybeSingle();
if (!tok) throw new Error("no location token");
const token = tok.access_token;

function buildName(c: any): string | null {
  const n = [c?.firstName, c?.lastName].filter(Boolean).join(" ").trim();
  return n || c?.contactName || c?.name || null;
}

let page = 1;
let total = 0;
const pageLimit = 100;
let nextPageUrl: string | null = `https://services.leadconnectorhq.com/contacts/?locationId=${LOCATION_ID}&limit=${pageLimit}`;

while (nextPageUrl) {
  const res = await fetch(nextPageUrl, {
    headers: {
      Accept: "application/json",
      Version: "2021-07-28",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    console.error("fetch failed", res.status, await res.text());
    break;
  }
  const j: any = await res.json();
  const contacts: any[] = j?.contacts ?? [];
  if (contacts.length === 0) break;

  const rows = contacts.map((c) => ({
    id: c.id,
    name: buildName(c),
    email: c.email ?? null,
    phone: c.phone ?? null,
    type: "Contact",
    location_id: c.locationId ?? LOCATION_ID,
    user_id: c.assignedTo ?? null,
    raw: c,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await sb.from("ghl_contacts").upsert(rows, { onConflict: "id" });
  if (error) {
    console.error("upsert error", error);
    break;
  }
  total += rows.length;
  console.log(`page ${page}: +${rows.length} (total ${total})`);

  // Pagination: GHL v2 uses meta.nextPageUrl or meta.startAfter/startAfterId
  const meta = j?.meta ?? {};
  if (meta?.nextPageUrl) {
    nextPageUrl = meta.nextPageUrl;
  } else if (meta?.startAfter && meta?.startAfterId) {
    nextPageUrl = `https://services.leadconnectorhq.com/contacts/?locationId=${LOCATION_ID}&limit=${pageLimit}&startAfter=${meta.startAfter}&startAfterId=${meta.startAfterId}`;
  } else {
    nextPageUrl = null;
  }
  page++;
  if (page > 1000) break;
}

console.log("done. total:", total);
