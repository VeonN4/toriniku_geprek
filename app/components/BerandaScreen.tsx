"use client";

import { usePOS } from "../context/POSContext";

export default function BerandaScreen() {
  const { orders, menuItems, setActiveTab, setActiveScreen } = usePOS();

  const activeOrders = orders.filter((o) => o.status === "Baru" || o.status === "Diproses");
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
      <div className="bg-orange-500 px-5 md:px-8 pt-8 pb-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-400 rounded-full opacity-40" />
        <div className="absolute top-4 -right-4 w-24 h-24 bg-orange-300 rounded-full opacity-20" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">Toriniku Geprek</h1>
            <p className="text-orange-100 text-sm mt-0.5">Wilujeng Sumping, Juragan! 👋</p>
          </div>
          <button
            id="btn-notification"
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center mt-1 backdrop-blur-sm hover:bg-white/30 active:scale-95 cursor-pointer"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>

        {/* Revenue card */}
        <div className="relative z-10 mt-5 bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-orange-100 text-xs font-semibold uppercase tracking-wide">Tanggal Hari Ini</p>
              <p className="text-white text-sm font-bold mt-1">{dateStr}</p>
            </div>
            <svg className="w-5 h-5 text-orange-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <polyline strokeLinecap="round" strokeLinejoin="round" points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline strokeLinecap="round" strokeLinejoin="round" points="17 6 23 6 23 12" />
            </svg>
          </div>
          <p className="text-orange-100 text-xs font-semibold uppercase tracking-wide mt-3">Estimasi Laba Bersih</p>
          <p className="text-white text-2xl md:text-3xl font-bold mt-1">{formatRupiah(totalRevenue)}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 md:px-8 pt-6 pb-24 md:pb-8 bg-gray-50">
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">Ringkasan Bisnis</h2>

          {/* Active orders card */}
          <button
            id="card-active-orders"
            onClick={() => { setActiveTab("pesanan"); setActiveScreen("pesanan"); }}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md active:scale-[0.99] mb-3 text-left cursor-pointer"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 8v4l3 3" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium">Pesanan Aktif</p>
              <p className="text-lg font-bold text-gray-800">{activeOrders.length} Pesanan</p>
              <p className="text-xs text-gray-400">{needsProcessing.length} perlu diproses segera</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
            </svg>
          </button>

          {/* Quick actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <button
              id="btn-tambah-pesanan"
              onClick={() => setActiveScreen("pesanan-baru")}
              className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md active:scale-[0.98] text-left cursor-pointer"
            >
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" x2="21" y1="6" y2="6" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v6m-3-3h6" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-700">+ Pesanan</span>
            </button>

            <button
              id="btn-tambah-laba"
              className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md active:scale-[0.98] text-left cursor-pointer"
            >
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <line x1="12" x2="12" y1="1" y2="23" strokeLinecap="round" />
                  <path strokeLinecap="round" d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-700">+ Laba 50K</span>
            </button>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-500">Menu Aktif</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{activeMenuCount}</p>
              <p className="text-xs text-gray-400">produk tersedia</p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-500">Order Selesai</p>
              <p className="text-2xl font-bold text-orange-500 mt-1">{completedOrders.length}</p>
              <p className="text-xs text-gray-400">hari ini</p>
            </div>
          </div>

          {/* New order CTA — desktop */}
          <button
            id="btn-pesanan-baru-desktop"
            onClick={() => setActiveScreen("pesanan-baru")}
            className="hidden md:flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-3 rounded-2xl shadow-orange-200 shadow-lg active:scale-[0.98] cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
            </svg>
            Pesanan Baru
          </button>
        </div>
      </div>

      {/* FAB — mobile only */}
      <button
        id="fab-pesanan-baru"
        onClick={() => setActiveScreen("pesanan-baru")}
        className="md:hidden fixed bottom-20 right-5 z-40 w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 active:scale-95 cursor-pointer"
      >
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
        </svg>
        <span className="sr-only">Pesanan Baru</span>
      </button>
    </div>
  );
}
