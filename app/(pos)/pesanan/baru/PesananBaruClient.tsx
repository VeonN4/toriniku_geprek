"use client";

import { useMemo, useReducer } from "react";
import { useRouter } from "next/navigation";
import { usePOS, MenuItem, Modifier } from "../../../context/POSContext";
import { CartItem } from "./cart-item-card";
import { MenuHeader } from "./menu-header";
import { MenuGrid } from "./menu-grid";
import CartArea from "./cart-area";

interface CartState {
  cart: CartItem[];
  orderType: "dine_in" | "takeaway";
  selectedDiscountId: string;
  paymentMethod: "cash" | "qris";
  amountPaid: string;
}

type CartAction =
  | {
      type: "ADD_TO_CART";
      item: MenuItem;
      selectedModifiers: Modifier[];
      notes: string;
    }
  | { type: "UPDATE_QUANTITY"; cartId: string; delta: number }
  | { type: "REMOVE_ITEM"; cartId: string }
  | { type: "SET_ORDER_TYPE"; payload: "dine_in" | "takeaway" }
  | { type: "SET_DISCOUNT_ID"; payload: string }
  | { type: "SET_PAYMENT_METHOD"; payload: "cash" | "qris" }
  | { type: "SET_AMOUNT_PAID"; payload: string }
  | { type: "CLEAR_CART" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const modString = action.selectedModifiers
        .map((m) => m.id)
        .sort()
        .join("-");
      const cartId = `${action.item.id}-${modString}-${action.notes}`;
      const existing = state.cart.find((i) => i.cartId === cartId);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((i) =>
            i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      return {
        ...state,
        cart: [
          ...state.cart,
          {
            cartId,
            item: action.item as CartItem["item"],
            quantity: 1,
            selectedModifiers:
              action.selectedModifiers as CartItem["selectedModifiers"],
            customNotes: action.notes,
          },
        ],
      };
    }
    case "UPDATE_QUANTITY":
      return {
        ...state,
        cart: state.cart.reduce((acc, i) => {
          if (i.cartId === action.cartId) {
            const updated = { ...i, quantity: i.quantity + action.delta };
            if (updated.quantity > 0) acc.push(updated);
          } else {
            acc.push(i);
          }
          return acc;
        }, [] as CartItem[]),
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        cart: state.cart.filter((i) => i.cartId !== action.cartId),
      };
    case "SET_ORDER_TYPE":
      return { ...state, orderType: action.payload };
    case "SET_DISCOUNT_ID":
      return { ...state, selectedDiscountId: action.payload };
    case "SET_PAYMENT_METHOD":
      return { ...state, paymentMethod: action.payload, amountPaid: "" };
    case "SET_AMOUNT_PAID":
      return { ...state, amountPaid: action.payload };
    case "CLEAR_CART":
      return { ...initialCartState };
    default:
      return state;
  }
}

const initialCartState: CartState = {
  cart: [],
  orderType: "dine_in",
  selectedDiscountId: "",
  paymentMethod: "cash",
  amountPaid: "",
};

interface UIState {
  selectedCategoryId: string;
  searchQuery: string;
  cartOpen: boolean;
  success: boolean;
  error: string;
  isSubmitting: boolean;
  isForLater: boolean;
  activeItemForModifiers: MenuItem | null;
  tempSelectedModifiers: Modifier[];
  tempNotes: string;
}

type UIAction =
  | { type: "SET_CATEGORY"; payload: string }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "TOGGLE_CART"; payload?: boolean }
  | { type: "SET_SUCCESS"; payload: boolean }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_FOR_LATER"; payload: boolean }
  | { type: "OPEN_MODIFIERS"; item: MenuItem }
  | { type: "SET_TEMP_MODIFIERS"; payload: Modifier[] }
  | { type: "SET_TEMP_NOTES"; payload: string }
  | { type: "CLOSE_MODIFIERS" };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "SET_CATEGORY":
      return { ...state, selectedCategoryId: action.payload };
    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload };
    case "TOGGLE_CART":
      return { ...state, cartOpen: action.payload ?? !state.cartOpen };
    case "SET_SUCCESS":
      return { ...state, success: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.payload };
    case "SET_FOR_LATER":
      return { ...state, isForLater: action.payload };
    case "OPEN_MODIFIERS":
      return {
        ...state,
        activeItemForModifiers: action.item,
        tempSelectedModifiers: [],
        tempNotes: "",
      };
    case "SET_TEMP_MODIFIERS":
      return { ...state, tempSelectedModifiers: action.payload };
    case "SET_TEMP_NOTES":
      return { ...state, tempNotes: action.payload };
    case "CLOSE_MODIFIERS":
      return { ...state, activeItemForModifiers: null };
    default:
      return state;
  }
}

