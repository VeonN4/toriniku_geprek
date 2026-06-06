"use client";

import type { Category } from "../../../context/POSContext";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );
}

interface MenuHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategoryId: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
  categoriesLoading: boolean;
  onBack: () => void;
}

export function MenuHeader({
  searchQuery,
  onSearchChange,
  selectedCategoryId,
  onCategoryChange,
  categories,
  categoriesLoading,
  onBack,
}: MenuHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kasir POS</h1>
          <p className="text-gray-500 text-sm hidden md:block">
            Pilih menu, konfigurasi modifier
          </p>
        </div>
        <button type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-200 hover:bg-white text-gray-600 font-semibold text-xs rounded-xl cursor-pointer"
        >
          Kembali ke Orderan
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            className="w-4.5 h-4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="m21 21-4.3-4.3" />
          </svg>
        </span>
        <input
          type="text"
          aria-label="Cari menu"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari masakan atau minuman..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button type="button"
          id="cat-tab-all"
          onClick={() => onCategoryChange("all")}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
            selectedCategoryId === "all"
              ? "bg-orange-500 text-white shadow-md shadow-orange-100"
              : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"
          }`}
        >
          Semua Menu
        </button>
        {categoriesLoading
          ? [1, 2].map((i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))
          : categories.map((cat) => (
              <button type="button"
                key={cat.id}
                id={`cat-tab-${cat.id}`}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  selectedCategoryId === cat.id
                    ? "bg-orange-500 text-white shadow-md shadow-orange-100"
                    : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
      </div>
    </div>
  );
}
