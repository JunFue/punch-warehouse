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
import { ProductForm, ProductData } from "./product-form";

export function ProductDialog({ 
  product, 
  manufacturers,
  warehouses,
  onOptimisticSave,
  children 
}: { 
  product?: ProductData;
  manufacturers?: { id: string; name: string }[];
  warehouses?: { id: string; name: string }[];
  onOptimisticSave?: (product: any) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Make changes to your product here." : "Add a new product to your catalog. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <ProductForm 
          initialData={product} 
          manufacturers={manufacturers}
          warehouses={warehouses}
          onSuccess={() => setOpen(false)} 
          onOptimisticSave={onOptimisticSave}
        />
      </DialogContent>
    </Dialog>
  );
}
