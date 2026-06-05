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
  const { updateOrderStatus } = usePOS();
  const qty = totalQuantity(order);
  const isUnpaid = order.status === "Baru" || order.status === "Diproses";

  return (
    <div
      id={`order-card-${order.id}`}
      className={`bg-surface-container-lowest rounded-2xl p-4 shadow-ambient relative transition-all group ${
        isUnpaid && onCardClick
          ? "hover:shadow-md cursor-pointer"
          : "hover:shadow-md"
      }`}
      onClick={() => isUnpaid && onCardClick?.(order)}
    >
      {/* Row 1: Order number + status badge */}
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-on-surface text-base">
            #{order.orderNumber}
          </span>
        </div>
        <button
          id={`btn-status-${order.id}`}
          className={`text-xs font-semibold px-3 py-1 rounded-full cursor-pointer flex-shrink-0 transition-colors ${STATUS_COLORS[order.status]}`}
        >
          {order.status}
        </button>
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
    </div>
  );
}
