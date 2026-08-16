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
import { DeliveryForm } from "./delivery-form";

export function DeliveryDialog({ 
  clients,
  warehouses,
  products,
  onOptimisticAdd,
  children 
}: {
  clients: { id: string, name: string }[];
  warehouses: { id: string, name: string }[];
  products: { id: string, name: string, unit_price: number }[];
  onOptimisticAdd?: (delivery: any) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Dispatch Delivery</DialogTitle>
          <DialogDescription>
            Register an outbound shipping order to a client.
          </DialogDescription>
        </DialogHeader>
        <DeliveryForm 
          clients={clients} 
          warehouses={warehouses} 
          products={products} 
          onSuccess={() => setOpen(false)} 
          onOptimisticAdd={onOptimisticAdd}
        />
      </DialogContent>
    </Dialog>
  );
}
