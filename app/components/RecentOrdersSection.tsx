"use client";

import type { Order, OrderStatus } from "../context/POSContext";
import { formatRupiah } from "../../lib/utils/format";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );
}

const STATUS_BADGE: Record<OrderStatus, string> = {
  Baru: "bg-surface-container text-on-surface-variant",
  Diproses: "bg-secondary-container text-on-secondary-container",
  Selesai: "bg-tertiary-container/30 text-on-tertiary-container",
  Dibatalkan: "bg-error-container text-on-error-container",
};

export function RecentOrdersSection({
  orders,
  isLoading,
  onViewAll,
  onViewOrder,
}: {
  orders: Order[];
  isLoading: boolean;
  onViewAll: () => void;
  onViewOrder: () => void;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden">
      <div className="px-5 py-3.5 border-b border-outline-variant/40 flex items-center justify-between">
        <h3 className="text-sm font-bold text-on-surface">Pesanan Terbaru</h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          Lihat Semua
        </button>
      </div>
      {isLoading ? (
        <div className="p-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-outline">
          Belum ada pesanan
        </p>
      ) : (
        <div className="divide-y divide-outline-variant/30">
          {orders.map((order) => (
            <button
              type="button"
              key={order.id}
              onClick={onViewOrder}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-surface-container/50 active:bg-surface-container text-left cursor-pointer transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">
                  #{order.orderNumber}
                </p>
                <p className="text-xxs text-outline truncate mt-0.5">
                  {order.items}
                </p>
              </div>
              <span
                className={`text-xxs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_BADGE[order.status]}`}
              >
                {order.status}
              </span>
              <span className="text-xs font-bold text-on-surface-variant shrink-0">
                {formatRupiah(order.total)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
