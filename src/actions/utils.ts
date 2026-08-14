"use server";

import { createClient } from "@/lib/supabase/server";

export async function getUserCompany() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { supabase, companyId: null, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.company_id) {
    return { supabase, companyId: null, error: "User is not assigned to a company" };
  }

  return { supabase, companyId: profile.company_id, error: null };
}