const initialUIState: UIState = {
  selectedCategoryId: "all",
  searchQuery: "",
  cartOpen: false,
  success: false,
  error: "",
  isSubmitting: false,
  isForLater: false,
  activeItemForModifiers: null,
  tempSelectedModifiers: [],
  tempNotes: "",
};

export default function PesananBaruClient() {
  const router = useRouter();
  const {
    menuItems,
    menuLoading,
    categories,
    categoriesLoading,
    modifiers,
    discounts,
    discountsLoading,
    addCompleteOrder,
  } = usePOS();

  const [cartState, dispatchCart] = useReducer(cartReducer, initialCartState);
  const [ui, dispatchUI] = useReducer(uiReducer, initialUIState);

  const currentItemModifiers = useMemo(() => {
    const activeItem = ui.activeItemForModifiers;
    if (!activeItem) return [];
    return modifiers.filter((mod) => mod.menuItemId === activeItem.id);
  }, [ui.activeItemForModifiers, modifiers]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCategory =
        ui.selectedCategoryId === "all" ||
        item.category === ui.selectedCategoryId;
      const matchSearch = item.name
        .toLowerCase()
        .includes(ui.searchQuery.toLowerCase());
      return matchCategory && matchSearch && item.status === "Ready";
    });
  }, [menuItems, ui.selectedCategoryId, ui.searchQuery]);

  const activeDiscounts = useMemo(() => {
    return discounts.filter((d) => {
      if (!d.isActive) return false;
      if (d.expiresAt && new Date(d.expiresAt).getTime() < new Date().getTime())
        return false;
      return true;
    });
  }, [discounts]);

  const handleItemClick = (item: MenuItem) => {
    const itemMods = modifiers.filter((mod) => mod.menuItemId === item.id);
    if (itemMods.length > 0) {
      dispatchUI({ type: "OPEN_MODIFIERS", item });
    } else {
      dispatchCart({
        type: "ADD_TO_CART",
        item,
        selectedModifiers: [],
        notes: "",
      });
    }
  };

  const handleConfirmModifiers = () => {
    if (ui.activeItemForModifiers) {
      dispatchCart({
        type: "ADD_TO_CART",
        item: ui.activeItemForModifiers,
        selectedModifiers: ui.tempSelectedModifiers,
        notes: ui.tempNotes,
      });
      dispatchUI({ type: "CLOSE_MODIFIERS" });
    }
  };

  const handleToggleModifier = (modId: string) => {
    const exists = ui.tempSelectedModifiers.some((m) => m.id === modId);
    const next = exists
      ? ui.tempSelectedModifiers.filter((m) => m.id !== modId)
      : [...ui.tempSelectedModifiers, modifiers.find((m) => m.id === modId)!];
    dispatchUI({ type: "SET_TEMP_MODIFIERS", payload: next });
  };

  const updateQuantity = (cartId: string, delta: number) => {
    dispatchCart({ type: "UPDATE_QUANTITY", cartId, delta });
  };

  const removeCartItem = (cartId: string) => {
    dispatchCart({ type: "REMOVE_ITEM", cartId });
  };

  const subtotal = useMemo(() => {
    return cartState.cart.reduce((sum, entry) => {
      const itemPrice = entry.item.price;
      const modsPrice = entry.selectedModifiers.reduce(
        (s, m) => s + m.priceDelta,
        0,
      );
      return sum + (itemPrice + modsPrice) * entry.quantity;
    }, 0);
  }, [cartState.cart]);

  const selectedDiscount = useMemo(() => {
    return activeDiscounts.find((d) => d.id === cartState.selectedDiscountId);
  }, [cartState.selectedDiscountId, activeDiscounts]);

  const discountAmount = useMemo(() => {
    if (!selectedDiscount) return 0;
    if (selectedDiscount.type === "percent") {
      return (subtotal * selectedDiscount.value) / 100;
    } else {
      return Math.min(selectedDiscount.value, subtotal);
    }
  }, [subtotal, selectedDiscount]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const changeGiven = useMemo(() => {
    const paid = parseFloat(cartState.amountPaid.replace(/\D/g, ""));
    if (isNaN(paid) || paid < total) return 0;
    return paid - total;
  }, [cartState.amountPaid, total]);

  const handleCheckout = async () => {
    if (cartState.cart.length === 0) {
      dispatchUI({ type: "SET_ERROR", payload: "Keranjang pesanan kosong" });
      return;
    }

    let paidVal = 0;
    if (!ui.isForLater) {
      paidVal = parseFloat(cartState.amountPaid.replace(/\D/g, ""));
      if (isNaN(paidVal) || paidVal < total) {
        dispatchUI({
          type: "SET_ERROR",
          payload: "Uang yang dibayarkan kurang",
        });
        return;
      }
    }

    dispatchUI({ type: "SET_SUBMITTING", payload: true });
    dispatchUI({ type: "SET_ERROR", payload: "" });

    try {
      const orderPayload = {
        discountId: cartState.selectedDiscountId || undefined,
        orderType: cartState.orderType,
        subtotal,
        discountAmount,
        tax: 0,
        total,
        paymentMethod: cartState.paymentMethod,
        amountPaid: ui.isForLater ? undefined : paidVal,
        changeGiven: ui.isForLater ? undefined : changeGiven,
        isForLater: ui.isForLater,
      };

      const itemsPayload = cartState.cart.map((entry) => ({
        menuItemId: entry.item.id,
        quantity: entry.quantity,
        unitPrice: entry.item.price,
        notes: entry.customNotes,
        selectedModifiers: entry.selectedModifiers.map((m) => ({
          ...m,
          menuItemId: entry.item.id,
        })),
      }));

      await addCompleteOrder(orderPayload, itemsPayload);
      dispatchUI({ type: "SET_SUCCESS", payload: true });
      dispatchCart({ type: "CLEAR_CART" });

      setTimeout(() => {
        router.push("/pesanan");
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memproses transaksi kasir";
      dispatchUI({
        type: "SET_ERROR",
        payload: message,
      });
    } finally {
      dispatchUI({ type: "SET_SUBMITTING", payload: false });
    }
  };

  const handleQuickCash = (amt: number) => {
    dispatchCart({
      type: "SET_AMOUNT_PAID",
      payload: amt.toLocaleString("id-ID"),
    });
    dispatchUI({ type: "SET_ERROR", payload: "" });
  };

  const totalItems = cartState.cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <div className="relative flex flex-col md:flex-row min-h-dvh md:h-screen md:overflow-hidden bg-surface-container-low font-sans">
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto pb-28 md:pb-6 md:pr-108 transition-all">
        <MenuHeader
          searchQuery={ui.searchQuery}
          onSearchChange={(v) => dispatchUI({ type: "SET_SEARCH", payload: v })}
          selectedCategoryId={ui.selectedCategoryId}
          onCategoryChange={(v) =>
            dispatchUI({ type: "SET_CATEGORY", payload: v })
          }
          categories={categories}
          categoriesLoading={categoriesLoading}
          onBack={() => router.push("/pesanan")}
        />

        <MenuGrid
          menuLoading={menuLoading}
          filteredMenuItems={filteredMenuItems}
          handleItemClick={handleItemClick}
        />
      </div>

      <CartArea
        totalItems={totalItems}
        total={total}
        subtotal={subtotal}
        discountAmount={discountAmount}
        changeGiven={changeGiven}
        cart={cartState.cart}
        orderType={cartState.orderType}
        selectedDiscountId={cartState.selectedDiscountId}
        activeDiscounts={activeDiscounts}
        discountsLoading={discountsLoading}
        paymentMethod={cartState.paymentMethod}
        amountPaid={cartState.amountPaid}
        error={ui.error}
        isSubmitting={ui.isSubmitting}
        success={ui.success}
        isForLater={ui.isForLater}
        cartOpen={ui.cartOpen}
        activeItemForModifiers={ui.activeItemForModifiers}
        currentItemModifiers={currentItemModifiers}
        tempSelectedModifierIds={ui.tempSelectedModifiers.map((m) => m.id)}
        tempNotes={ui.tempNotes}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeCartItem}
        onSetOrderType={(v) =>
          dispatchCart({ type: "SET_ORDER_TYPE", payload: v })
        }
        onSetDiscountId={(v) =>
          dispatchCart({ type: "SET_DISCOUNT_ID", payload: v })
        }
        onSetPaymentMethod={(v) =>
          dispatchCart({ type: "SET_PAYMENT_METHOD", payload: v })
        }
        onSetAmountPaid={(v) =>
          dispatchCart({ type: "SET_AMOUNT_PAID", payload: v })
        }
        onQuickCash={handleQuickCash}
        onCheckout={handleCheckout}
        onToggleCart={(v) =>
          dispatchUI({ type: "TOGGLE_CART", payload: v ?? !ui.cartOpen })
        }
        onSetIsForLater={(v) =>
          dispatchUI({ type: "SET_FOR_LATER", payload: v })
        }
        onSetError={(msg) => dispatchUI({ type: "SET_ERROR", payload: msg })}
        onToggleModifier={handleToggleModifier}
        onNotesChange={(notes) =>
          dispatchUI({ type: "SET_TEMP_NOTES", payload: notes })
        }
        onConfirmModifiers={handleConfirmModifiers}
        onCloseModifiers={() => dispatchUI({ type: "CLOSE_MODIFIERS" })}
      />
    </div>
  );
}
