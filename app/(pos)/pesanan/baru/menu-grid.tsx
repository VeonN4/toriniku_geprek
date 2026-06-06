"use client";

import { formatRupiah } from "../../../../lib/utils/format";
import type { MenuItem } from "../../../context/POSContext";

interface MenuGridProps {
  menuLoading: boolean;
  filteredMenuItems: MenuItem[];
  handleItemClick: (item: MenuItem) => void;
}

export function MenuGrid({
  menuLoading,
  filteredMenuItems,
  handleItemClick,
}: MenuGridProps) {
  if (menuLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2 animate-pulse h-36"
          />
        ))}
      </div>
    );
  }

  if (filteredMenuItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
        <p className="font-semibold text-gray-800">Menu tidak ditemukan</p>
        <p className="text-sm mt-1">
          Coba gunakan kata kunci pencarian yang lain.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredMenuItems.map((item) => (
          <button type="button"
            key={item.id}
            id={`menu-item-button-${item.id}`}
            onClick={() => handleItemClick(item)}
            className="bg-white rounded-2xl p-4 text-left border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between h-36"
          >
            <div>
              <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">
                {item.name}
              </h3>
              {item.note && (
                <p className="text-gray-400 text-xxs mt-0.5 line-clamp-1">
                  {item.note}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between mt-3 w-full">
              <span className="text-orange-500 font-bold text-sm">
                {formatRupiah(item.price)}
              </span>
            </div>
          </button>
        ))}
    </div>
  );
}
