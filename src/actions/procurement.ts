"use server";

import { revalidatePath } from "next/cache";
import { getUserCompany } from "./utils";

export interface PurchaseItemPayload {
  product_id: string;
  quantity: number;
  unit_cost: number;
}

export interface PurchasePayload {
  manufacturer_id: string;
  warehouse_id: string;
  order_date: string;
  expected_delivery?: string | null;
  notes?: string | null;
  items: PurchaseItemPayload[];
}

export async function getPurchases() {
  const { supabase, error } = await getUserCompany();
  if (error) return { data: null, error };

  const { data, error: fetchError } = await supabase
    .from("purchases")
    .select(`
      *,
      manufacturers (name),
      warehouses (name),
      purchase_items (
        id, product_id, quantity, unit_cost, received_quantity,
        products (name, sku)
      )
    `)
    .order("order_date", { ascending: false });

  if (fetchError) return { data: null, error: fetchError.message };
  return { data, error: null };
}

export async function addPurchase(payload: PurchasePayload) {
  const { supabase, companyId, error } = await getUserCompany();
  if (error || !companyId) return { error };

  if (!payload.items || payload.items.length === 0) {
    return { error: "Purchase must contain at least one item." };
  }

  const total_amount = payload.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);

  // Use a transaction-like RPC if available, otherwise do it sequentially
  // Insert Purchase
  const { data: purchaseData, error: purchaseError } = await supabase
    .from("purchases")
    .insert({
      company_id: companyId,
      manufacturer_id: payload.manufacturer_id,
      warehouse_id: payload.warehouse_id,
      total_amount,
      amount_paid: 0,
      status: "pending",
      order_date: payload.order_date,
      expected_delivery: payload.expected_delivery || null,
      notes: payload.notes || null,
    })
    .select("id")
    .single();

  if (purchaseError || !purchaseData) {
    return { error: purchaseError?.message || "Failed to create purchase record." };
  }

  // Insert Purchase Items
  const purchaseItemsToInsert = payload.items.map(item => ({
    purchase_id: purchaseData.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_cost: item.unit_cost,
    received_quantity: 0
  }));

  const { error: itemsError } = await supabase
    .from("purchase_items")
    .insert(purchaseItemsToInsert);

  if (itemsError) {
    // Ideally we would rollback the purchase if items insert fails. Supabase doesn't support
    // multi-query transactions via REST API by default without an RPC, so we manually delete to rollback.
    await supabase.from("purchases").delete().eq("id", purchaseData.id);
    return { error: itemsError.message };
  }

  revalidatePath("/procurement");
  return { error: null, id: purchaseData.id };
}

export async function updatePurchaseStatus(id: string, status: "pending" | "partial" | "received" | "cancelled") {
  const { supabase, error } = await getUserCompany();
  if (error) return { error };

  const { error: updateError } = await supabase
    .from("purchases")
    .update({ status })
    .eq("id", id);
  
  if (updateError) return { error: updateError.message };

  revalidatePath("/procurement");
  return { error: null };
}

export async function deletePurchase(id: string) {
  const { supabase, error } = await getUserCompany();
  if (error) return { error };

  const { error: deleteError } = await supabase
    .from("purchases")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath("/procurement");
  return { error: null };
}

export async function addManufacturerPayment(purchaseId: string, payload: { amount: number, method: "cash" | "check" | "bank_transfer", reference_no?: string, payment_date: string, notes?: string }) {
  const { supabase, error } = await getUserCompany();
  if (error) return { error };

  // 1. Get current purchase to update amount_paid
  const { data: purchase, error: pError } = await supabase.from("purchases").select("amount_paid, total_amount").eq("id", purchaseId).single();
  if (pError || !purchase) return { error: "Failed to fetch purchase" };

  // 2. Insert payment
  const { error: pmentError } = await supabase.from("manufacturer_payments").insert({
    purchase_id: purchaseId,
    amount: payload.amount,
    method: payload.method,
    reference_no: payload.reference_no || null,
    payment_date: payload.payment_date,
    notes: payload.notes || null,
  });

  if (pmentError) return { error: pmentError.message };

  // 3. Update purchase amount_paid
  await supabase.from("purchases").update({
    amount_paid: purchase.amount_paid + payload.amount
  }).eq("id", purchaseId);

  revalidatePath(`/procurement/${purchaseId}`);
  revalidatePath("/procurement");
  return { error: null };
}

export async function receivePurchaseItems(purchaseId: string, itemsToReceive: { id: string, quantity: number }[]) {
  const { supabase, error } = await getUserCompany();
  if (error) return { error };

  for (const item of itemsToReceive) {
    if (item.quantity <= 0) continue;
    
    const { data: currentItem } = await supabase
      .from("purchase_items")
      .select("received_quantity")
      .eq("id", item.id)
      .single();

    if (currentItem) {
      await supabase.from("purchase_items").update({
        received_quantity: currentItem.received_quantity + item.quantity
      }).eq("id", item.id);
    }
  }

  revalidatePath(`/procurement/${purchaseId}`);
  return { error: null };
}
