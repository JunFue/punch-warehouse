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

export async function getProducts() {
  const { supabase, error } = await getUserCompany();
  if (error) return { data: null, error };

  // RLS will automatically restrict this to the user's company
  const { data, error: fetchError } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (fetchError) return { data: null, error: fetchError.message };
  return { data, error: null };
}

export async function addProduct(formData: FormData) {
  const { supabase, companyId, error } = await getUserCompany();
  if (error || !companyId) return { error };

  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const unit = formData.get("unit") as string;
  const unit_price = parseFloat(formData.get("unit_price") as string);
  const description = formData.get("description") as string;
  const manufacturer_id = formData.get("manufacturer_id") as string;
  const initialStockWhId = formData.get("initial_stock_warehouse_id") as string;
  const initialStockQty = parseFloat(formData.get("initial_stock_quantity") as string);

  const { data: newProduct, error: insertError } = await supabase
    .from("products")
    .insert({
      company_id: companyId,
      manufacturer_id: manufacturer_id || null,
      name,
      sku,
      unit,
      unit_price,
      description: description || null,
    })
    .select("id")
    .single();

  if (insertError || !newProduct) {
    return { error: insertError?.message || "Failed to create product" };
  }

  // If initial stock was provided, inject it instantly
  if (initialStockWhId && !isNaN(initialStockQty) && initialStockQty > 0) {
    const { error: stockError } = await supabase.from("warehouse_stock").insert({
      product_id: newProduct.id,
      warehouse_id: initialStockWhId,
      quantity: initialStockQty
    });

    if (stockError) {
      return { error: "Product created but failed to assign initial stock: " + stockError.message };
    }
  }

  revalidatePath("/products");
  return { error: null };
}

export async function updateProduct(id: string, formData: FormData) {
  const { supabase, error } = await getUserCompany();
  if (error) return { error };

  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const unit = formData.get("unit") as string;
  const unit_price = parseFloat(formData.get("unit_price") as string);
  const description = formData.get("description") as string;
  const manufacturer_id = formData.get("manufacturer_id") as string;

  // We don't strictly need company_id for update since RLS blocks updating other companies' products,
  // but it's safe to just reference the ID.
  const { error: updateError } = await supabase
    .from("products")
    .update({
      manufacturer_id: manufacturer_id || null,
      name,
      sku,
      unit,
      unit_price,
      description: description || null,
    })
    .eq("id", id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/products");
  return { error: null };
}

export async function deleteProduct(id: string) {
  const { supabase, error } = await getUserCompany();
  if (error) return { error };

  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath("/products");
  return { error: null };
}
