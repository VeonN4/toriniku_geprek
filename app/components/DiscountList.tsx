"use client";

import { Discount } from "../context/POSContext";
import { formatRupiah } from "../../lib/utils/format";

function isExpired(dateStr?: string) {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < new Date().getTime();
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "Tanpa Batas Waktu";
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DiscountList({
  discounts,
  isLoading,
  onEdit,
  onToggleActive,
  onDelete,
  onAdd,
}: {
  discounts: Discount[];
  isLoading: boolean;
  onEdit: (discount: Discount) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex-1 px-5 md:px-8 py-6 pb-24 md:pb-8 bg-surface">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient border border-surface-container-high flex gap-4 animate-pulse"
            >
              <div className="w-14 h-14 bg-surface-container rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-container rounded w-2/3" />
                <div className="h-3 bg-surface-container rounded w-1/3" />
                <div className="h-3 bg-surface-container rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : discounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-secondary">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-primary opacity-60"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.5 14.5 14.5 9.5M9.5 9.5h.01M14.5 14.5h.01M16.5 18.5a6 6 0 0 0 6-6v-7a2 2 0 0 0-2-2h-7a6 6 0 0 0-6 6v7a2 2 0 0 0 2 2h7z"
              />
            </svg>
          </div>
          <p className="text-on-surface font-bold">Belum ada promo diskon</p>
          <p className="text-secondary text-sm mt-1">
            Buat diskon pertamamu untuk memikat pelanggan!
          </p>
          <button
            type="button"
            id="btn-tambah-diskon-empty"
            onClick={onAdd}
            className="mt-4 bg-primary hover:bg-primary-dark text-on-primary font-bold text-sm px-5 py-2.5 rounded-lg shadow-active cursor-pointer transition-all"
          >
            Buat Diskon Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {discounts.map((discount) => {
            const expired = isExpired(discount.expiresAt);
            return (
              <div
                key={discount.id}
                id={`discount-card-${discount.id}`}
                className={`bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-high shadow-ambient hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between ${!discount.isActive ? "opacity-60 bg-surface-container-low/50" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-white font-bold tracking-tight text-center text-sm px-1.5 ${
                      discount.type === "percent"
                        ? "bg-linear-to-tr from-primary to-primary-container shadow-active"
                        : "bg-linear-to-tr from-error to-primary-container shadow-md"
                    }`}
                  >
                    {discount.type === "percent"
                      ? `${discount.value}%`
                      : "Rp"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-on-surface text-base truncate">
                      {discount.name}
                    </h3>
                    <p className="text-sm font-semibold text-primary mt-0.5">
                      {discount.type === "percent"
                        ? "Diskon Persentase"
                        : `Nominal: ${formatRupiah(discount.value)}`}
                    </p>
                    <div className="flex flex-col gap-1 mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-secondary">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                          />
                        </svg>
                        <span
                          className={
                            expired ? "text-error font-semibold" : ""
                          }
                        >
                          {expired
                            ? "Expired"
                            : formatDate(discount.expiresAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-surface-container-high pt-4 mt-5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id={`toggle-active-${discount.id}`}
                      aria-label="Alihkan status aktif"
                      onClick={() =>
                        onToggleActive(discount.id, !discount.isActive)
                      }
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer outline-none ${discount.isActive ? "bg-tertiary-container" : "bg-surface-container-highest"}`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${discount.isActive ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </button>
                    <span
                      className={`text-xs font-bold ${discount.isActive ? "text-tertiary" : "text-secondary"}`}
                    >
                      {discount.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      id={`btn-edit-${discount.id}`}
                      aria-label="Edit Diskon"
                      onClick={() => onEdit(discount)}
                      className="text-secondary hover:text-primary hover:bg-primary/5 p-2 rounded-xl transition-all active:scale-90 cursor-pointer"
                      title="Edit Diskon"
                    >
                      <svg
                        className="w-4.5 h-4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      id={`btn-delete-${discount.id}`}
                      aria-label="Hapus Diskon"
                      onClick={() => onDelete(discount.id)}
                      className="text-secondary hover:text-error hover:bg-error/5 p-2 rounded-xl transition-all active:scale-90 cursor-pointer"
                      title="Hapus Diskon"
                    >
                      <svg
                        className="w-4.5 h-4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
