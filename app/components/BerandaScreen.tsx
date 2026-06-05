"use client";

import { useRouter } from "next/navigation";
import { usePOS } from "../context/POSContext";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );
}

export default function BerandaScreen() {
  const { orders, menuItems, ordersLoading, menuLoading, session } = usePOS();
  const router = useRouter();
  const userEmail = session?.user?.email ?? "Juragan";

  const activeOrders = orders.filter(
    (o) => o.status === "Baru" || o.status === "Diproses",
  );
  const needsProcessing = orders.filter((o) => o.status === "Baru");
  const completedOrders = orders.filter((o) => o.status === "Selesai");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const activeMenuCount = menuItems.filter((m) => m.status === "Ready").length;

  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getFullYear()).slice(2)}`;
  const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-primary px-5 md:px-8 pt-8 pb-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-container rounded-full opacity-40" />
        <div className="absolute top-4 -right-4 w-24 h-24 bg-primary-container/60 rounded-full opacity-20" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">Toriniku Geprek</h1>
            <p className="text-on-primary/80 text-sm mt-0.5">
              Wilujeng Sumping, {userEmail.split("@")[0]}! 👋
            </p>
          </div>
        </div>
        {/* Revenue card */}
        <div className="relative z-10 mt-5 bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-on-primary/80 text-xs font-semibold uppercase tracking-wide">
                Tanggal Hari Ini
              </p>
              <p className="text-white text-sm font-bold mt-1">{dateStr}</p>
            </div>
            <svg
              className="w-5 h-5 text-white/80"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <polyline
                strokeLinecap="round"
                strokeLinejoin="round"
                points="23 6 13.5 15.5 8.5 10.5 1 18"
              />
              <polyline
                strokeLinecap="round"
                strokeLinejoin="round"
                points="17 6 23 6 23 12"
              />
            </svg>
          </div>
          <p className="text-on-primary/80 text-xs font-semibold uppercase tracking-wide mt-3">
            Estimasi Laba Bersih
          </p>
          <p className="text-white text-2xl md:text-3xl font-bold mt-1">
            {formatRupiah(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 md:px-8 pt-6 pb-24 md:pb-8 bg-background">
        <h2 className="text-base font-bold text-on-surface mb-3">
          Ringkasan Bisnis
        </h2>

        {/* Active orders card */}
        <button
          id="card-active-orders"
          onClick={() => router.push("/pesanan")}
          className="w-full bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-4 shadow-ambient hover:shadow-md active:scale-[0.99] mb-3 text-left cursor-pointer transition-all"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
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
                  {activeOrders.length} Pesanan
                </p>
                <p className="text-xs text-outline">
                  {needsProcessing.length} perlu diproses segera
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m9 18 6-6-6-6"
            />
          </svg>
        </button>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <button
            id="btn-tambah-pesanan"
            onClick={() => router.push("/pesanan/baru")}
            className="bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-3 shadow-ambient hover:shadow-md active:scale-[0.98] text-left cursor-pointer transition-all"
          >
            <div className="w-10 h-10 bg-tertiary-container/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-tertiary"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
                />
                <line x1="3" x2="21" y1="6" y2="6" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 11v6m-3-3h6"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-on-surface-variant hover:text-on-surface">
              + Pesanan
            </span>
          </button>

          <button
            id="btn-tambah-laba"
            className="bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-3 shadow-ambient hover:shadow-md active:scale-[0.98] text-left cursor-pointer transition-all"
          >
            <div className="w-10 h-10 bg-primary-container/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <line x1="12" x2="12" y1="1" y2="23" strokeLinecap="round" />
                <path
                  strokeLinecap="round"
                  d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-on-surface-variant hover:text-on-surface">
              + Laba 50K
            </span>
          </button>

          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-ambient">
            <p className="text-xs text-on-surface-variant font-medium">
              Menu Aktif
            </p>
            {menuLoading ? (
              <Skeleton className="h-7 w-8 mt-1 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-on-surface mt-1">
                {activeMenuCount}
              </p>
            )}
            <p className="text-xs text-outline">produk tersedia</p>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-ambient">
            <p className="text-xs text-on-surface-variant font-medium">
              Order Selesai
            </p>
            {ordersLoading ? (
              <Skeleton className="h-7 w-8 mt-1 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-primary mt-1">
                {completedOrders.length}
              </p>
            )}
            <p className="text-xs text-outline">hari ini</p>
          </div>
        </div>

        {/* Desktop CTA */}
        <button
          id="btn-pesanan-baru-desktop"
          onClick={() => router.push("/pesanan/baru")}
          className="hidden md:flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-3 rounded-2xl shadow-active active:scale-[0.98] cursor-pointer transition-all"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 5v14m-7-7h14"
            />
          </svg>
          Pesanan Baru
        </button>
      </div>

      {/* FAB — mobile only */}
      <button
        id="fab-pesanan-baru"
        onClick={() => router.push("/pesanan/baru")}
        className="md:hidden fixed bottom-20 right-5 z-40 w-14 h-14 bg-primary text-on-primary rounded-full shadow-active flex items-center justify-center hover:bg-primary-dark active:scale-95 cursor-pointer transition-all"
      >
        <svg
          className="w-7 h-7 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 5v14m-7-7h14"
          />
        </svg>
      </button>
    </div>
  );
}
