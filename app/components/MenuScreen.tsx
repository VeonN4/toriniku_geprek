"use client";

import { usePOS, MenuItem } from "../context/POSContext";

function MenuItemCard({ item }: { item: MenuItem }) {
  const { updateMenuItemStatus, deleteMenuItem } = usePOS();
  const isFood = item.category === "food";
  const isHabis = item.status === "Habis";
  const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

  return (
    <div
      id={`menu-card-${item.id}`}
      className={`bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow ${isHabis ? "opacity-60" : ""}`}
    >
      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
        {isFood ? (
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 2h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3zM7 13H3M12 2v20M17 7l5-5M22 7c0 4-4.5 5-6 2.5" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10M6 6h12l-1 9H7L6 6zM6 6l-.5-2H4M10 6V4M14 6V4" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-gray-800 text-sm truncate ${isHabis ? "line-through text-gray-400" : ""}`}>
          {item.name}
        </p>
        <p className={`text-sm font-bold mt-0.5 ${isHabis ? "text-gray-400" : "text-orange-500"}`}>
          {formatRupiah(item.price)}
        </p>
        {item.note && <p className="text-xs text-gray-400 mt-0.5 truncate">{item.note}</p>}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          id={`toggle-status-${item.id}`}
          onClick={() => updateMenuItemStatus(item.id, isHabis ? "Ready" : "Habis")}
          className={`text-xs font-bold px-3 py-1 rounded-full cursor-pointer ${
            isHabis ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {item.status}
        </button>
        <button
          id={`delete-menu-${item.id}`}
          onClick={() => deleteMenuItem(item.id)}
          className="text-gray-300 hover:text-red-400 active:scale-90 cursor-pointer p-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function MenuScreen() {
  const { menuItems, setActiveScreen } = usePOS();
  const activeCount = menuItems.filter((m) => m.status === "Ready").length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-orange-500 px-5 md:px-8 pt-8 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-orange-400 rounded-full opacity-40" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">Kelola Menu</h1>
            <p className="text-orange-100 text-sm mt-0.5">Total: {activeCount} Produk aktif</p>
          </div>
          <button
            id="btn-tambah-menu"
            onClick={() => setActiveScreen("tambah-menu")}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-sm px-4 py-2 rounded-xl backdrop-blur-sm active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
            </svg>
            Tambah Menu
          </button>
        </div>
      </div>

      {/* Menu list */}
      <div className="flex-1 px-4 md:px-8 py-4 pb-24 md:pb-8 bg-gray-50">
        {menuItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <svg className="w-16 h-16 mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 2h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3zM7 13H3M12 2v20" />
            </svg>
            <p className="text-sm font-medium">Belum ada menu</p>
            <button
              id="btn-add-first-menu"
              onClick={() => setActiveScreen("tambah-menu")}
              className="mt-3 bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-orange-600 active:scale-95 cursor-pointer"
            >
              Tambah Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {menuItems.map((item) => <MenuItemCard key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
