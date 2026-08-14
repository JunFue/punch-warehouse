import { getManufacturers } from "@/actions/manufacturers";
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
import { Plus, Search, Factory, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ManufacturerDialog } from "@/components/features/procurement/manufacturer-dialog";

export const metadata = { title: "Manufacturers" };

export default async function ManufacturersPage() {
  const { data: manufacturers, error } = await getManufacturers();

  return (
    <PageContainer
      title="Manufacturers"
      description="Manage your supplier directory"
      action={
        <ManufacturerDialog>
          <Button id="add-manufacturer-btn">
            <Plus className="mr-2 h-4 w-4" />
            Add Manufacturer
          </Button>
        </ManufacturerDialog>
      }
    >
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Manufacturer Directory</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search manufacturers..." className="pl-9" id="search-manufacturers" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!manufacturers || manufacturers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                <Factory className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No manufacturers yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Start by adding your first supplier to begin creating purchase orders.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manufacturers.map((m) => (
                  <TableRow
                    key={m.id}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {m.name}
                    </TableCell>
                    <TableCell>
                      {m.contact_person || <span className="text-muted-foreground italic">N/A</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.email || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.phone || "-"}
                    </TableCell>
                    <TableCell>
                      <ManufacturerDialog manufacturer={m}>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                          Edit
                        </Button>
                      </ManufacturerDialog>
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
