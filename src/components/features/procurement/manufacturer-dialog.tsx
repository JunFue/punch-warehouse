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
import { ManufacturerForm, ManufacturerData } from "./manufacturer-form";

export function ManufacturerDialog({ 
  manufacturer, 
  children 
}: { 
  manufacturer?: ManufacturerData;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{manufacturer ? "Edit Manufacturer" : "Add New Manufacturer"}</DialogTitle>
          <DialogDescription>
            {manufacturer 
              ? "Update the details for this manufacturer." 
              : "Register a new manufacturer/supplier to create purchase orders."}
          </DialogDescription>
        </DialogHeader>
        <ManufacturerForm initialData={manufacturer} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
