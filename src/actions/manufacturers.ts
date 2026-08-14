"use server";

import { revalidatePath } from "next/cache";
import { getUserCompany } from "./utils";

export async function getManufacturers() {
  const { supabase, error } = await getUserCompany();
  if (error) return { data: null, error };

  const { data, error: fetchError } = await supabase
    .from("manufacturers")
    .select("*")
    .order("name", { ascending: true });

  if (fetchError) return { data: null, error: fetchError.message };
  return { data, error: null };
}

export async function addManufacturer(formData: FormData) {
  const { supabase, companyId, error } = await getUserCompany();
  if (error || !companyId) return { error };

  const name = formData.get("name") as string;
  const contact_person = formData.get("contact_person") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;

  const { error: insertError } = await supabase
    .from("manufacturers")
    .insert({
      company_id: companyId,
      name,
      contact_person: contact_person || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
    });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath("/manufacturers");
  revalidatePath("/procurement");
  return { error: null };
}

export async function updateManufacturer(id: string, formData: FormData) {
  const { supabase, error } = await getUserCompany();
  if (error) return { error };

  const name = formData.get("name") as string;
  const contact_person = formData.get("contact_person") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;

  const { error: updateError } = await supabase
    .from("manufacturers")
    .update({
      name,
      contact_person: contact_person || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
    })
    .eq("id", id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/manufacturers");
  revalidatePath("/procurement");
  return { error: null };
}

export async function deleteManufacturer(id: string) {
  const { supabase, error } = await getUserCompany();
  if (error) return { error };

  const { error: deleteError } = await supabase
    .from("manufacturers")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath("/manufacturers");
  return { error: null };
}
