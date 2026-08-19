"use client";

import { useState } from "react";
import { addProduct, updateProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface ProductData {
  id: string;
  name: string;
  sku: string;
  unit: string;
  unit_price: number;
  description?: string | null;
  manufacturer_id?: string | null;
}

export function ProductForm({ 
  initialData, 
  manufacturers = [],
  warehouses = [],
  onSuccess,
  onOptimisticSave
}: { 
  initialData?: ProductData;
  manufacturers?: { id: string; name: string }[];
  warehouses?: { id: string; name: string }[];
  onSuccess?: () => void;
  onOptimisticSave?: (product: any) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [trackInitialStock, setTrackInitialStock] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    
    // Optimistic UI emission
    onOptimisticSave?.({
      id: initialData?.id || `temp-${Date.now()}`,
      name: formData.get("name"),
      sku: formData.get("sku"),
      unit: formData.get("unit"),
      unit_price: Number(formData.get("unit_price")),
      description: formData.get("description"),
      pending: true
    });
    
    let result;
    if (initialData) {
      result = await updateProduct(initialData.id, formData);
    } else {
      result = await addProduct(formData);
    }

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      onSuccess?.();
    }
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" name="name" defaultValue={initialData?.name} required placeholder="e.g. Steel Pipe 20mm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manufacturer_id">Manufacturer</Label>
          <select 
            id="manufacturer_id"
            name="manufacturer_id"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
            defaultValue={initialData?.manufacturer_id || ""}
          >
            <option value="">Select Manufacturer (Optional)</option>
            {manufacturers.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={initialData?.sku} required placeholder="e.g. SP-20-44" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input id="unit" name="unit" defaultValue={initialData?.unit} required placeholder="e.g. pcs, bundle, kg" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit_price">Unit Price (₱)</Label>
        <Input id="unit_price" name="unit_price" type="number" step="0.01" defaultValue={initialData?.unit_price} required placeholder="0.00" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea id="description" name="description" defaultValue={initialData?.description || ""} placeholder="Add any additional details here..." />
      </div>

      {!initialData && warehouses.length > 0 && (
        <div className="pt-2 border-t mt-4">
          <label className="flex items-center space-x-2 text-sm font-medium mb-4 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded border-input text-primary focus:ring-primary h-4 w-4" 
              checked={trackInitialStock}
              onChange={(e) => setTrackInitialStock(e.target.checked)}
            />
            <span>Record Opening Stock Level?</span>
          </label>

          {trackInitialStock && (
            <div className="grid grid-cols-2 gap-4 p-4 rounded-md border bg-muted/20">
              <div className="space-y-2">
                <Label htmlFor="initial_stock_warehouse_id">Target Warehouse</Label>
                <select 
                  id="initial_stock_warehouse_id"
                  name="initial_stock_warehouse_id"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                  required={trackInitialStock}
                >
                  <option value="" disabled>Select Warehouse</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="initial_stock_quantity">Opening Quantity</Label>
                <Input 
                  id="initial_stock_quantity" 
                  name="initial_stock_quantity" 
                  type="number" 
                  min="0"
                  step="0.01" 
                  required={trackInitialStock} 
                  placeholder="0.00" 
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initialData ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
