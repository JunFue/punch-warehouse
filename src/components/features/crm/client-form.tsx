"use client";

import { useState } from "react";
import { addClient, updateClient } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ClientData {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export function ClientForm({ 
  initialData, 
  onSuccess 
}: { 
  initialData?: ClientData;
  onSuccess?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    
    let result;
    if (initialData) {
      result = await updateClient(initialData.id, formData);
    } else {
      result = await addClient(formData);
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
        <Label htmlFor="name">Client / Business Name</Label>
        <Input id="name" name="name" defaultValue={initialData?.name} required placeholder="e.g. Globex Corp" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input id="contact_person" name="contact_person" defaultValue={initialData?.contact_person || ""} placeholder="e.g. John Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={initialData?.phone || ""} placeholder="e.g. +1 555 123 4567" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" type="email" defaultValue={initialData?.email || ""} placeholder="e.g. info@globex.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Delivery Address</Label>
        <Input id="address" name="address" defaultValue={initialData?.address || ""} placeholder="e.g. 742 Evergreen Terrace" />
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initialData ? "Update Client" : "Add Client"}
        </Button>
      </div>
    </form>
  );
}
