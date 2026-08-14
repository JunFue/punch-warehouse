"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getUserCompany() {
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

export async function getWarehouses() {
  const { supabase, error } = await getUserCompany();
  if (error) return { data: null, error };

  const { data, error: fetchError } = await supabase
    .from("warehouses")
    .select("*")
    .order("created_at", { ascending: false });

  if (fetchError) return { data: null, error: fetchError.message };
  return { data, error: null };
}

export async function addWarehouse(formData: FormData) {
  const { supabase, companyId, error } = await getUserCompany();
  if (error || !companyId) return { error };

  const name = formData.get("name") as string;
  const location = formData.get("location") as string;
  const isActive = formData.get("is_active") === "true";

  const { error: insertError } = await supabase
    .from("warehouses")
    .insert({
      company_id: companyId,
      name,
      location: location || "",
      is_active: isActive,
    });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath("/warehouses");
  return { error: null };
}

export async function updateWarehouse(id: string, formData: FormData) {
  const { supabase, error } = await getUserCompany();
  if (error) return { error };

  const name = formData.get("name") as string;
  const location = formData.get("location") as string;
  const isActive = formData.get("is_active") === "true";

  const { error: updateError } = await supabase
    .from("warehouses")
    .update({
      name,
      location: location || "",
      is_active: isActive,
    })
    .eq("id", id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/warehouses");
  return { error: null };
}

export async function deleteWarehouse(id: string) {
  const { supabase, error } = await getUserCompany();
  if (error) return { error };

  const { error: deleteError } = await supabase
    .from("warehouses")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath("/warehouses");
  return { error: null };
}
