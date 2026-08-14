"use client";

import { useState } from "react";
import { addManufacturer, updateManufacturer } from "@/actions/manufacturers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ManufacturerData {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export function ManufacturerForm({ 
  initialData, 
  onSuccess 
}: { 
  initialData?: ManufacturerData;
  onSuccess?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    
    let result;
    if (initialData) {
      result = await updateManufacturer(initialData.id, formData);
    } else {
      result = await addManufacturer(formData);
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
        <Label htmlFor="name">Manufacturer Name</Label>
        <Input id="name" name="name" defaultValue={initialData?.name} required placeholder="e.g. Acme Corp" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input id="contact_person" name="contact_person" defaultValue={initialData?.contact_person || ""} placeholder="e.g. Jane Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={initialData?.phone || ""} placeholder="e.g. +1 234 567 890" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" type="email" defaultValue={initialData?.email || ""} placeholder="e.g. contact@acme.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Physical Address</Label>
        <Input id="address" name="address" defaultValue={initialData?.address || ""} placeholder="e.g. 123 Factory Lane, Industrial Park" />
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initialData ? "Update Manufacturer" : "Add Manufacturer"}
        </Button>
      </div>
    </form>
  );
}
