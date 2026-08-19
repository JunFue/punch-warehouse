"use client";

import { useState } from "react";
import { updateCompanyDetails } from "@/actions/company";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

export function CompanyProfileForm({ company, disabled }: { company: any, disabled: boolean }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(company?.name || "");
  const [address, setAddress] = useState(company?.address || "");
  const [businessType, setBusinessType] = useState(company?.business_type || "");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("address", address);
    formData.append("business_type", businessType);

    const result = await updateCompanyDetails(formData);
    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Company profile updated successfully");
    }
  };

  return (
    <Card>
      <form onSubmit={handleUpdate}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Profile
          </CardTitle>
          <CardDescription>
            Update your business details and corporate address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-w-md">
            <Label htmlFor="c_name">Company Name</Label>
            <Input id="c_name" value={name} onChange={e => setName(e.target.value)} disabled={disabled} required />
          </div>
          <div className="space-y-2 max-w-md">
            <Label htmlFor="c_type">Business Type</Label>
            <Input id="c_type" value={businessType} onChange={e => setBusinessType(e.target.value)} disabled={disabled} />
          </div>
          <div className="space-y-2 max-w-lg">
            <Label htmlFor="c_addr">Business Address</Label>
            <Input id="c_addr" value={address} onChange={e => setAddress(e.target.value)} disabled={disabled} />
          </div>
        </CardContent>
        {!disabled && (
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
