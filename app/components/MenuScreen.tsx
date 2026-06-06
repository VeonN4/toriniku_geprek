"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePOS, MenuItem } from "../context/POSContext";
import { formatRupiah } from "../../lib/utils/format";
import ModifierDrawer from "./ModifierDrawer";

function MenuItemCard({ item, onOpenModifiers }: { item: MenuItem; onOpenModifiers: (item: MenuItem) => void }) {
  const { updateMenuItemStatus, deleteMenuItem } = usePOS();
  const isFood = item.category === "food";
  const isHabis = item.status === "Habis";
  return (
    <div
      id={`menu-card-${item.id}`}
      className={`bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-4 shadow-ambient hover:shadow-md transition-all ${isHabis ? "opacity-60" : ""}`}
    >
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
        {isFood ? (
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 2h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3zM7 13H3M12 2v20M17 7l5-5M22 7c0 4-4.5 5-6 2.5" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10M6 6h12l-1 9H7L6 6zM6 6l-.5-2H4M10 6V4M14 6V4" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-on-surface text-sm truncate ${isHabis ? "line-through text-outline" : ""}`}>
          {item.name}
        </p>
        <p className={`text-sm font-bold mt-0.5 ${isHabis ? "text-outline" : "text-primary"}`}>
          {formatRupiah(item.price)}
        </p>
        {item.note && <p className="text-xs text-on-surface-variant mt-0.5 truncate">{item.note}</p>}
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Edit button */}
        <button type="button"
          id={`edit-${item.id}`}
          aria-label="Edit Menu"
          onClick={() => onOpenModifiers(item)}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-outline hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.293-6.293a1 1 0 011.414 0l1.586 1.586a1 1 0 010 1.414L12 16H9v-3z" />
          </svg>
        </button>
        <button type="button"
          id={`toggle-status-${item.id}`}
          onClick={() => updateMenuItemStatus(item.id, isHabis ? "Ready" : "Habis")}
          className={`text-xs font-bold px-3 py-1 rounded-full cursor-pointer transition-colors ${
            isHabis
              ? "bg-error-container text-on-error-container hover:bg-error-container/80"
              : "bg-tertiary-container/20 text-on-tertiary-container hover:bg-tertiary-container/30"
          }`}
        >
          {item.status}
        </button>
        <button type="button"
          id={`delete-menu-${item.id}`}
          aria-label="Hapus menu"
          onClick={() => deleteMenuItem(item.id)}
          className="text-outline hover:text-error active:scale-90 cursor-pointer p-1 transition-all"
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
  const { menuItems, menuLoading } = usePOS();
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const activeCount = menuItems.filter((m) => m.status === "Ready").length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-primary px-5 md:px-8 pt-8 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary-container rounded-full opacity-40" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">Kelola Menu</h1>
            <p className="text-on-primary/80 text-sm mt-0.5">Total: {activeCount} Produk aktif</p>
          </div>
          <button type="button"
            id="btn-tambah-menu"
            onClick={() => router.push("/menu/tambah")}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-sm px-4 py-2.5 rounded-xl backdrop-blur-sm active:scale-95 transition-all cursor-pointer shadow-ambient"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
            </svg>
            Tambah Menu
          </button>
        </div>
      </div>

      {/* Menu list */}
      <div className="flex-1 px-4 md:px-8 py-4 pb-24 md:pb-8 bg-background">
        {menuLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-4 shadow-ambient animate-pulse">
                <div className="w-12 h-12 bg-surface-container rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container rounded w-2/3" />
                  <div className="h-3 bg-surface-container rounded w-1/3" />
                </div>
                <div className="h-6 bg-surface-container rounded-full w-16" />
              </div>
            ))}
          </div>
        ) : menuItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-outline">
            <svg className="w-16 h-16 mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 2h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3zM7 13H3M12 2v20" />
            </svg>
            <p className="text-sm font-medium">Belum ada menu</p>
            <button type="button"
              id="btn-add-first-menu"
              onClick={() => router.push("/menu/tambah")}
              className="mt-3 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-primary-dark active:scale-95 transition-all cursor-pointer shadow-active"
            >
              Tambah Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {menuItems.map((item) => <MenuItemCard key={item.id} item={item} onOpenModifiers={setSelectedItem} />)}
          </div>
        )}
      </div>

      <ModifierDrawer key={selectedItem?.id ?? 'none'} item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
