"use client";

import { useState } from "react";
import { generateInviteOtp } from "@/actions/company";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { KeyRound, Clock } from "lucide-react";

export function InviteManager({ company }: { company: any }) {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string | null>(company?.invite_otp || null);
  const [expiresAt, setExpiresAt] = useState<string | null>(company?.invite_otp_expires_at || null);

  const handleGenerate = async () => {
    setLoading(true);
    const res = await generateInviteOtp();
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else if (res?.otp && res?.expiresAt) {
      setOtp(res.otp);
      setExpiresAt(res.expiresAt);
      toast.success("New invite code generated");
    }
  };

  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : true;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Team Invitations
        </CardTitle>
        <CardDescription>
          Generate temporary access codes to allow personnel to securely join your company's workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {otp && !isExpired ? (
          <div className="rounded-lg border bg-muted/20 p-6 flex flex-col items-center justify-center space-y-4 max-w-sm">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Invite Code</span>
            <div className="font-mono text-4xl tracking-[0.25em] font-bold text-primary">{otp}</div>
            <div className="flex items-center text-sm text-warning gap-1">
              <Clock className="w-4 h-4" />
              Expires at {new Date(expiresAt!).toLocaleTimeString()}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No active invite code. Generate one to invite members.
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerate} disabled={loading} variant="outline">
          {loading ? "Generating..." : "Generate New Invite Code"}
        </Button>
      </CardFooter>
    </Card>
  );
}
