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
}

export function ProductForm({ 
  initialData, 
  onSuccess 
}: { 
  initialData?: ProductData;
  onSuccess?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    
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
      
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" name="name" defaultValue={initialData?.name} required placeholder="e.g. Steel Pipe 20mm" />
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

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initialData ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
