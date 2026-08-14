"use client";

import { useState } from "react";
import { addDelivery, DeliveryPayload, DeliveryItemPayload } from "@/actions/deliveries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

export function DeliveryForm({ 
  clients,
  warehouses,
  products,
  onSuccess 
}: { 
  clients: { id: string, name: string }[];
  warehouses: { id: string, name: string }[];
  products: { id: string, name: string, unit_price: number }[]; // this can represent the selling price explicitly
  onSuccess?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || "");
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split("T")[0]);
  const [terms, setTerms] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<DeliveryItemPayload[]>([]);

  const handleAddItem = () => {
    if (products.length === 0) return;
    setItems([...items, { product_id: products[0].id, quantity: 1, unit_price: products[0].unit_price }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof DeliveryItemPayload, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill price if product changed 
    if (field === "product_id") {
       const selectedProduct = products.find(p => p.id === value);
       if (selectedProduct) {
         newItems[index].unit_price = selectedProduct.unit_price;
       }
    }
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: DeliveryPayload = {
      client_id: clientId,
      warehouse_id: warehouseId,
      delivery_date: deliveryDate,
      terms: terms || null,
      notes: notes || null,
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
      }))
    };
    
    const result = await addDelivery(payload);

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
          <Label htmlFor="client">Client / Recipient</Label>
          <select 
            id="client"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
            value={clientId} 
            onChange={e => setClientId(e.target.value)}
            required
          >
            <option value="" disabled>Select Client</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="warehouse">Dispatch Warehouse</Label>
          <select 
            id="warehouse"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
            value={warehouseId} 
            onChange={e => setWarehouseId(e.target.value)}
            required
          >
            <option value="" disabled>Select Dispatch Source</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="delivery_date">Dispatch Date</Label>
          <Input id="delivery_date" type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="terms">Terms</Label>
          <Input id="terms" placeholder="Net 30, COD, etc." value={terms} onChange={e => setTerms(e.target.value)} />
        </div>
      </div>

      <div className="space-y-4 border rounded-xl p-4 bg-muted/20">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Outbound Line Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-1" /> Add Product
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No lines added. What are we shipping?</p>
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
                    placeholder="Price" 
                    value={item.unit_price || ""} 
                    onChange={e => handleItemChange(idx, "unit_price", parseFloat(e.target.value) || 0)} 
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
            <span>Total Sales Value</span>
            <span className="text-xl text-success">₱{totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Delivery Notes</Label>
        <Input id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special instructions for the driver..." />
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={loading || items.length === 0}>
          {loading ? "Dispatching..." : "Create Delivery Log"}
        </Button>
      </div>
    </form>
  );
}
