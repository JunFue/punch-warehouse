"use client";

import { useOptimistic } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductDialog } from "@/components/features/inventory/product-dialog";

export function ProductsClient({ initialProducts }: { initialProducts: any[] }) {
  const [optimisticProducts, addOptimisticProduct] = useOptimistic(
    initialProducts,
    (state, newProduct: any) => {
      // If it has identical ID, it's an edit, replace it
      const index = state.findIndex((p) => p.id === newProduct.id);
      if (index !== -1) {
        const newState = [...state];
        newState[index] = { ...newState[index], ...newProduct };
        return newState;
      }
      return [newProduct, ...state].sort((a, b) => a.name.localeCompare(b.name));
    }
  );

  return (
    <>
      <div className="absolute top-0 right-0 -mt-14 mr-6">
        <ProductDialog onOptimisticSave={(product) => addOptimisticProduct(product)}>
          <Button id="add-product-btn">Add Product</Button>
        </ProductDialog>
      </div>

      {optimisticProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No products yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Start by adding your first product to the catalog. Products can be assigned to warehouses and used in deliveries.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticProducts.map((product: any) => (
              <TableRow
                key={product.id}
                className={`cursor-pointer hover:bg-muted/50 ${
                  product.pending ? "opacity-50" : ""
                }`}
              >
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {product.sku}
                  </Badge>
                </TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell className="text-right font-semibold">
                  ₱{Number(product.unit_price).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell>
                  <ProductDialog 
                    product={product} 
                    onOptimisticSave={(editedProduct) => addOptimisticProduct({ ...editedProduct, id: product.id })}
                  >
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                      Edit
                    </Button>
                  </ProductDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
