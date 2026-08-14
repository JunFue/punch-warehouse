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
import { PurchaseForm } from "./purchase-form";

export function PurchaseDialog({ 
  manufacturers,
  warehouses,
  products,
  children 
}: {
  manufacturers: { id: string, name: string }[];
  warehouses: { id: string, name: string }[];
  products: { id: string, name: string, unit_price: number }[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>
            Register an inbound purchase order from a manufacturer for inventory delivery.
          </DialogDescription>
        </DialogHeader>
        <PurchaseForm 
          manufacturers={manufacturers} 
          warehouses={warehouses} 
          products={products} 
          onSuccess={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
