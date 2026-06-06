"use client";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );
}

export function BusinessSummaryCards({
  activeOrderCount,
  needsProcessingCount,
  activeMenuCount,
  todayOrderCount,
  ordersLoading,
  menuLoading,
  onNewOrder,
  onViewMenu,
  onViewOrders,
}: {
  activeOrderCount: number;
  needsProcessingCount: number;
  activeMenuCount: number;
  todayOrderCount: number;
  ordersLoading: boolean;
  menuLoading: boolean;
  onNewOrder: () => void;
  onViewMenu: () => void;
  onViewOrders: () => void;
}) {
  return (
    <>
      <button
        type="button"
        id="card-active-orders"
        onClick={onViewOrders}
        className="w-full bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-4 shadow-ambient hover:shadow-md active:scale-[0.99] mb-3 text-left cursor-pointer transition-all"
      >
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
          <svg
            className="w-6 h-6 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 8v4l3 3" />
          </svg>
        </div>
        <div className="flex-1">
          {ordersLoading ? (
            <>
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-3 w-40" />
            </>
          ) : (
            <>
              <p className="text-xs text-on-surface-variant font-medium">
                Pesanan Aktif
              </p>
              <p className="text-lg font-bold text-on-surface">
                {activeOrderCount} Pesanan
              </p>
              <p className="text-xs text-outline">
                {needsProcessingCount} perlu diproses segera
              </p>
            </>
          )}
        </div>
        <svg
          className="w-5 h-5 text-outline"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
        </svg>
      </button>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <button
          type="button"
          id="btn-tambah-pesanan"
          onClick={onNewOrder}
          className="bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-3 shadow-ambient hover:shadow-md active:scale-[0.98] text-left cursor-pointer transition-all"
        >
          <div className="w-10 h-10 bg-tertiary-container/20 rounded-xl flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-tertiary"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" x2="21" y1="6" y2="6" />
              <path d="M12 11v6m-3-3h6" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-on-surface-variant hover:text-on-surface">
            + Pesanan
          </span>
        </button>

        <button
          type="button"
          id="btn-lihat-menu"
          onClick={onViewMenu}
          className="bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-3 shadow-ambient hover:shadow-md active:scale-[0.98] text-left cursor-pointer transition-all"
        >
          <div className="w-10 h-10 bg-primary-container/20 rounded-xl flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-on-surface-variant hover:text-on-surface">
            Menu
          </span>
        </button>

        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-ambient">
          <p className="text-xs text-on-surface-variant font-medium">Menu Aktif</p>
          {menuLoading ? (
            <Skeleton className="h-7 w-8 mt-1 mb-1" />
          ) : (
            <p className="text-2xl font-bold text-on-surface mt-1">{activeMenuCount}</p>
          )}
          <p className="text-xs text-outline">produk tersedia</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-ambient">
          <p className="text-xs text-on-surface-variant font-medium">Order Selesai</p>
          {ordersLoading ? (
            <Skeleton className="h-7 w-8 mt-1 mb-1" />
          ) : (
            <p className="text-2xl font-bold text-primary mt-1">{todayOrderCount}</p>
          )}
          <p className="text-xs text-outline">hari ini</p>
        </div>
      </div>
    </>
  );
}
