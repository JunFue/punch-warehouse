"use server";

import { revalidatePath } from "next/cache";
import { getUserCompany } from "./utils";

export interface DeliveryItemPayload {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface DeliveryPayload {
  client_id: string;
  warehouse_id: string;
  delivery_date: string;
  terms?: string | null;
  notes?: string | null;
  items: DeliveryItemPayload[];
}

export async function getDeliveries() {
  const { supabase, error } = await getUserCompany();
  if (error) return { data: null, error };

  const { data, error: fetchError } = await supabase
    .from("deliveries")
    .select(`
      *,
      clients (name),
      warehouses (name),
      delivery_items (
        id, product_id, quantity, unit_price,
        products (name, sku, unit)
      )
    `)
    .order("delivery_date", { ascending: false });

  if (fetchError) return { data: null, error: fetchError.message };
  return { data, error: null };
}

export async function addDelivery(payload: DeliveryPayload) {
  const { supabase, companyId, error } = await getUserCompany();
  if (error || !companyId) return { error };

  if (!payload.items || payload.items.length === 0) {
    return { error: "Delivery must contain at least one item." };
  }

  const total_amount = payload.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  // Insert Delivery
  const { data: deliveryData, error: deliveryError } = await supabase
    .from("deliveries")
    .insert({
      company_id: companyId,
      client_id: payload.client_id,
      warehouse_id: payload.warehouse_id,
      total_amount,
      amount_collected: 0,
      status: "pending",
      delivery_date: payload.delivery_date,
      terms: payload.terms || null,
      notes: payload.notes || null,
    })
    .select("id")
    .single();

  if (deliveryError || !deliveryData) {
    return { error: deliveryError?.message || "Failed to create delivery record." };
  }

  // Insert Delivery Items
  const deliveryItemsToInsert = payload.items.map(item => ({
    delivery_id: deliveryData.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }));

  const { error: itemsError } = await supabase
    .from("delivery_items")
    .insert(deliveryItemsToInsert);

  if (itemsError) {
    await supabase.from("deliveries").delete().eq("id", deliveryData.id);
    return { error: itemsError.message };
  }

  revalidatePath("/deliveries");
  return { error: null, id: deliveryData.id };
}

export async function updateDeliveryStatus(id: string, status: "pending" | "in_transit" | "delivered" | "cancelled") {
  const { supabase, error } = await getUserCompany();
  if (error) return { error };

  const { error: updateError } = await supabase
    .from("deliveries")
    .update({ status })
    .eq("id", id);
  
  if (updateError) return { error: updateError.message };

  revalidatePath("/deliveries");
  return { error: null };
}

export async function deleteDelivery(id: string) {
  const { supabase, error } = await getUserCompany();
  if (error) return { error };

  const { error: deleteError } = await supabase
    .from("deliveries")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath("/deliveries");
  return { error: null };
}

export async function addClientPayment(deliveryId: string, payload: { amount: number, method: "cash" | "check", reference_no?: string, payment_date: string, notes?: string }) {
  const { supabase, error } = await getUserCompany();
  if (error) return { error };

  const { data: delivery, error: dError } = await supabase.from("deliveries").select("amount_collected, total_amount").eq("id", deliveryId).single();
  if (dError || !delivery) return { error: "Failed to fetch delivery" };

  const { error: pmentError } = await supabase.from("client_payments").insert({
    delivery_id: deliveryId,
    amount: payload.amount,
    method: payload.method,
    reference_no: payload.reference_no || null,
    payment_date: payload.payment_date,
    notes: payload.notes || null,
  });

  if (pmentError) return { error: pmentError.message };

  await supabase.from("deliveries").update({
    amount_collected: delivery.amount_collected + payload.amount
  }).eq("id", deliveryId);

  revalidatePath(`/deliveries/${deliveryId}`);
  revalidatePath("/deliveries");
  return { error: null };
}
