"use client";

import { useState } from "react";
import { usePOS } from "../context/POSContext";
import type { Order, OrderStatus } from "../context/POSContext";
import { formatRupiah } from "../../lib/utils/format";

const STATUS_COLORS: Record<OrderStatus, string> = {
  Baru: "bg-surface-container text-on-surface-variant font-semibold",
  Diproses: "bg-secondary-container text-on-secondary-container font-semibold",
  Selesai: "bg-tertiary-container/30 text-on-tertiary-container font-semibold",
  Dibatalkan: "bg-error-container text-on-error-container font-semibold",
};

const STATUS_OPTIONS: OrderStatus[] = [
  "Baru",
  "Diproses",
  "Selesai",
  "Dibatalkan",
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hr lalu`;
}

function totalQuantity(order: Order) {
  return order.itemList.reduce((sum, item) => sum + item.quantity, 0);
}

function hasNotes(order: Order) {
  return order.itemList.some((item) => item.notes);
}

export default function OrderCard({
  order,
  onCardClick,
}: {
  order: Order;
  onCardClick?: (order: Order) => void;
}) {
  const { updateOrderStatus, deleteOrder } = usePOS();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const qty = totalQuantity(order);
  const isUnpaid = order.status === "Baru" || order.status === "Diproses";

  const handleDelete = async () => {
    await deleteOrder(order.id);
    setConfirmDelete(false);
  };

  const payButton = isUnpaid && onCardClick ? (
    <button type="button"
      onClick={() => onCardClick(order)}
      className="mt-3 w-full py-2 bg-primary text-on-primary text-sm font-bold rounded-xl hover:brightness-110 active:scale-[0.98] cursor-pointer transition-all"
    >
      Lanjutkan Pembayaran
    </button>
  ) : null;

  return (
    <div
      id={`order-card-${order.id}`}
      className="bg-surface-container-lowest rounded-2xl p-4 shadow-ambient relative transition-all group hover:shadow-md"
    >
      {/* Row 1: Order number + status badge + actions */}
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-on-surface text-base">
            #{order.orderNumber}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-1 bg-error-container rounded-full px-2 py-1 animate-scale-up">
              <span className="text-xs font-semibold text-on-error-container">Hapus?</span>
              <button type="button"
                onClick={handleDelete}
                className="text-xs font-bold text-on-error-container hover:text-error px-1.5 py-0.5 rounded-md hover:bg-error/20 transition-colors cursor-pointer"
              >
                Ya
              </button>
              <button type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-xs font-bold text-on-error-container hover:text-error px-1.5 py-0.5 rounded-md hover:bg-error/20 transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          ) : (
            <>
              <span
                id={`btn-status-${order.id}`}
                className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[order.status]}`}
              >
                {order.status}
              </span>
              <button type="button"
                id={`btn-delete-order-${order.id}`}
                aria-label="Hapus pesanan"
                onClick={() => setConfirmDelete(true)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-outline hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Row 2: Customer, order type, item count */}
      <div className="flex items-center gap-1.5 text-xs text-outline mb-2">
        <span>{order.customerName}</span>
        <span className="text-outline-variant">·</span>
        <span className="font-semibold text-on-surface-variant">
          {qty} item
        </span>
      </div>

      {/* Row 3: Items summary */}
      <div className="relative mb-2.5">
        <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2">
          {order.items}
        </p>
        {hasNotes(order) && (
          <span className="text-xxs text-outline italic block mt-0.5">
            Ada catatan
          </span>
        )}
      </div>

      {/* Row 4: Time, age, total */}
      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40">
        <div className="flex items-center gap-1.5 text-xs text-outline">
          <span>{order.time}</span>
          <span className="text-outline-variant">·</span>
          <span className="text-on-surface-variant font-medium">
            {timeAgo(order.createdAt)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-primary">
            {formatRupiah(order.total)}
          </span>
          {order.discountAmount > 0 && (
            <span className="text-xxs text-error block -mt-0.5">
              -{formatRupiah(order.discountAmount)}
            </span>
          )}
        </div>
      </div>

      {payButton}
    </div>
  );
}
