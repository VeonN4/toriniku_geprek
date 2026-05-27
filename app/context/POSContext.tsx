"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Session } from "@supabase/supabase-js";
import { createClient } from "../../lib/supabase/client";

const supabase = createClient();

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus = "Baru" | "Diproses" | "Selesai" | "Dibatalkan";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string; // Category UUID
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

interface POSContextType {
  session: Session | null;
  orders: Order[];
  ordersLoading: boolean;
  addOrder: (order: Pick<Order, "customerName" | "items" | "notes" | "total">) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  menuItems: MenuItem[];
  menuLoading: boolean;
  addMenuItem: (item: Omit<MenuItem, "id">) => Promise<void>;
  addMenuItemWithModifiers: (
    item: Omit<MenuItem, "id">,
    modifiers: { name: string; priceDelta: number }[]
  ) => Promise<void>;
  updateMenuItemStatus: (id: string, status: "Ready" | "Habis") => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  discounts: Discount[];
  discountsLoading: boolean;
  addDiscount: (discount: Omit<Discount, "id">) => Promise<void>;
  toggleDiscountActive: (id: string, isActive: boolean) => Promise<void>;
  deleteDiscount: (id: string) => Promise<void>;
  categories: Category[];
  categoriesLoading: boolean;
  modifiers: Modifier[];
  modifiersLoading: boolean;
  addModifier: (menuItemId: string, name: string, priceDelta: number) => Promise<void>;
  updateModifier: (modifierId: string, name: string, priceDelta: number) => Promise<void>;
  deleteModifier: (modifierId: string) => Promise<void>;
  addCompleteOrder: (
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
    },
    items: {
      menuItemId: string;
      quantity: number;
      unitPrice: number;
      notes?: string;
      selectedModifiers?: Modifier[];
    }[]
  ) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const POSContext = createContext<POSContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function POSProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [discountsLoading, setDiscountsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [modifiersLoading, setModifiersLoading] = useState(true);

  // ── Session ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Fetch data ───────────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
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

      if (!error && data) {
        setOrders(
          data.map((row: any) => {
            const timeObj = new Date(row.created_at);
            const timeStr = `${String(timeObj.getHours()).padStart(2, "0")}:${String(timeObj.getMinutes()).padStart(2, "0")}`;
            
            // Format order items summary string
            const itemsSummary = (row.order_items || [])
              .map((it: any) => `${it.quantity}x ${it.menu_items?.name || "Produk"}`)
              .join(", ");

            return {
              id: row.id,
              orderNumber: `TN-${row.id.slice(0, 4).toUpperCase()}`,
              customerName: row.order_type === "dine_in" ? "Dine In" : "Takeaway",
              items: itemsSummary || "Tanpa Item",
              notes: undefined,
              total: Number(row.total),
              time: timeStr,
              status: row.status === "open" ? "Baru" : row.status === "paid" ? "Selesai" : "Dibatalkan",
              createdAt: row.created_at,
            };
          })
        );
      }
    } catch (e) {
      console.error("Error fetching orders:", e);
    }
    setOrdersLoading(false);
  }, []);

  const fetchMenuItems = useCallback(async () => {
    setMenuLoading(true);
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_archived", false);

      if (!error && data) {
        setMenuItems(
          data.map((row) => ({
            id: row.id,
            name: row.name,
            price: Number(row.price),
            category: row.category_id || "",
            status: row.is_available ? "Ready" : "Habis",
            note: row.description ?? undefined,
          }))
        );
      }
    } catch (e) {
      console.error("Error fetching menu items:", e);
    }
    setMenuLoading(false);
  }, []);

  const fetchDiscounts = useCallback(async () => {
    setDiscountsLoading(true);
    try {
      const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .order("expires_at", { ascending: true, nullsFirst: true });

      if (!error && data) {
        setDiscounts(
          data.map((row) => ({
            id: row.id,
            name: row.name,
            type: row.type as "percent" | "fixed",
            value: Number(row.value),
            isActive: row.is_active,
            expiresAt: row.expires_at ?? undefined,
          }))
        );
      }
    } catch (e) {
      console.error("Error fetching discounts:", e);
    }
    setDiscountsLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data) {
        setCategories(
          data.map((row) => ({
            id: row.id,
            name: row.name,
            sortOrder: row.sort_order,
          }))
        );
      }
    } catch (e) {
      console.error("Error fetching categories:", e);
    }
    setCategoriesLoading(false);
  }, []);

  const fetchModifiers = useCallback(async () => {
    setModifiersLoading(true);
    try {
      const { data, error } = await supabase
        .from("modifiers")
        .select("*");

      if (!error && data) {
        setModifiers(
          data.map((row) => ({
            id: row.id,
            menuItemId: row.menu_item_id,
            name: row.name,
            priceDelta: Number(row.price_delta),
          }))
        );
      }
    } catch (e) {
      console.error("Error fetching modifiers:", e);
    }
    setModifiersLoading(false);
  }, []);

  useEffect(() => {
    if (session) {
      fetchOrders();
      fetchMenuItems();
      fetchDiscounts();
      fetchCategories();
      fetchModifiers();
    }
  }, [session, fetchOrders, fetchMenuItems, fetchDiscounts, fetchCategories, fetchModifiers]);

  // ── Order mutations ──────────────────────────────────────────────────────────

  const addOrder = async (order: Pick<Order, "customerName" | "items" | "notes" | "total">) => {
    const { error } = await supabase.from("orders").insert({
      order_type: order.customerName.toLowerCase().includes("takeaway") ? "takeaway" : "dine_in",
      subtotal: order.total,
      total: order.total,
      status: "open",
    });

    if (!error) await fetchOrders();
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    const dbStatus = status === "Baru" ? "open" : status === "Selesai" ? "paid" : "cancelled";
    const { error } = await supabase.from("orders").update({ status: dbStatus }).eq("id", id);
    if (!error) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    }
  };

  // ── Menu mutations ───────────────────────────────────────────────────────────

  const addMenuItem = async (item: Omit<MenuItem, "id">) => {
    const { error } = await supabase.from("menu_items").insert({
      name: item.name,
      price: item.price,
      category_id: item.category || null,
      is_available: item.status === "Ready",
    });
    if (!error) await fetchMenuItems();
  };

  const addMenuItemWithModifiers = async (
    item: Omit<MenuItem, "id">,
    newModifiers: { name: string; priceDelta: number }[]
  ) => {
    // 1. Insert the menu item and get back its id
    const { data: itemData, error: itemError } = await supabase
      .from("menu_items")
      .insert({
        name: item.name,
        price: item.price,
        category_id: item.category || null,
        is_available: item.status === "Ready",
        description: item.note || null,
      })
      .select("id")
      .single();

    if (itemError || !itemData) {
      throw new Error(itemError?.message || "Gagal menyimpan menu");
    }

    // 2. Batch-insert modifiers if any
    if (newModifiers.length > 0) {
      const modifiersPayload = newModifiers.map((mod) => ({
        menu_item_id: itemData.id,
        name: mod.name,
        price_delta: mod.priceDelta,
      }));
      const { error: modError } = await supabase
        .from("modifiers")
        .insert(modifiersPayload);
      if (modError) {
        console.error("Error inserting modifiers:", modError);
        throw new Error(modError.message || "Gagal menyimpan modifier");
      }
    }

    // 3. Refresh both states
    await Promise.all([fetchMenuItems(), fetchModifiers()]);
  };

  const updateMenuItemStatus = async (id: string, status: "Ready" | "Habis") => {
    const { error } = await supabase.from("menu_items").update({ is_available: status === "Ready" }).eq("id", id);
    if (!error) {
      setMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    }
  };

  const deleteMenuItem = async (id: string) => {
    const { error } = await supabase.from("menu_items").update({ is_archived: true }).eq("id", id);
    if (!error) setMenuItems((prev) => prev.filter((m) => m.id !== id));
  };

  // ── Discount mutations ───────────────────────────────────────────────────────

  const addDiscount = async (item: Omit<Discount, "id">) => {
    const { error } = await supabase.from("discounts").insert({
      name: item.name,
      type: item.type,
      value: item.value,
      is_active: item.isActive,
      expires_at: item.expiresAt || null,
    });
    if (!error) await fetchDiscounts();
  };

  const toggleDiscountActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from("discounts").update({ is_active: isActive }).eq("id", id);
    if (!error) {
      setDiscounts((prev) => prev.map((d) => (d.id === id ? { ...d, isActive } : d)));
    }
  };

  const deleteDiscount = async (id: string) => {
    const { error } = await supabase.from("discounts").delete().eq("id", id);
    if (!error) setDiscounts((prev) => prev.filter((d) => d.id !== id));
  };

  // ── Modifier mutations ───────────────────────────────────────────────────────

  const addModifier = async (menuItemId: string, name: string, priceDelta: number) => {
    const { data, error } = await supabase
      .from("modifiers")
      .insert({ menu_item_id: menuItemId, name, price_delta: priceDelta })
      .select()
      .single();
    if (error) throw new Error(error.message);
    if (data) {
      setModifiers((prev) => [
        ...prev,
        { id: data.id, menuItemId: data.menu_item_id, name: data.name, priceDelta: Number(data.price_delta) },
      ]);
    }
  };

  const updateModifier = async (modifierId: string, name: string, priceDelta: number) => {
    const { error } = await supabase
      .from("modifiers")
      .update({ name, price_delta: priceDelta })
      .eq("id", modifierId);
    if (error) throw new Error(error.message);
    setModifiers((prev) =>
      prev.map((m) => (m.id === modifierId ? { ...m, name, priceDelta } : m))
    );
  };

  const deleteModifier = async (modifierId: string) => {
    const { error } = await supabase.from("modifiers").delete().eq("id", modifierId);
    if (error) throw new Error(error.message);
    setModifiers((prev) => prev.filter((m) => m.id !== modifierId));
  };

  // ── Complete Order mutations ───────────────────────────────────────────────

  const addCompleteOrder = async (
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
    },
    items: {
      menuItemId: string;
      quantity: number;
      unitPrice: number;
      notes?: string;
      selectedModifiers?: Modifier[];
    }[]
  ) => {
    // 1. Insert order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        discount_id: order.discountId || null,
        order_type: order.orderType,
        status: "paid",
        subtotal: order.subtotal,
        discount_amount: order.discountAmount,
        tax: order.tax,
        total: order.total,
        payment_method: order.paymentMethod,
        amount_paid: order.amountPaid || order.total,
        change_given: order.changeGiven || 0,
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error("Error inserting order:", orderError);
      throw new Error(orderError?.message || "Failed to create order");
    }

    const orderId = orderData.id;

    // 2. Insert items and modifiers
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

      const orderItemId = itemData.id;

      // 3. Insert modifiers
      if (item.selectedModifiers && item.selectedModifiers.length > 0) {
        const modifiersToInsert = item.selectedModifiers.map((mod) => ({
          order_item_id: orderItemId,
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

    // Refresh orders
    await fetchOrders();
  };

  return (
    <POSContext.Provider
      value={{
        session,
        orders,
        ordersLoading,
        addOrder,
        updateOrderStatus,
        addMenuItemWithModifiers,
        menuItems,
        menuLoading,
        addMenuItem,
        updateMenuItemStatus,
        deleteMenuItem,
        discounts,
        discountsLoading,
        addDiscount,
        toggleDiscountActive,
        deleteDiscount,
        categories,
        categoriesLoading,
        modifiers,
        modifiersLoading,
        addModifier,
        updateModifier,
        deleteModifier,
        addCompleteOrder,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const ctx = useContext(POSContext);
  if (!ctx) throw new Error("usePOS must be used within POSProvider");
  return ctx;
}
