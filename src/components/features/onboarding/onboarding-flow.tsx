"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, KeyRound } from "lucide-react";
import { setupCompany, joinCompany } from "@/actions/company";

export function OnboardingFlow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup State
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [businessType, setBusinessType] = useState("");

  // Join State
  const [otp, setOtp] = useState("");

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = new FormData();
    payload.append("name", name);
    payload.append("address", address);
    payload.append("business_type", businessType);

    const res = await setupCompany(payload);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = new FormData();
    payload.append("otp", otp);

    const res = await joinCompany(payload);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="create" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="create">Create Company</TabsTrigger>
        <TabsTrigger value="join">Join with Code</TabsTrigger>
      </TabsList>
      
      <TabsContent value="create">
        <Card className="border-border/50">
          <form onSubmit={handleSetup}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Workspace Setup
              </CardTitle>
              <CardDescription>
                Define your corporate profile. As the creator, you will be assigned as the Owner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input 
                  id="companyName" 
                  required 
                  placeholder="Acme Corp" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type / Industry</Label>
                <Input 
                  id="businessType" 
                  required 
                  placeholder="e.g. Retail, Wholesale, Manufacturing" 
                  value={businessType} 
                  onChange={e => setBusinessType(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Headquarters Address</Label>
                <Input 
                  id="address" 
                  required 
                  placeholder="123 Trading Blvd, Warehouse District..." 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Workspace..." : "Create Workspace"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
      
      <TabsContent value="join">
        <Card className="border-border/50">
          <form onSubmit={handleJoin}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                Join Existing Workspace
              </CardTitle>
              <CardDescription>
                Enter the 6-digit invite code provided by your organization administrator.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="otp">Invite Code</Label>
                <Input 
                  id="otp" 
                  required 
                  placeholder="e.g. 8XA49P" 
                  className="font-mono text-center tracking-widest text-lg uppercase"
                  maxLength={6}
                  value={otp} 
                  onChange={e => setOtp(e.target.value.toUpperCase())} 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? "Verifying..." : "Join Workspace"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
