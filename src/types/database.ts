export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          invite_code?: string;
          created_at?: string;
        };
        Relationships: any[];
      };
      profiles: {
        Row: {
          id: string;
          company_id: string | null;
          full_name: string;
          role: "owner" | "admin" | "member";
          status: "pending" | "approved" | "rejected";
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          company_id?: string | null;
          full_name: string;
          role?: "owner" | "admin" | "member";
          status?: "pending" | "approved" | "rejected";
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          full_name?: string;
          role?: "owner" | "admin" | "member";
          status?: "pending" | "approved" | "rejected";
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
      };
      warehouses: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          location: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          location: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          location?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: any[];
      };
      products: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          sku: string;
          unit: string;
          unit_price: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          sku: string;
          unit: string;
          unit_price: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          sku?: string;
          unit?: string;
          unit_price?: number;
          description?: string | null;
          created_at?: string;
        };
        Relationships: any[];
      };
      warehouse_stock: {
        Row: {
          id: string;
          warehouse_id: string;
          product_id: string;
          quantity: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          warehouse_id: string;
          product_id: string;
          quantity: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          warehouse_id?: string;
          product_id?: string;
          quantity?: number;
          updated_at?: string;
        };
        Relationships: any[];
      };
      stock_transfers: {
        Row: {
          id: string;
          company_id: string;
          from_warehouse_id: string;
          to_warehouse_id: string;
          product_id: string;
          quantity: number;
          status: "pending" | "completed" | "cancelled";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          from_warehouse_id: string;
          to_warehouse_id: string;
          product_id: string;
          quantity: number;
          status?: "pending" | "completed" | "cancelled";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          from_warehouse_id?: string;
          to_warehouse_id?: string;
          product_id?: string;
          quantity?: number;
          status?: "pending" | "completed" | "cancelled";
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stock_transfers_from_warehouse_id_fkey";
            columns: ["from_warehouse_id"];
            isOneToOne: false;
            referencedRelation: "warehouses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_transfers_to_warehouse_id_fkey";
            columns: ["to_warehouse_id"];
            isOneToOne: false;
            referencedRelation: "warehouses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_transfers_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      manufacturers: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          created_at?: string;
        };
        Relationships: any[];
      };
      purchases: {
        Row: {
          id: string;
          company_id: string;
          manufacturer_id: string;
          warehouse_id: string;
          total_amount: number;
          amount_paid: number;
          status: "pending" | "partial" | "received" | "cancelled";
          order_date: string;
          expected_delivery: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          manufacturer_id: string;
          warehouse_id: string;
          total_amount: number;
          amount_paid?: number;
          status?: "pending" | "partial" | "received" | "cancelled";
          order_date: string;
          expected_delivery?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          manufacturer_id?: string;
          warehouse_id?: string;
          total_amount?: number;
          amount_paid?: number;
          status?: "pending" | "partial" | "received" | "cancelled";
          order_date?: string;
          expected_delivery?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "purchases_manufacturer_id_fkey";
            columns: ["manufacturer_id"];
            isOneToOne: false;
            referencedRelation: "manufacturers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchases_warehouse_id_fkey";
            columns: ["warehouse_id"];
            isOneToOne: false;
            referencedRelation: "warehouses";
            referencedColumns: ["id"];
          }
        ];
      };
      purchase_items: {
        Row: {
          id: string;
          purchase_id: string;
          product_id: string;
          quantity: number;
          unit_cost: number;
          received_quantity: number;
        };
        Insert: {
          id?: string;
          purchase_id: string;
          product_id: string;
          quantity: number;
          unit_cost: number;
          received_quantity?: number;
        };
        Update: {
          id?: string;
          purchase_id?: string;
          product_id?: string;
          quantity?: number;
          unit_cost?: number;
          received_quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "purchase_items_purchase_id_fkey";
            columns: ["purchase_id"];
            isOneToOne: false;
            referencedRelation: "purchases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      manufacturer_payments: {
        Row: {
          id: string;
          purchase_id: string;
          amount: number;
          method: "cash" | "check" | "bank_transfer";
          reference_no: string | null;
          payment_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          purchase_id: string;
          amount: number;
          method: "cash" | "check" | "bank_transfer";
          reference_no?: string | null;
          payment_date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          purchase_id?: string;
          amount?: number;
          method?: "cash" | "check" | "bank_transfer";
          reference_no?: string | null;
          payment_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "manufacturer_payments_purchase_id_fkey";
            columns: ["purchase_id"];
            isOneToOne: false;
            referencedRelation: "purchases";
            referencedColumns: ["id"];
          }
        ];
      };
      clients: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          created_at?: string;
        };
        Relationships: any[];
      };
      deliveries: {
        Row: {
          id: string;
          company_id: string;
          client_id: string;
          warehouse_id: string;
          total_amount: number;
          amount_collected: number;
          status: "pending" | "in_transit" | "delivered" | "cancelled";
          delivery_date: string;
          terms: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          client_id: string;
          warehouse_id: string;
          total_amount: number;
          amount_collected?: number;
          status?: "pending" | "in_transit" | "delivered" | "cancelled";
          delivery_date: string;
          terms?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          client_id?: string;
          warehouse_id?: string;
          total_amount?: number;
          amount_collected?: number;
          status?: "pending" | "in_transit" | "delivered" | "cancelled";
          delivery_date?: string;
          terms?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deliveries_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deliveries_warehouse_id_fkey";
            columns: ["warehouse_id"];
            isOneToOne: false;
            referencedRelation: "warehouses";
            referencedColumns: ["id"];
          }
        ];
      };
      delivery_items: {
        Row: {
          id: string;
          delivery_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          id?: string;
          delivery_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
        };
        Update: {
          id?: string;
          delivery_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "delivery_items_delivery_id_fkey";
            columns: ["delivery_id"];
            isOneToOne: false;
            referencedRelation: "deliveries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "delivery_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      client_payments: {
        Row: {
          id: string;
          delivery_id: string;
          amount: number;
          method: "cash" | "check";
          reference_no: string | null;
          payment_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          delivery_id: string;
          amount: number;
          method: "cash" | "check";
          reference_no?: string | null;
          payment_date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          delivery_id?: string;
          amount?: number;
          method?: "cash" | "check";
          reference_no?: string | null;
          payment_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_payments_delivery_id_fkey";
            columns: ["delivery_id"];
            isOneToOne: false;
            referencedRelation: "deliveries";
            referencedColumns: ["id"];
          }
        ];
      };
      expenses: {
        Row: {
          id: string;
          company_id: string;
          category: string;
          description: string;
          amount: number;
          expense_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          category: string;
          description: string;
          amount: number;
          expense_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          category?: string;
          description?: string;
          amount?: number;
          expense_date?: string;
          created_at?: string;
        };
        Relationships: any[];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Convenience type aliases
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Warehouse = Database["public"]["Tables"]["warehouses"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type WarehouseStock = Database["public"]["Tables"]["warehouse_stock"]["Row"];
export type StockTransfer = Database["public"]["Tables"]["stock_transfers"]["Row"];
export type Manufacturer = Database["public"]["Tables"]["manufacturers"]["Row"];
export type Purchase = Database["public"]["Tables"]["purchases"]["Row"];
export type PurchaseItem = Database["public"]["Tables"]["purchase_items"]["Row"];
export type ManufacturerPayment = Database["public"]["Tables"]["manufacturer_payments"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Delivery = Database["public"]["Tables"]["deliveries"]["Row"];
export type DeliveryItem = Database["public"]["Tables"]["delivery_items"]["Row"];
export type ClientPayment = Database["public"]["Tables"]["client_payments"]["Row"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
