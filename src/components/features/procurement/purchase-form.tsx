"use client";

import { useState } from "react";
import { addPurchase, PurchasePayload, PurchaseItemPayload } from "@/actions/procurement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

export function PurchaseForm({ 
  manufacturers,
  warehouses,
  products,
  onSuccess,
  onOptimisticAdd
}: { 
  manufacturers: { id: string, name: string }[];
  warehouses: { id: string, name: string }[];
  products: { id: string, name: string, unit_price: number }[];
  onSuccess?: () => void;
  onOptimisticAdd?: (purchase: any) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // State for Purchase details
  const [manufacturerId, setManufacturerId] = useState(manufacturers[0]?.id || "");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || "");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [notes, setNotes] = useState("");

  // State for line items
  const [items, setItems] = useState<PurchaseItemPayload[]>([]);

  const handleAddItem = () => {
    if (products.length === 0) return;
    setItems([...items, { product_id: products[0].id, quantity: 1, unit_cost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PurchaseItemPayload, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    // Auto-fill cost if product changed and cost is zero
    if (field === "product_id") {
       const selectedProduct = products.find(p => p.id === value);
       if (selectedProduct && newItems[index].unit_cost === 0) {
         newItems[index].unit_cost = selectedProduct.unit_price;
       }
    }
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: PurchasePayload = {
      manufacturer_id: manufacturerId,
      warehouse_id: warehouseId,
      order_date: orderDate,
      expected_delivery: expectedDelivery || null,
      notes: notes || null,
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: Number(item.quantity),
        unit_cost: Number(item.unit_cost),
      }))
    };
    
    // Fire optimistic payload
    onOptimisticAdd?.({
      id: `temp-${Date.now()}`,
      order_date: payload.order_date,
      manufacturers: { name: manufacturers.find(m => m.id === payload.manufacturer_id)?.name },
      status: "pending",
      total_amount: totalAmount,
      amount_paid: 0,
      pending: true
    });

    const result = await addPurchase(payload);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="manufacturer">Manufacturer/Supplier</Label>
          <select 
            id="manufacturer"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
            value={manufacturerId} 
            onChange={e => setManufacturerId(e.target.value)}
            required
          >
            <option value="" disabled>Select Manufacturer</option>
            {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="warehouse">Destination Warehouse</Label>
          <select 
            id="warehouse"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
            value={warehouseId} 
            onChange={e => setWarehouseId(e.target.value)}
            required
          >
            <option value="" disabled>Select Warehouse</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="order_date">Order Date</Label>
          <Input id="order_date" type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expected_date">Expected Delivery</Label>
          <Input id="expected_date" type="date" value={expectedDelivery} onChange={e => setExpectedDelivery(e.target.value)} />
        </div>
      </div>

      <div className="space-y-4 border rounded-xl p-4 bg-muted/20">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Line Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No items added. Click 'Add Item' to begin.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <select 
                  className="flex h-9 w-[40%] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={item.product_id}
                  onChange={e => handleItemChange(idx, "product_id", e.target.value)}
                  required
                >
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <Input 
                  type="number" 
                  min="1" 
                  className="w-[20%]" 
                  placeholder="Qty" 
                  value={item.quantity || ""} 
                  onChange={e => handleItemChange(idx, "quantity", parseInt(e.target.value) || 0)} 
                  required 
                />
                <div className="flex items-center gap-2 w-[35%] relative">
                  <span className="absolute left-3 text-muted-foreground text-sm">₱</span>
                  <Input 
                    type="number" 
                    step="0.01" 
                    className="w-full pl-8" 
                    placeholder="Cost" 
                    value={item.unit_cost || ""} 
                    onChange={e => handleItemChange(idx, "unit_cost", parseFloat(e.target.value) || 0)} 
                    required 
                  />
                </div>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => handleRemoveItem(idx)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {items.length > 0 && (
          <div className="flex justify-between items-center pt-2 border-t font-semibold">
            <span>Total Estimated Cost</span>
            <span className="text-xl">₱{totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Terms, shipping instructions..." />
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={loading || items.length === 0}>
          {loading ? "Creating..." : "Create Purchase Order"}
        </Button>
      </div>
    </form>
  );
}
