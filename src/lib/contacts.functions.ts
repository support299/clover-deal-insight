import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const searchContactsInput = z.object({
  query: z.string().trim().min(2).max(120),
  limit: z.number().int().min(1).max(20).optional(),
});

export const searchAssignedContacts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => searchContactsInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const limit = data.limit ?? 8;

    const { data: contacts, error } = await supabase
      .from("ghl_contacts")
      .select("id, name, email, phone")
      .ilike("name", `%${data.query}%`)
      .order("name")
      .limit(limit);

    if (error) throw new Error(error.message);
    return contacts ?? [];
  });