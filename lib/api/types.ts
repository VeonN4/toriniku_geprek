export type OrderStatus = "Baru" | "Diproses" | "Selesai" | "Dibatalkan";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  status: "Ready" | "Habis";
  note?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderType: "dine_in" | "takeaway";
  customerName: string;
  items: string;
  itemList: OrderItem[];
  notes?: string;
  total: number;
  subtotal: number;
  discountAmount: number;
  tax: number;
  paymentMethod: string;
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
