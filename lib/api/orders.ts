import { createClient } from "../supabase/client";
import type { Order, OrderStatus } from "./types";

const supabase = createClient();

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      discount_id,
      order_type,
      status,
      subtotal,
      discount_amount,
      tax,
      total,
      payment_method,
      amount_paid,
      change_given,
      paid_at,
      created_at,
      order_items (
        quantity,
        notes,
        menu_items (
          name
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return data.map((row: any) => {
    const timeObj = new Date(row.created_at);
    const timeStr = `${String(timeObj.getHours()).padStart(2, "0")}:${String(timeObj.getMinutes()).padStart(2, "0")}`;
    const itemsSummary = (row.order_items || [])
      .map((it: any) => `${it.quantity}x ${it.menu_items?.name || "Produk"}`)
      .join(", ");

    return {
      id: row.id,
      orderNumber: `TN-${row.id.slice(0, 4).toUpperCase()}`,
      customerName: row.order_type === "dine_in" ? "Dine In" : "Takeaway",
      items: itemsSummary || "Tanpa Item",
      total: Number(row.total),
      time: timeStr,
      status: mapStatus(row.status),
      createdAt: row.created_at,
    };
  });
}

export async function insertCompleteOrder(
  order: {
    discountId?: string;
    orderType: "dine_in" | "takeaway";
    subtotal: number;
    discountAmount: number;
    tax: number;
    total: number;
    paymentMethod: "cash" | "qris";
    amountPaid?: number;
    changeGiven?: number;
    isForLater?: boolean;
  },
  items: {
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
    selectedModifiers?: { id: string; priceDelta: number }[];
  }[]
): Promise<void> {
  const isForLater = order.isForLater ?? false;

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      discount_id: order.discountId || null,
      order_type: order.orderType,
      status: isForLater ? "open" : "paid",
      subtotal: order.subtotal,
      discount_amount: order.discountAmount,
      tax: order.tax,
      total: order.total,
      payment_method: order.paymentMethod,
      amount_paid: isForLater ? null : (order.amountPaid || order.total),
      change_given: isForLater ? null : (order.changeGiven || 0),
      paid_at: isForLater ? null : new Date().toISOString(),
    })
    .select()
    .single();

  if (orderError || !orderData) {
    console.error("Error inserting order:", orderError);
    throw new Error(orderError?.message || "Failed to create order");
  }

  const orderId = orderData.id;

  for (const item of items) {
    const { data: itemData, error: itemError } = await supabase
      .from("order_items")
      .insert({
        order_id: orderId,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        notes: item.notes || null,
      })
      .select()
      .single();

    if (itemError || !itemData) {
      console.error("Error inserting order item:", itemError);
      continue;
    }

    if (item.selectedModifiers && item.selectedModifiers.length > 0) {
      const modifiersToInsert = item.selectedModifiers.map((mod) => ({
        order_item_id: itemData.id,
        modifier_id: mod.id,
        price_delta: mod.priceDelta,
      }));

      const { error: modError } = await supabase
        .from("order_item_modifiers")
        .insert(modifiersToInsert);

      if (modError) {
        console.error("Error inserting order item modifiers:", modError);
      }
    }
  }
}

export async function insertOrder(order: {
  customerName: string;
  total: number;
}): Promise<void> {
  const { error } = await supabase.from("orders").insert({
    order_type: order.customerName.toLowerCase().includes("takeaway") ? "takeaway" : "dine_in",
    subtotal: order.total,
    total: order.total,
    status: "open",
  });

  if (error) console.error("Error inserting order:", error);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<void> {
  const dbStatus =
    status === "Baru" || status === "Diproses"
      ? "open"
      : status === "Selesai"
      ? "paid"
      : "cancelled";

  const { error } = await supabase
    .from("orders")
    .update({ status: dbStatus })
    .eq("id", id);

  if (error) console.error("Error updating order status:", error);
}

function mapStatus(dbStatus: string): OrderStatus {
  if (dbStatus === "open") return "Baru";
  if (dbStatus === "paid") return "Selesai";
  return "Dibatalkan";
}
