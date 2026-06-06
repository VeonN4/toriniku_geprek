"use client";

import { useState, useMemo } from "react";
import type { Order } from "../context/POSContext";
import {
  formatRupiah,
  formatPriceInput,
  parsePrice,
} from "../../lib/utils/format";

export default function PaymentModal({
  order,
  onConfirm,
  onClose,
}: {
  order: Order;
  onConfirm: (payment: {
    paymentMethod: "cash" | "qris";
    amountPaid: number;
    changeGiven: number;
  }) => void;
  onClose: () => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paidValue = parsePrice(amountPaid);
  const changeGiven = useMemo(() => {
    if (isNaN(paidValue) || paidValue < order.total) return 0;
    return paidValue - order.total;
  }, [paidValue, order.total]);

  const isPaidEnough = !isNaN(paidValue) && paidValue >= order.total;

  const handleConfirm = async () => {
    if (!isPaidEnough) return;
    setIsSubmitting(true);
    try {
      onConfirm({
        paymentMethod,
        amountPaid: paymentMethod === "qris" ? order.total : paidValue,
        changeGiven: paymentMethod === "qris" ? 0 : changeGiven,
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 cursor-default"
        onClick={onClose}
        aria-label="Tutup"
      />
      <div className="relative flex items-center justify-center h-full p-4 pointer-events-none">
        <div className="pointer-events-auto bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-primary px-6 py-5 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">
                #{order.orderNumber}
              </h2>
              <span className="text-on-primary/80 text-sm capitalize">
                {order.customerName}
              </span>
            </div>
          </div>

          {/* Order items */}
          <div className="px-6 py-4 space-y-3 border-b border-outline-variant/40">
            {order.itemList.map((item) => (
              <div
                key={`${item.name}-${item.unitPrice}`}
                className="flex items-start justify-between text-sm"
              >
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-on-surface">
                    {item.quantity}x {item.name}
                  </span>
                  {item.notes && (
                    <p className="text-xxs text-outline italic mt-0.5">
                      {item.notes}
                    </p>
                  )}
                </div>
                <span className="text-on-surface-variant ml-4 shrink-0">
                  {formatRupiah(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Price summary */}
          <div className="px-6 py-3 space-y-1 text-sm border-b border-outline-variant/40">
            <div className="flex justify-between text-on-surface-variant">
              <span>Subtotal</span>
              <span>{formatRupiah(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-error">
                <span>Diskon</span>
                <span>-{formatRupiah(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-on-surface text-base pt-1 border-t border-outline-variant/40">
              <span>Total</span>
              <span className="text-primary">{formatRupiah(order.total)}</span>
            </div>
          </div>

          {/* Payment form */}
          <div className="px-6 py-4 space-y-4">
            {/* Payment method */}
            <div>
              <div className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Metode Pembayaran
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
                      paymentMethod === "cash"
                        ? "bg-primary text-on-primary shadow-active"
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    Tunai
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("qris")}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
                      paymentMethod === "qris"
                        ? "bg-primary text-on-primary shadow-active"
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    QRIS
                  </button>
                </div>
              </div>
            </div>

            {/* Amount input (cash only) */}
            {paymentMethod === "cash" && (
              <div>
                <label
                  htmlFor="amount-paid"
                  className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2"
                >
                  Bayar Rp
                </label>
                <input
                  id="amount-paid"
                  type="text"
                  inputMode="numeric"
                  value={amountPaid}
                  onChange={(e) =>
                    setAmountPaid(formatPriceInput(e.target.value))
                  }
                  placeholder="0"
                  className="w-full px-4 py-3 bg-surface-container rounded-xl text-lg font-bold text-on-surface placeholder:text-outline border-2 border-outline-variant focus:border-primary focus:outline-none transition-colors"
                />
                {/* Quick amount buttons */}
                <div className="flex gap-2 mt-2">
                  {[order.total, 20000, 50000, 100000].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setAmountPaid(String(val))}
                      className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                    >
                      {val === order.total ? "Uang Pas" : formatRupiah(val)}
                    </button>
                  ))}
                </div>
                {/* Change given */}
                {changeGiven > 0 && (
                  <div className="mt-3 flex justify-between items-center bg-surface-container rounded-xl px-4 py-2.5">
                    <span className="text-sm font-semibold text-on-surface-variant">
                      Kembalian
                    </span>
                    <span className="text-lg font-bold text-on-surface">
                      {formatRupiah(changeGiven)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* QRIS notice */}
            {paymentMethod === "qris" && (
              <div className="bg-surface-container rounded-xl px-4 py-4 text-center">
                <p className="text-sm font-semibold text-on-surface-variant">
                  Tunjukkan kode QR ke pelanggan
                </p>
                <p className="text-xxs text-outline mt-1">
                  Total: {formatRupiah(order.total)}
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="px-6 py-4 border-t border-outline-variant/40 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-surface-container text-on-surface-variant font-semibold text-sm rounded-xl hover:bg-surface-container-high cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={
                (paymentMethod === "cash" && !isPaidEnough) || isSubmitting
              }
              className="flex-1 px-4 py-2.5 bg-primary text-on-primary font-semibold text-sm rounded-xl hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              {isSubmitting ? "Memproses..." : "Konfirmasi Pembayaran"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
