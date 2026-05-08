import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "P!nnacl3Adm!n#W3lln3ss";

const csv = fs.readFileSync("/tmp/import.csv", "utf8").trim().split("\n").slice(1);

// Pre-cache existing auth users by email
const emailToUserId = new Map<string, string>();
let page = 1;
while (true) {
  const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) throw error;
  for (const u of data.users) if (u.email) emailToUserId.set(u.email.toLowerCase(), u.id);
  if (data.users.length < 1000) break;
  page++;
}
console.log(`cached ${emailToUserId.size} existing auth users`);

let ok = 0, fail = 0;
for (const line of csv) {
  // simple split (no commas in fields)
  const [id, name, email, phone] = line.split(",");
  if (!id) continue;
  try {
    let appUserId: string | null = null;
    let createdNew = false;

    if (email) {
      const key = email.toLowerCase();
      appUserId = emailToUserId.get(key) ?? null;
      if (!appUserId) {
        const { data: created, error: cErr } = await sb.auth.admin.createUser({
          email,
          password: PASSWORD,
          email_confirm: true,
          user_metadata: { display_name: name || email },
        });
        if (cErr) {
          console.error(`createUser failed for ${email}:`, cErr.message);
        } else {
          appUserId = created.user?.id ?? null;
          if (appUserId) {
            emailToUserId.set(key, appUserId);
            createdNew = true;
          }
        }
      }
    }

    if (appUserId) {
      const profileUpdate: Record<string, any> = {};
      if (name) profileUpdate.display_name = name;
      if (email) profileUpdate.email = email;
      if (phone) profileUpdate.phone = phone;
      if (createdNew) profileUpdate.must_change_password = true;
      if (Object.keys(profileUpdate).length) {
        await sb.from("profiles").update(profileUpdate).eq("id", appUserId);
      }
    }

    const { error: upErr } = await sb.from("ghl_users").upsert({
      id,
      name: name || null,
      email: email || null,
      phone: phone || null,
      type: "User",
      app_user_id: appUserId,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
    if (upErr) throw upErr;
    ok++;
    console.log(`✓ ${id} ${email || "(no email)"} -> ${appUserId ?? "no app user"}${createdNew ? " [NEW]" : ""}`);
  } catch (e: any) {
    fail++;
    console.error(`✗ ${id} ${email}:`, e?.message ?? e);
  }
}
console.log(`\nDone. ok=${ok} fail=${fail}`);
