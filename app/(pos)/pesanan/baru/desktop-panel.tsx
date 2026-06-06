"use client";


import { formatRupiah, formatPriceInput } from "../../../../lib/utils/format";
import type { CartItem } from "./cart-item-card";
import { CartItemCard } from "./cart-item-card";
import type { Discount } from "../../../context/POSContext";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );
}

interface DesktopPanelProps {
  cart: CartItem[];
  orderType: "dine_in" | "takeaway";
  selectedDiscountId: string;
  activeDiscounts: Discount[];
  discountsLoading: boolean;
  paymentMethod: "cash" | "qris";
  amountPaid: string;
  changeGiven: number;
  total: number;
  subtotal: number;
  discountAmount: number;
  error: string;
  isSubmitting: boolean;
  success: boolean;
  isForLater: boolean;
  totalItems: number;
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onSetOrderType: (type: "dine_in" | "takeaway") => void;
  onSetDiscountId: (id: string) => void;
  onSetPaymentMethod: (method: "cash" | "qris") => void;
  onSetAmountPaid: (val: string) => void;
  onQuickCash: (amt: number) => void;
  onCheckout: () => void;
  onSetIsForLater: (v: boolean) => void;
  onSetError: (msg: string) => void;
}

export function DesktopPanel({
  cart,
  orderType,
  selectedDiscountId,
  activeDiscounts,
  discountsLoading,
  paymentMethod,
  amountPaid,
  changeGiven,
  total,
  subtotal,
  discountAmount,
  error,
  isSubmitting,
  success,
  isForLater,
  totalItems,
  onUpdateQuantity,
  onRemoveItem,
  onSetOrderType,
  onSetDiscountId,
  onSetPaymentMethod,
  onSetAmountPaid,
  onQuickCash,
  onCheckout,
  onSetIsForLater,
  onSetError,
}: DesktopPanelProps) {
  return (
    <div className="hidden md:flex absolute top-4 right-4 bottom-4 w-[25rem] bg-surface-container-lowest p-5 border border-surface-container-high flex-col justify-between shadow-ambient rounded-2xl z-30 transition-all">
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-surface-container-high pb-3 mb-4 flex-shrink-0">
          <h2 className="font-bold text-on-surface text-base uppercase tracking-wide">
            Detail Pesanan
          </h2>
          <span className="bg-surface-container text-on-surface-variant text-xs font-bold px-2.5 py-1 rounded-lg">
            {totalItems} item
          </span>
        </div>

        <div className="flex gap-2 mb-4 flex-shrink-0 p-1 bg-surface-container rounded-xl">
          <button type="button"
            onClick={() => onSetOrderType("dine_in")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              orderType === "dine_in"
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Dine In
          </button>
          <button type="button"
            onClick={() => onSetOrderType("takeaway")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              orderType === "takeaway"
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Bungkus
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-outline">
            <svg className="w-12 h-12 mb-2 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M8 12h8" />
            </svg>
            <p className="text-xs font-medium">Keranjang masih kosong</p>
          </div>
        ) : (
          <div className="space-y-3 mb-4 flex-1 overflow-y-auto pr-1">
            {cart.map((entry) => (
              <CartItemCard
                key={entry.cartId}
                entry={entry}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemoveItem}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-surface-container-high pt-4 bg-surface-container-lowest mt-auto space-y-3.5 flex-shrink-0">
        <div>
          <label htmlFor="discount-select-desktop" className="block text-xxs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Kupon Diskon
          </label>
          {discountsLoading ? (
            <Skeleton className="h-9 w-full rounded-xl" />
          ) : (
            <select
              id="discount-select-desktop"
              value={selectedDiscountId}
              onChange={(e) => {
                onSetDiscountId(e.target.value);
                onSetError("");
              }}
              className="w-full px-3 py-2.5 border border-outline rounded-xl text-xs font-medium text-on-surface focus:outline-none focus:border-primary bg-surface-container-lowest cursor-pointer transition-all"
            >
              <option value="">Pilih Kupon Diskon</option>
              {activeDiscounts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (
                  {d.type === "percent"
                    ? `${d.value}%`
                    : `-${formatRupiah(d.value)}`}
                  )
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-2 pb-3 text-xs text-on-surface-variant">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-on-surface">
              {formatRupiah(subtotal)}
            </span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-error font-semibold">
              <span>Diskon</span>
              <span>-{formatRupiah(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 mt-2 border-t border-outline-variant/40">
            <span className="text-sm font-bold text-on-surface">Total</span>
            <span className="text-base font-bold text-primary">
              {formatRupiah(total)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/50 bg-surface-container-low">
          <div>
            <p className="text-xs font-bold text-on-surface">Pesanan untuk nanti?</p>
            <p className="text-xxs text-on-surface-variant mt-0.5">
              Tandai sebagai Diproses, bayar belakangan
            </p>
          </div>
          <button
            type="button"
            aria-label="Toggle pesanan untuk nanti"
            onClick={() => onSetIsForLater(!isForLater)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
              isForLater ? "bg-amber-500" : "bg-outline/30"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                isForLater ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {!isForLater && (
          <>
            <div>
              <span className="block text-xxs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Metode Pembayaran
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSetPaymentMethod("cash");
                    onSetAmountPaid("");
                    onSetError("");
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === "cash"
                      ? "bg-primary text-on-primary shadow-active"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  Tunai
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSetPaymentMethod("qris");
                    onSetAmountPaid("");
                    onSetError("");
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === "qris"
                      ? "bg-primary text-on-primary shadow-active"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  QRIS
                </button>
              </div>
            </div>

            <div className="space-y-2 bg-surface-container-low p-3 rounded-xl border border-outline-variant/50">
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  type="button"
                  onClick={() => onQuickCash(total)}
                  className="bg-surface-container-lowest px-3 py-1.5 border border-outline rounded-full text-xxs font-bold text-on-surface-variant hover:bg-surface-container cursor-pointer whitespace-nowrap transition-colors"
                >
                  Uang Pas
                </button>
                {[20000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => onQuickCash(amt)}
                    className="bg-surface-container-lowest px-3 py-1.5 border border-outline rounded-full text-xxs font-bold text-on-surface-variant hover:bg-surface-container cursor-pointer whitespace-nowrap transition-colors"
                  >
                    {formatRupiah(amt)}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant font-bold">
                  Bayar Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  aria-label="Jumlah pembayaran"
                  value={amountPaid}
                  onChange={(e) => {
                    onSetAmountPaid(formatPriceInput(e.target.value));
                    onSetError("");
                  }}
                  placeholder="Masukkan nominal"
                  className="w-full pl-16 pr-4 py-2.5 border border-outline rounded-xl text-xs font-bold text-on-surface placeholder:text-outline focus:outline-none focus:border-primary bg-surface-container-lowest transition-all"
                />
              </div>
              {changeGiven > 0 && (
                <div className="flex justify-between bg-surface-container rounded-lg px-3 py-2">
                  <span className="text-xs font-semibold text-on-surface-variant">Kembalian</span>
                  <span className="text-sm font-bold text-on-surface">{formatRupiah(changeGiven)}</span>
                </div>
              )}
            </div>
          </>
        )}

        {error && (
          <p className="text-error text-xs font-semibold text-center">{error}</p>
        )}

        <button type="button"
          onClick={onCheckout}
          disabled={isSubmitting || success || cart.length === 0}
          className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
            success
              ? "bg-tertiary shadow-lg"
              : isForLater
              ? "bg-amber-500 hover:bg-amber-600 disabled:bg-surface-container-highest disabled:text-secondary"
              : "bg-primary hover:brightness-110 disabled:bg-surface-container-highest disabled:text-secondary shadow-active"
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Memproses...
            </>
          ) : success ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
              </svg>
              Pesanan Tersimpan!
            </>
          ) : isForLater ? (
            "Simpan (Diproses)"
          ) : (
            "Bayar & Selesaikan"
          )}
        </button>
      </div>
    </div>
  );
}
