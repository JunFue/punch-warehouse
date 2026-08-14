"use server";

import { revalidatePath } from "next/cache";
import { getUserCompany } from "./utils";

export async function getClients() {
  const { supabase, error } = await getUserCompany();
  if (error) return { data: null, error };

  const { data, error: fetchError } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true });

  if (fetchError) return { data: null, error: fetchError.message };
  return { data, error: null };
}

export async function addClient(formData: FormData) {
  const { supabase, companyId, error } = await getUserCompany();
  if (error || !companyId) return { error };

  const name = formData.get("name") as string;
  const contact_person = formData.get("contact_person") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;

  const { error: insertError } = await supabase
    .from("clients")
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

  revalidatePath("/clients");
  revalidatePath("/deliveries");
  return { error: null };
}

export async function updateClient(id: string, formData: FormData) {
  const { supabase, error } = await getUserCompany();
  if (error) return { error };

  const name = formData.get("name") as string;
  const contact_person = formData.get("contact_person") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;

  const { error: updateError } = await supabase
    .from("clients")
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

  revalidatePath("/clients");
  revalidatePath("/deliveries");
  return { error: null };
}

export async function deleteClient(id: string) {
  const { supabase, error } = await getUserCompany();
  if (error) return { error };

  const { error: deleteError } = await supabase
    .from("clients")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath("/clients");
  return { error: null };
}
