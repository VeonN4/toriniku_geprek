"use client";

import { useState } from "react";
import { usePOS } from "../context/POSContext";
import type { Order, OrderStatus } from "../context/POSContext";

const STATUS_COLORS: Record<OrderStatus, string> = {
  Baru: "bg-surface-container text-on-surface-variant font-semibold",
  Diproses: "bg-secondary-container text-on-secondary-container font-semibold",
  Selesai: "bg-tertiary-container/30 text-on-tertiary-container font-semibold",
  Dibatalkan: "bg-error-container text-on-error-container font-semibold",
};

const statusOptions: OrderStatus[] = [
  "Baru",
  "Diproses",
  "Selesai",
  "Dibatalkan",
];

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function OrderCard({ order }: { order: Order }) {
  const { updateOrderStatus } = usePOS();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      id={`order-card-${order.id}`}
      className="bg-surface-container-lowest rounded-2xl p-4 shadow-ambient hover:shadow-md relative transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-bold text-on-surface text-base">
            #{order.orderNumber}
          </span>
          <p className="text-xs text-outline mt-0.5">{order.customerName}</p>
        </div>
        <button
          id={`btn-status-${order.id}`}
          onClick={() => setShowMenu((v) => !v)}
          className={`text-xs font-semibold px-3 py-1 rounded-full cursor-pointer flex-shrink-0 transition-colors ${STATUS_COLORS[order.status]}`}
        >
          {order.status}
        </button>
      </div>

      {showMenu && (
        <div
          className="absolute right-4 top-12 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant z-50 py-1 min-w-36 transition-all"
          onMouseLeave={() => setShowMenu(false)}
        >
          {statusOptions.map((s) => (
            <button
              key={s}
              id={`status-option-${order.id}-${s}`}
              onClick={() => {
                updateOrderStatus(order.id, s);
                setShowMenu(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-surface-container cursor-pointer transition-colors ${order.status === s ? "text-primary" : "text-on-surface-variant"}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-on-surface-variant mb-3">{order.items}</p>
      {order.notes && (
        <p className="text-xs text-outline italic mb-2">{order.notes}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-outline">Jam: {order.time}</span>
        <span className="text-sm font-bold text-primary">
          {formatRupiah(order.total)}
        </span>
      </div>
    </div>
  );
}
