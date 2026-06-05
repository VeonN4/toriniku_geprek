export type OrderStatus = "Baru" | "Diproses" | "Selesai" | "Dibatalkan";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  status: "Ready" | "Habis";
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: string;
  notes?: string;
  total: number;
  time: string;
  status: OrderStatus;
  createdAt: string;
}

export interface Discount {
  id: string;
  name: string;
  type: "percent" | "fixed";
  value: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export interface Modifier {
  id: string;
  menuItemId: string;
  name: string;
  priceDelta: number;
}
