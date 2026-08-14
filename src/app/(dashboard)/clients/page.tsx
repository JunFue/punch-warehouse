import { getClients } from "@/actions/clients";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ClientDialog } from "@/components/features/crm/client-dialog";

export const metadata = { title: "Clients CRM" };

export default async function ClientsPage() {
  const { data: clients, error } = await getClients();

  return (
    <PageContainer
      title="Clients CRM"
      description="Manage your client pipeline and outbound destinations"
      action={
        <ClientDialog>
          <Button id="add-client-btn">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </ClientDialog>
      }
    >
      <Card className="border-border/50">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Client Directory</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search clients..." className="pl-9" id="search-clients" />
          </div>
        </CardHeader>
        <CardContent>
          {!clients || clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No clients yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Start by adding your first client profile to dispatch deliveries.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c) => (
                  <TableRow
                    key={c.id}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {c.name}
                    </TableCell>
                    <TableCell>
                      {c.contact_person || <span className="text-muted-foreground italic">N/A</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.email || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.phone || "-"}
                    </TableCell>
                    <TableCell>
                      <ClientDialog client={c}>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                          Edit
                        </Button>
                      </ClientDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
