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
import { WarehouseForm, WarehouseData } from "./warehouse-form";

export function WarehouseDialog({ 
  warehouse, 
  children 
}: { 
  warehouse?: WarehouseData;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{warehouse ? "Edit Warehouse" : "Add New Warehouse"}</DialogTitle>
          <DialogDescription>
            {warehouse ? "Update the details for this storage location." : "Create a new warehouse to start tracking inventory."}
          </DialogDescription>
        </DialogHeader>
        <WarehouseForm initialData={warehouse} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
