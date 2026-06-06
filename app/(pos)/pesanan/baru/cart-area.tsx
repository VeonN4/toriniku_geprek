"use client";

import { CartItem } from "./cart-item-card";
import { MobileCartSheet } from "./mobile-cart-sheet";
import { DesktopPanel } from "./desktop-panel";
import ModifiersModal from "./modifiers-modal";
import { MenuItem, Modifier, Discount } from "../../../context/POSContext";
import { formatRupiah } from "../../../../lib/utils/format";

interface CartAreaProps {
  totalItems: number;
  total: number;
  subtotal: number;
  discountAmount: number;
  changeGiven: number;
  cart: CartItem[];
  orderType: "dine_in" | "takeaway";
  selectedDiscountId: string;
  activeDiscounts: Discount[];
  discountsLoading: boolean;
  paymentMethod: "cash" | "qris";
  amountPaid: string;
  error: string;
  isSubmitting: boolean;
  success: boolean;
  isForLater: boolean;
  cartOpen: boolean;
  activeItemForModifiers: MenuItem | null;
  currentItemModifiers: Modifier[];
  tempSelectedModifierIds: string[];
  tempNotes: string;
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onSetOrderType: (v: "dine_in" | "takeaway") => void;
  onSetDiscountId: (v: string) => void;
  onSetPaymentMethod: (v: "cash" | "qris") => void;
  onSetAmountPaid: (v: string) => void;
  onQuickCash: (amt: number) => void;
  onCheckout: () => void;
  onToggleCart: (v?: boolean) => void;
  onSetIsForLater: (v: boolean) => void;
  onSetError: (msg: string) => void;
  onToggleModifier: (modId: string) => void;
  onNotesChange: (notes: string) => void;
  onConfirmModifiers: () => void;
  onCloseModifiers: () => void;
}

export default function CartArea({
  totalItems,
  total,
  subtotal,
  discountAmount,
  changeGiven,
  cart,
  orderType,
  selectedDiscountId,
  activeDiscounts,
  discountsLoading,
  paymentMethod,
  amountPaid,
  error,
  isSubmitting,
  success,
  isForLater,
  cartOpen,
  activeItemForModifiers,
  currentItemModifiers,
  tempSelectedModifierIds,
  tempNotes,
  onUpdateQuantity,
  onRemoveItem,
  onSetOrderType,
  onSetDiscountId,
  onSetPaymentMethod,
  onSetAmountPaid,
  onQuickCash,
  onCheckout,
  onToggleCart,
  onSetIsForLater,
  onSetError,
  onToggleModifier,
  onNotesChange,
  onConfirmModifiers,
  onCloseModifiers,
}: CartAreaProps) {
  return (
    <>
      {totalItems > 0 && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
          <button type="button"
            onClick={() => onToggleCart(true)}
            className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-bold rounded-xl px-5 py-4 flex items-center justify-between shadow-active cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg px-2.5 py-1 text-sm font-bold">
                {totalItems}
              </div>
              <span className="text-sm font-bold">
                Detail Pesanan
              </span>
            </div>
            <span className="text-sm font-bold">{formatRupiah(total)}</span>
          </button>
        </div>
      )}

      <MobileCartSheet
        cartOpen={cartOpen}
        cart={cart}
        orderType={orderType}
        selectedDiscountId={selectedDiscountId}
        activeDiscounts={activeDiscounts}
        paymentMethod={paymentMethod}
        amountPaid={amountPaid}
        changeGiven={changeGiven}
        total={total}
        subtotal={subtotal}
        discountAmount={discountAmount}
        error={error}
        isSubmitting={isSubmitting}
        success={success}
        isForLater={isForLater}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
        onSetOrderType={onSetOrderType}
        onSetDiscountId={onSetDiscountId}
        onSetPaymentMethod={onSetPaymentMethod}
        onSetAmountPaid={onSetAmountPaid}
        onQuickCash={onQuickCash}
        onCheckout={onCheckout}
        onClose={() => onToggleCart(false)}
        onSetIsForLater={onSetIsForLater}
        onSetError={onSetError}
      />

      <DesktopPanel
        cart={cart}
        orderType={orderType}
        selectedDiscountId={selectedDiscountId}
        activeDiscounts={activeDiscounts}
        discountsLoading={discountsLoading}
        paymentMethod={paymentMethod}
        amountPaid={amountPaid}
        changeGiven={changeGiven}
        total={total}
        subtotal={subtotal}
        discountAmount={discountAmount}
        error={error}
        isSubmitting={isSubmitting}
        success={success}
        isForLater={isForLater}
        totalItems={totalItems}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
        onSetOrderType={onSetOrderType}
        onSetDiscountId={onSetDiscountId}
        onSetPaymentMethod={onSetPaymentMethod}
        onSetAmountPaid={onSetAmountPaid}
        onQuickCash={onQuickCash}
        onCheckout={onCheckout}
        onSetIsForLater={onSetIsForLater}
        onSetError={onSetError}
      />

      {activeItemForModifiers && (
        <ModifiersModal
          item={activeItemForModifiers}
          modifiers={currentItemModifiers}
          selectedModifierIds={tempSelectedModifierIds}
          tempNotes={tempNotes}
          onToggleModifier={onToggleModifier}
          onNotesChange={onNotesChange}
          onConfirm={onConfirmModifiers}
          onClose={onCloseModifiers}
        />
      )}
    </>
  );
}
