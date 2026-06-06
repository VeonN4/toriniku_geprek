"use client";

import React, {
  createContext,
  use,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
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
  deleteOrder: (id: string) => Promise<void>;
  menuItems: MenuItem[];
  menuLoading: boolean;
  addMenuItem: (item: Omit<MenuItem, "id">) => Promise<void>;
  addMenuItemWithModifiers: (
    item: Omit<MenuItem, "id">,
    modifiers: { name: string; priceDelta: number }[]
  ) => Promise<void>;
  updateMenuItemStatus: (id: string, status: "Ready" | "Habis") => Promise<void>;
  updateMenuItem: (id: string, fields: { name?: string; price?: number; category?: string; note?: string; status?: "Ready" | "Habis" }) => Promise<void>;
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

interface POSState {
  session: Session | null;
  orders: Order[];
  ordersLoading: boolean;
  menuItems: MenuItem[];
  menuLoading: boolean;
  discounts: Discount[];
  discountsLoading: boolean;
  categories: Category[];
  categoriesLoading: boolean;
  modifiers: Modifier[];
  modifiersLoading: boolean;
}

const initialState: POSState = {
  session: null,
  orders: [],
  ordersLoading: true,
  menuItems: [],
  menuLoading: true,
  discounts: [],
  discountsLoading: true,
  categories: [],
  categoriesLoading: true,
  modifiers: [],
  modifiersLoading: true,
};

type POSAction =
  | { type: "SET_SESSION"; session: Session | null }
  | { type: "SET_ORDERS"; orders: Order[] }
  | { type: "SET_ORDERS_LOADING"; loading: boolean }
  | { type: "SET_MENU_ITEMS"; menuItems: MenuItem[] }
  | { type: "SET_MENU_LOADING"; loading: boolean }
  | { type: "SET_DISCOUNTS"; discounts: Discount[] }
  | { type: "SET_DISCOUNTS_LOADING"; loading: boolean }
  | { type: "SET_CATEGORIES"; categories: Category[] }
  | { type: "SET_CATEGORIES_LOADING"; loading: boolean }
  | { type: "SET_MODIFIERS"; modifiers: Modifier[] }
  | { type: "SET_MODIFIERS_LOADING"; loading: boolean }
  | { type: "UPDATE_ORDER"; id: string; updates: Partial<Order> }
  | { type: "REMOVE_ORDER"; id: string }
  | { type: "UPDATE_MENU_ITEM"; id: string; updates: Partial<MenuItem> }
  | { type: "REMOVE_MENU_ITEM"; id: string }
  | { type: "ADD_MODIFIER"; modifier: Modifier }
  | { type: "UPDATE_MODIFIER"; id: string; name: string; priceDelta: number }
  | { type: "REMOVE_MODIFIER"; id: string }
  | { type: "TOGGLE_DISCOUNT"; id: string; isActive: boolean }
  | { type: "REMOVE_DISCOUNT"; id: string }
  | { type: "SET_ALL_LOADING"; loading: boolean };

function posReducer(state: POSState, action: POSAction): POSState {
  switch (action.type) {
    case "SET_SESSION":
      return { ...state, session: action.session };
    case "SET_ORDERS":
      return { ...state, orders: action.orders };
    case "SET_ORDERS_LOADING":
      return { ...state, ordersLoading: action.loading };
    case "SET_MENU_ITEMS":
      return { ...state, menuItems: action.menuItems };
    case "SET_MENU_LOADING":
      return { ...state, menuLoading: action.loading };
    case "SET_DISCOUNTS":
      return { ...state, discounts: action.discounts };
    case "SET_DISCOUNTS_LOADING":
      return { ...state, discountsLoading: action.loading };
    case "SET_CATEGORIES":
      return { ...state, categories: action.categories };
    case "SET_CATEGORIES_LOADING":
      return { ...state, categoriesLoading: action.loading };
    case "SET_MODIFIERS":
      return { ...state, modifiers: action.modifiers };
    case "SET_MODIFIERS_LOADING":
      return { ...state, modifiersLoading: action.loading };
    case "SET_ALL_LOADING":
      return {
        ...state,
        ordersLoading: action.loading,
        menuLoading: action.loading,
        discountsLoading: action.loading,
        categoriesLoading: action.loading,
        modifiersLoading: action.loading,
      };
    case "UPDATE_ORDER":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.id ? { ...o, ...action.updates } : o
        ),
      };
    case "REMOVE_ORDER":
      return {
        ...state,
        orders: state.orders.filter((o) => o.id !== action.id),
      };
    case "UPDATE_MENU_ITEM":
      return {
        ...state,
        menuItems: state.menuItems.map((m) =>
          m.id === action.id ? { ...m, ...action.updates } : m
        ),
      };
    case "REMOVE_MENU_ITEM":
      return {
        ...state,
        menuItems: state.menuItems.filter((m) => m.id !== action.id),
      };
    case "ADD_MODIFIER":
      return {
        ...state,
        modifiers: [...state.modifiers, action.modifier],
      };
    case "UPDATE_MODIFIER":
      return {
        ...state,
        modifiers: state.modifiers.map((m) =>
          m.id === action.id ? { ...m, name: action.name, priceDelta: action.priceDelta } : m
        ),
      };
    case "REMOVE_MODIFIER":
      return {
        ...state,
        modifiers: state.modifiers.filter((m) => m.id !== action.id),
      };
    case "TOGGLE_DISCOUNT":
      return {
        ...state,
        discounts: state.discounts.map((d) =>
          d.id === action.id ? { ...d, isActive: action.isActive } : d
        ),
      };
    case "REMOVE_DISCOUNT":
      return {
        ...state,
        discounts: state.discounts.filter((d) => d.id !== action.id),
      };
    default:
      return state;
  }
}

