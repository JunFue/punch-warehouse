"use server";

import { getUserCompany } from "./utils";

export async function getDashboardMetrics() {
  const { supabase, error, companyId } = await getUserCompany();
  if (error || !companyId) return { data: null, error };

  try {
    // 1. Get counts
    const [{ count: productsCount }, { count: clientsCount }, { count: unreceivedPurchases }, { count: activeDeliveries }] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }).eq("company_id", companyId),
      supabase.from("clients").select("*", { count: "exact", head: true }).eq("company_id", companyId),
      supabase.from("purchases").select("*", { count: "exact", head: true }).eq("company_id", companyId).neq("status", "received"),
      supabase.from("deliveries").select("*", { count: "exact", head: true }).eq("company_id", companyId).in("status", ["pending", "in_transit"])
    ]);

    // 2. Financials (Accounts Receivable & Payable)
    // Supabase JS doesn't support sum() aggregation natively without an RPC in older versions. 
    // We can fetch all and sum in JS, or we can use a quick query if volume is low. For dashboard, pulling all is fine for now.
    const { data: purchases } = await supabase.from("purchases").select("total_amount, amount_paid").eq("company_id", companyId);
    const { data: deliveries } = await supabase.from("deliveries").select("total_amount, amount_collected").eq("company_id", companyId);

    let accountsPayable = 0;
    if (purchases) {
      accountsPayable = purchases.reduce((acc, p) => acc + (p.total_amount - (p.amount_paid || 0)), 0);
    }

    let accountsReceivable = 0;
    if (deliveries) {
      accountsReceivable = deliveries.reduce((acc, d) => acc + (d.total_amount - (d.amount_collected || 0)), 0);
    }

    // 3. Recent Activity Lists
    const { data: recentPurchases } = await supabase
      .from("purchases")
      .select("id, order_date, status, total_amount, manufacturers(name)")
      .eq("company_id", companyId)
      .order("order_date", { ascending: false })
      .limit(5);

    const { data: recentDeliveries } = await supabase
      .from("deliveries")
      .select("id, delivery_date, status, total_amount, clients(name)")
      .eq("company_id", companyId)
      .order("delivery_date", { ascending: false })
      .limit(5);

    return {
      data: {
        productsCount: productsCount || 0,
        clientsCount: clientsCount || 0,
        unreceivedPurchases: unreceivedPurchases || 0,
        activeDeliveries: activeDeliveries || 0,
        accountsPayable,
        accountsReceivable,
        recentPurchases: recentPurchases || [],
        recentDeliveries: recentDeliveries || []
      },
      error: null
    };

  } catch (err: any) {
    return { data: null, error: err.message };
  }
}
