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
import type {
  OrderStatus,
  MenuItem,
  Order,
  Discount,
  Category,
  Modifier,
} from "../../lib/api/types";
import * as ordersApi from "../../lib/api/orders";
import * as menuItemsApi from "../../lib/api/menuItems";
import * as discountsApi from "../../lib/api/discounts";
import * as categoriesApi from "../../lib/api/categories";
import * as modifiersApi from "../../lib/api/modifiers";

export type { OrderStatus, MenuItem, Order, Discount, Category, Modifier };

const supabase = createClient();

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
  updateDiscount: (id: string, discount: Omit<Discount, "id">) => Promise<void>;
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
      isForLater?: boolean;
    },
    items: {
      menuItemId: string;
      quantity: number;
      unitPrice: number;
      notes?: string;
      selectedModifiers?: Modifier[];
    }[]
  ) => Promise<void>;
  settleOrder: (orderId: string, payment: { paymentMethod: "cash" | "qris"; amountPaid: number; changeGiven: number }) => Promise<void>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    const data = await ordersApi.fetchOrders();
    setOrders(data);
    setOrdersLoading(false);
  }, []);

  const fetchMenuItems = useCallback(async () => {
    setMenuLoading(true);
    const data = await menuItemsApi.fetchMenuItems();
    setMenuItems(data);
    setMenuLoading(false);
  }, []);

  const fetchDiscounts = useCallback(async () => {
    setDiscountsLoading(true);
    const data = await discountsApi.fetchDiscounts();
    setDiscounts(data);
    setDiscountsLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    const data = await categoriesApi.fetchCategories();
    setCategories(data);
    setCategoriesLoading(false);
  }, []);

  const fetchModifiers = useCallback(async () => {
    setModifiersLoading(true);
    const data = await modifiersApi.fetchModifiers();
    setModifiers(data);
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

  const addOrder = async (order: Pick<Order, "customerName" | "items" | "notes" | "total">) => {
    await ordersApi.insertOrder({
      customerName: order.customerName,
      total: order.total,
    });
    await fetchOrders();
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    await ordersApi.updateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const addMenuItem = async (item: Omit<MenuItem, "id">) => {
    await menuItemsApi.insertMenuItem(item);
    await fetchMenuItems();
  };

  const addMenuItemWithModifiers = async (
    item: Omit<MenuItem, "id">,
    newModifiers: { name: string; priceDelta: number }[]
  ) => {
    await menuItemsApi.insertMenuItemWithModifiers(item, newModifiers);
    await Promise.all([fetchMenuItems(), fetchModifiers()]);
  };

  const updateMenuItemStatus = async (id: string, status: "Ready" | "Habis") => {
    await menuItemsApi.updateMenuItemStatus(id, status);
    setMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const deleteMenuItem = async (id: string) => {
    await menuItemsApi.archiveMenuItem(id);
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
  };

  const addDiscount = async (item: Omit<Discount, "id">) => {
    await discountsApi.insertDiscount(item);
    await fetchDiscounts();
  };

  const toggleDiscountActive = async (id: string, isActive: boolean) => {
    await discountsApi.toggleDiscountActive(id, isActive);
    setDiscounts((prev) => prev.map((d) => (d.id === id ? { ...d, isActive } : d)));
  };

  const updateDiscount = async (id: string, item: Omit<Discount, "id">) => {
    await discountsApi.updateDiscount(id, item);
    await fetchDiscounts();
  };

  const deleteDiscount = async (id: string) => {
    await discountsApi.deleteDiscount(id);
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
  };

  const addModifier = async (menuItemId: string, name: string, priceDelta: number) => {
    const mod = await modifiersApi.insertModifier(menuItemId, name, priceDelta);
    setModifiers((prev) => [...prev, mod]);
  };

  const updateModifier = async (modifierId: string, name: string, priceDelta: number) => {
    await modifiersApi.updateModifier(modifierId, name, priceDelta);
    setModifiers((prev) =>
      prev.map((m) => (m.id === modifierId ? { ...m, name, priceDelta } : m))
    );
  };

  const deleteModifier = async (modifierId: string) => {
    await modifiersApi.deleteModifier(modifierId);
    setModifiers((prev) => prev.filter((m) => m.id !== modifierId));
  };

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
      isForLater?: boolean;
    },
    items: {
      menuItemId: string;
      quantity: number;
      unitPrice: number;
      notes?: string;
      selectedModifiers?: Modifier[];
    }[]
  ) => {
    await ordersApi.insertCompleteOrder(order, items);
    await fetchOrders();
  };

  const settleOrder = async (
    orderId: string,
    payment: { paymentMethod: "cash" | "qris"; amountPaid: number; changeGiven: number }
  ) => {
    await ordersApi.settleOrder(orderId, payment);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "Selesai",
              paymentMethod: payment.paymentMethod,
            }
          : o
      )
    );
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
        updateDiscount,
        deleteDiscount,
        categories,
        categoriesLoading,
        modifiers,
        modifiersLoading,
        addModifier,
        updateModifier,
        deleteModifier,
        addCompleteOrder,
        settleOrder,
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
