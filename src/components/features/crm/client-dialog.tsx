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
import { ClientForm, ClientData } from "./client-form";

export function ClientDialog({ 
  client, 
  children 
}: { 
  client?: ClientData;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription>
            {client 
              ? "Update the details and delivery address for this client." 
              : "Register a new client profile for dispatching outbound deliveries."}
          </DialogDescription>
        </DialogHeader>
        <ClientForm initialData={client} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
