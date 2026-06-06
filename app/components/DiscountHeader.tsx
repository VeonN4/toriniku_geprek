"use client";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-surface-container-high rounded-lg ${className}`}
    />
  );
}

export function DiscountHeader({
  totalCount,
  activeCount,
  percentCount,
  fixedCount,
  isLoading,
  onAdd,
}: {
  totalCount: number;
  activeCount: number;
  percentCount: number;
  fixedCount: number;
  isLoading: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="bg-primary px-5 md:px-8 pt-8 pb-8 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-container rounded-full opacity-35" />
      <div className="absolute top-4 -right-4 w-24 h-24 bg-primary-container rounded-full opacity-15" />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Kelola Diskon</h1>
          <p className="text-white text-sm mt-0.5 opacity-90">
            Atur potongan harga, program member, & promo warung
          </p>
        </div>
        <button
          type="button"
          id="btn-tambah-diskon"
          onClick={onAdd}
          className="flex items-center gap-2 bg-surface-container-lowest text-primary hover:bg-surface-container font-bold text-sm px-4 py-2.5 rounded-lg shadow-active active:scale-95 transition-all cursor-pointer"
        >
          <svg
            className="w-4.5 h-4.5"
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
          Tambah Diskon
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 relative z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-white">
          <p className="text-primary-fixed-dim text-xs font-bold uppercase tracking-wider">
            Total Diskon
          </p>
          {isLoading ? (
            <Skeleton className="h-7 w-10 mt-2 bg-white/20" />
          ) : (
            <p className="text-2xl font-bold mt-1">{totalCount}</p>
          )}
          <p className="text-primary-fixed-dim/80 text-xs mt-1">
            Aturan diskon terdaftar
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-white">
          <p className="text-primary-fixed-dim text-xs font-bold uppercase tracking-wider">
            Diskon Aktif
          </p>
          {isLoading ? (
            <Skeleton className="h-7 w-10 mt-2 bg-white/20" />
          ) : (
            <p className="text-2xl font-bold mt-1 text-tertiary-fixed">
              {activeCount}
            </p>
          )}
          <p className="text-primary-fixed-dim/80 text-xs mt-1">
            Sedang aktif di kasir
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-white">
          <p className="text-primary-fixed-dim text-xs font-bold uppercase tracking-wider">
            Tipe Persentase
          </p>
          {isLoading ? (
            <Skeleton className="h-7 w-10 mt-2 bg-white/20" />
          ) : (
            <p className="text-2xl font-bold mt-1">{percentCount}</p>
          )}
          <p className="text-primary-fixed-dim/80 text-xs mt-1">
            Potongan berbasis %
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-white">
          <p className="text-primary-fixed-dim text-xs font-bold uppercase tracking-wider">
            Tipe Nominal
          </p>
          {isLoading ? (
            <Skeleton className="h-7 w-10 mt-2 bg-white/20" />
          ) : (
            <p className="text-2xl font-bold mt-1">{fixedCount}</p>
          )}
          <p className="text-primary-fixed-dim/80 text-xs mt-1">
            Potongan nominal tetap (Rp)
          </p>
        </div>
      </div>
    </div>
  );
}
