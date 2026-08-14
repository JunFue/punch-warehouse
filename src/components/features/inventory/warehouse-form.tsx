"use client";

import { useState } from "react";
import { addWarehouse, updateWarehouse } from "@/actions/warehouses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface WarehouseData {
  id: string;
  name: string;
  location: string;
  is_active: boolean;
}

export function WarehouseForm({ 
  initialData, 
  onSuccess 
}: { 
  initialData?: WarehouseData;
  onSuccess?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    formData.append("is_active", isActive.toString());
    
    let result;
    if (initialData) {
      result = await updateWarehouse(initialData.id, formData);
    } else {
      result = await addWarehouse(formData);
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
        <Label htmlFor="name">Warehouse Name</Label>
        <Input id="name" name="name" defaultValue={initialData?.name} required placeholder="e.g. Main Hub" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location / Address</Label>
        <Input id="location" name="location" defaultValue={initialData?.location} required placeholder="e.g. 123 Logistics Ave." />
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <input 
          type="checkbox" 
          id="is_active" 
          checked={isActive} 
          onChange={(e) => setIsActive(e.target.checked)} 
          className="h-4 w-4 rounded border-border bg-background"
        />
        <Label htmlFor="is_active" className="cursor-pointer">Active Location</Label>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initialData ? "Update Warehouse" : "Add Warehouse"}
        </Button>
      </div>
    </form>
  );
}