export function POSProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(posReducer, initialState);
  const {
    session,
    orders,
    ordersLoading,
    menuItems,
    menuLoading,
    discounts,
    discountsLoading,
    categories,
    categoriesLoading,
    modifiers,
    modifiersLoading,
  } = state;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch({ type: "SET_SESSION", session });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      dispatch({ type: "SET_SESSION", session });
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    const loadAll = async () => {
      dispatch({ type: "SET_ALL_LOADING", loading: true });
      const [orders, menuItems, discounts, categories, modifiers] = await Promise.all([
        ordersApi.fetchOrders(),
        menuItemsApi.fetchMenuItems(),
        discountsApi.fetchDiscounts(),
        categoriesApi.fetchCategories(),
        modifiersApi.fetchModifiers(),
      ]);
      dispatch({ type: "SET_ORDERS", orders });
      dispatch({ type: "SET_MENU_ITEMS", menuItems });
      dispatch({ type: "SET_DISCOUNTS", discounts });
      dispatch({ type: "SET_CATEGORIES", categories });
      dispatch({ type: "SET_MODIFIERS", modifiers });
      dispatch({ type: "SET_ALL_LOADING", loading: false });
    };
    loadAll();
  }, [session]);

  const fetchOrders = useCallback(async () => {
    dispatch({ type: "SET_ORDERS_LOADING", loading: true });
    const data = await ordersApi.fetchOrders();
    dispatch({ type: "SET_ORDERS", orders: data });
    dispatch({ type: "SET_ORDERS_LOADING", loading: false });
  }, []);

  const fetchMenuItems = useCallback(async () => {
    dispatch({ type: "SET_MENU_LOADING", loading: true });
    const data = await menuItemsApi.fetchMenuItems();
    dispatch({ type: "SET_MENU_ITEMS", menuItems: data });
    dispatch({ type: "SET_MENU_LOADING", loading: false });
  }, []);

  const fetchDiscounts = useCallback(async () => {
    dispatch({ type: "SET_DISCOUNTS_LOADING", loading: true });
    const data = await discountsApi.fetchDiscounts();
    dispatch({ type: "SET_DISCOUNTS", discounts: data });
    dispatch({ type: "SET_DISCOUNTS_LOADING", loading: false });
  }, []);

  const fetchCategories = useCallback(async () => {
    dispatch({ type: "SET_CATEGORIES_LOADING", loading: true });
    const data = await categoriesApi.fetchCategories();
    dispatch({ type: "SET_CATEGORIES", categories: data });
    dispatch({ type: "SET_CATEGORIES_LOADING", loading: false });
  }, []);

  const fetchModifiers = useCallback(async () => {
    dispatch({ type: "SET_MODIFIERS_LOADING", loading: true });
    const data = await modifiersApi.fetchModifiers();
    dispatch({ type: "SET_MODIFIERS", modifiers: data });
    dispatch({ type: "SET_MODIFIERS_LOADING", loading: false });
  }, []);

  const value = useMemo(() => {
    const addOrder = async (order: Pick<Order, "customerName" | "items" | "notes" | "total">) => {
      await ordersApi.insertOrder({
        customerName: order.customerName,
        total: order.total,
      });
      await fetchOrders();
    };

    const updateOrderStatus = async (id: string, status: OrderStatus) => {
      await ordersApi.updateOrderStatus(id, status);
      dispatch({ type: "UPDATE_ORDER", id, updates: { status } });
    };

    const deleteOrder = async (id: string) => {
      await ordersApi.deleteOrder(id);
      dispatch({ type: "REMOVE_ORDER", id });
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
      dispatch({ type: "UPDATE_MENU_ITEM", id, updates: { status } });
    };

    const updateMenuItem = async (id: string, fields: { name?: string; price?: number; category?: string; note?: string; status?: "Ready" | "Habis" }) => {
      const dbFields: Record<string, unknown> = {};
      if (fields.name !== undefined) dbFields.name = fields.name;
      if (fields.price !== undefined) dbFields.price = fields.price;
      if (fields.category !== undefined) dbFields.category_id = fields.category || null;
      if (fields.note !== undefined) dbFields.description = fields.note || null;
      if (fields.status !== undefined) dbFields.is_available = fields.status === "Ready";
      if (Object.keys(dbFields).length > 0) {
        await menuItemsApi.updateMenuItem(id, dbFields);
      }
      const updates: Partial<MenuItem> = {};
      if (fields.name !== undefined) updates.name = fields.name;
      if (fields.price !== undefined) updates.price = fields.price;
      if (fields.category !== undefined) updates.category = fields.category;
      if (fields.note !== undefined) updates.note = fields.note;
      if (fields.status !== undefined) updates.status = fields.status;
      dispatch({ type: "UPDATE_MENU_ITEM", id, updates });
    };

    const deleteMenuItem = async (id: string) => {
      await menuItemsApi.archiveMenuItem(id);
      dispatch({ type: "REMOVE_MENU_ITEM", id });
    };

    const addDiscount = async (item: Omit<Discount, "id">) => {
      await discountsApi.insertDiscount(item);
      await fetchDiscounts();
    };

    const toggleDiscountActive = async (id: string, isActive: boolean) => {
      await discountsApi.toggleDiscountActive(id, isActive);
      dispatch({ type: "TOGGLE_DISCOUNT", id, isActive });
    };

    const updateDiscount = async (id: string, item: Omit<Discount, "id">) => {
      await discountsApi.updateDiscount(id, item);
      await fetchDiscounts();
    };

    const deleteDiscount = async (id: string) => {
      await discountsApi.deleteDiscount(id);
      dispatch({ type: "REMOVE_DISCOUNT", id });
    };

    const addModifier = async (menuItemId: string, name: string, priceDelta: number) => {
      const mod = await modifiersApi.insertModifier(menuItemId, name, priceDelta);
      dispatch({ type: "ADD_MODIFIER", modifier: mod });
    };

    const updateModifier = async (modifierId: string, name: string, priceDelta: number) => {
      await modifiersApi.updateModifier(modifierId, name, priceDelta);
      dispatch({ type: "UPDATE_MODIFIER", id: modifierId, name, priceDelta });
    };

    const deleteModifier = async (modifierId: string) => {
      await modifiersApi.deleteModifier(modifierId);
      dispatch({ type: "REMOVE_MODIFIER", id: modifierId });
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
      dispatch({
        type: "UPDATE_ORDER",
        id: orderId,
        updates: {
          status: "Selesai" as OrderStatus,
          paymentMethod: payment.paymentMethod,
        },
      });
    };

    return {
      session,
      orders,
      ordersLoading,
      addOrder,
      updateOrderStatus,
      deleteOrder,
      addMenuItemWithModifiers,
      menuItems,
      menuLoading,
      addMenuItem,
      updateMenuItemStatus,
      updateMenuItem,
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
    };
  }, [
    session,
    orders,
    ordersLoading,
    menuItems,
    menuLoading,
    discounts,
    discountsLoading,
    categories,
    categoriesLoading,
    modifiers,
    modifiersLoading,
    fetchOrders,
    fetchMenuItems,
    fetchDiscounts,
    fetchModifiers,
  ]);

  return (
    <POSContext.Provider value={value}>
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const ctx = use(POSContext);
  if (!ctx) throw new Error("usePOS must be used within POSProvider");
  return ctx;
}
