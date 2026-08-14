"use client";

import { useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addClientPayment } from "@/actions/deliveries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ClientPaymentDialog({ 
  deliveryId,
  balance,
  children 
}: {
  deliveryId: string;
  balance: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState<number>(balance);
  const [method, setMethod] = useState<"cash" | "check">("cash");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > balance) {
      setError("Invalid amount. Must be between 0 and the total receivable balance.");
      return;
    }
    
    setLoading(true);
    setError(null);

    const result = await addClientPayment(deliveryId, {
      amount: Number(amount),
      method,
      payment_date: date,
      reference_no: reference || undefined,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Collect Payment</DialogTitle>
          <DialogDescription>
            Log a payment collected from the client for this delivery.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="amount">Collection Amount (₱)</Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.01" 
              value={amount} 
              onChange={e => setAmount(Number(e.target.value))} 
              required 
            />
            <p className="text-xs text-muted-foreground">Receivable Balance: ₱{balance.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method</Label>
              <select 
                id="method"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                value={method} 
                onChange={e => setMethod(e.target.value as any)}
                required
              >
                <option value="cash">Cash</option>
                <option value="check">Check</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
          </div>

          {method === "check" && (
            <div className="space-y-2">
              <Label htmlFor="reference">Check Number</Label>
              <Input id="reference" value={reference} onChange={e => setReference(e.target.value)} required />
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading || amount <= 0 || amount > balance}>
              {loading ? "Recording..." : "Record Collection"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
