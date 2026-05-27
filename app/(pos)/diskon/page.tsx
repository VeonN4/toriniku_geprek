"use client";

import { useState } from "react";
import { usePOS, Discount } from "../../context/POSContext";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-surface-container-high rounded-lg ${className}`}
    />
  );
}

export default function DiskonPage() {
  const {
    discounts,
    discountsLoading,
    addDiscount,
    updateDiscount,
    toggleDiscountActive,
    deleteDiscount,
  } = usePOS();

  // Drawer / Add & Edit Discount Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const totalCount = discounts.length;
  const activeCount = discounts.filter((d) => d.isActive).length;
  const percentCount = discounts.filter((d) => d.type === "percent").length;
  const fixedCount = discounts.filter((d) => d.type === "fixed").length;

  const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

  const handleOpenAdd = () => {
    setEditingDiscount(null);
    setName("");
    setType("percent");
    setValue("");
    setExpiresAt("");
    setError("");
    setIsDrawerOpen(true);
    requestAnimationFrame(() => {
      setTimeout(() => setAnimateOpen(true), 50);
    });
  };

  const handleOpenEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setName(discount.name);
    setType(discount.type);
    setValue(
      discount.type === "fixed"
        ? discount.value.toLocaleString("id-ID")
        : discount.value.toString(),
    );
    setExpiresAt(
      discount.expiresAt
        ? new Date(discount.expiresAt).toISOString().slice(0, 16)
        : "",
    );
    setError("");
    setIsDrawerOpen(true);
    requestAnimationFrame(() => {
      setTimeout(() => setAnimateOpen(true), 50);
    });
  };

  const handleCloseDrawer = () => {
    setAnimateOpen(false);
    setTimeout(() => {
      setIsDrawerOpen(false);
      setEditingDiscount(null);
      setName("");
      setType("percent");
      setValue("");
      setExpiresAt("");
      setError("");
    }, 300);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama diskon harus diisi");
      return;
    }

    const parsedValue = parseFloat(value.replace(/\D/g, ""));
    if (isNaN(parsedValue) || parsedValue <= 0) {
      setError("Nilai diskon harus lebih dari 0");
      return;
    }

    if (type === "percent" && parsedValue > 100) {
      setError("Diskon persentase tidak boleh lebih dari 100%");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (editingDiscount) {
        await updateDiscount(editingDiscount.id, {
          name: name.trim(),
          type,
          value: parsedValue,
          isActive: editingDiscount.isActive,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        });
      } else {
        await addDiscount({
          name: name.trim(),
          type,
          value: parsedValue,
          isActive: true,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        });
      }

      handleCloseDrawer();
    } catch (err) {
      setError(
        editingDiscount ? "Gagal mengubah diskon" : "Gagal menambahkan diskon",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormatValue = (val: string) => {
    if (type === "fixed") {
      const digits = val.replace(/\D/g, "");
      return digits ? parseInt(digits).toLocaleString("id-ID") : "";
    } else {
      const digits = val.replace(/\D/g, "");
      return digits ? Math.min(parseInt(digits), 100).toString() : "";
    }
  };

  const isExpired = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr).getTime() < new Date().getTime();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Tanpa Batas Waktu";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col min-h-full relative overflow-x-hidden font-sans">
      {/* ── Header ── */}
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
            id="btn-tambah-diskon"
            onClick={handleOpenAdd}
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

        {/* ── Metrics Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-white">
            <p className="text-primary-fixed-dim text-xs font-bold uppercase tracking-wider">
              Total Diskon
            </p>
            {discountsLoading ? (
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
            {discountsLoading ? (
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
            {discountsLoading ? (
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
            {discountsLoading ? (
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

      {/* ── Main Panel ── */}
      <div className="flex-1 px-5 md:px-8 py-6 pb-24 md:pb-8 bg-surface">
        {discountsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient border border-surface-container-high flex gap-4 animate-pulse"
              >
                <div className="w-14 h-14 bg-surface-container rounded-full flex-shrink-0" />
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
              id="btn-tambah-diskon-empty"
              onClick={handleOpenAdd}
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
                  className={`bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-high shadow-ambient hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between ${
                    !discount.isActive
                      ? "opacity-60 bg-surface-container-low/50"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* circular discount icon */}
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold tracking-tight text-center text-sm px-1.5 ${
                        discount.type === "percent"
                          ? "bg-gradient-to-tr from-primary to-primary-container shadow-active"
                          : "bg-gradient-to-tr from-error to-primary-container shadow-md"
                      }`}
                    >
                      {discount.type === "percent"
                        ? `${discount.value}%`
                        : `Rp`}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-bold text-on-surface text-base truncate"
                        title={discount.name}
                      >
                        {discount.name}
                      </h3>
                      <p className="text-sm font-semibold text-primary mt-0.5">
                        {discount.type === "percent"
                          ? "Diskon Persentase"
                          : `Nominal: ${formatRupiah(discount.value)}`}
                      </p>

                      {/* expiry and status badge */}
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
                    {/* Active toggle */}
                    <div className="flex items-center gap-2">
                      <button
                        id={`toggle-active-${discount.id}`}
                        onClick={() =>
                          toggleDiscountActive(discount.id, !discount.isActive)
                        }
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer outline-none ${
                          discount.isActive
                            ? "bg-tertiary-container"
                            : "bg-surface-container-highest"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                            discount.isActive
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span
                        className={`text-xs font-bold ${discount.isActive ? "text-tertiary" : "text-secondary"}`}
                      >
                        {discount.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Edit Button */}
                      <button
                        id={`btn-edit-${discount.id}`}
                        onClick={() => handleOpenEdit(discount)}
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

                      {/* Delete button */}
                      <button
                        id={`btn-delete-${discount.id}`}
                        onClick={() => deleteDiscount(discount.id)}
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

      {/* ── Premium Add/Edit Discount Drawe      {/* ── Premium Add/Edit Discount Drawer (Modal / Bottom Sheet) ── */}
      {isDrawerOpen && (
        <div
          className={`fixed inset-0 z-50 overflow-hidden flex items-end md:items-center justify-center md:p-4 transition-all duration-300 ${
            animateOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          id="drawer-container"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleCloseDrawer}
          />

          {/* Panel */}
          <div
            className="relative bg-surface-container-lowest shadow-2xl flex flex-col w-full z-10 transition-all duration-300 ease-out rounded-t-3xl md:rounded-2xl md:max-w-md"
            style={{
              transform: animateOpen ? "translateY(0) scale(1)" : "translateY(100%) scale(0.95)",
              maxHeight: "85dvh",
            }}
          >
            {/* Drag handle — visible on mobile only */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0 md:hidden">
              <div className="w-12 h-1 bg-surface-container-highest rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 pb-4 pt-4 md:pt-5 border-b border-surface-container-high flex items-start justify-between flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-on-surface uppercase tracking-wide">
                  {editingDiscount ? "Edit Diskon" : "Tambah Diskon Baru"}
                </h2>
                <p className="text-secondary text-xs mt-0.5">
                  {editingDiscount
                    ? "Ubah detail program diskon terdaftar"
                    : "Buat penawaran diskon kustom untuk warung"}
                </p>
              </div>
              <button
                id="btn-close-drawer"
                onClick={handleCloseDrawer}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-secondary hover:text-on-surface active:scale-90 transition-colors cursor-pointer mt-0.5"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <form
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
            >
              {/* Type tabs selector */}
              <div>
                <label className="block text-xs font-bold text-secondary mb-2 uppercase tracking-wide">
                  Tipe Diskon
                </label>
                <div className="flex gap-2 p-1 bg-surface-container rounded-lg">
                  <button
                    type="button"
                    id="type-percent"
                    onClick={() => {
                      setType("percent");
                      setValue("");
                      setError("");
                    }}
                    className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                      type === "percent"
                        ? "bg-primary text-on-primary shadow-sm"
                        : "text-secondary hover:text-primary"
                    }`}
                  >
                    Persentase (%)
                  </button>
                  <button
                    type="button"
                    id="type-fixed"
                    onClick={() => {
                      setType("fixed");
                      setValue("");
                      setError("");
                    }}
                    className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                      type === "fixed"
                        ? "bg-primary text-on-primary shadow-sm"
                        : "text-secondary hover:text-primary"
                    }`}
                  >
                    Nominal Tetap (Rp)
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="input-discount-name"
                  className="block text-xs font-bold text-secondary mb-2 uppercase tracking-wide"
                >
                  Nama Diskon / Promo
                </label>
                <input
                  id="input-discount-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  placeholder="Contoh: Diskon Member Baru, Promo Lebaran"
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary bg-surface-container-lowest transition-all"
                />
              </div>

              {/* Value */}
              <div>
                <label
                  htmlFor="input-discount-value"
                  className="block text-xs font-bold text-secondary mb-2 uppercase tracking-wide"
                >
                  {type === "percent"
                    ? "Nilai Potongan (%)"
                    : "Nominal Potongan (Rp)"}
                </label>
                <div className="relative">
                  {type === "fixed" && (
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-secondary font-bold">
                      Rp
                    </span>
                  )}
                  <input
                    id="input-discount-value"
                    type="text"
                    inputMode="numeric"
                    value={value}
                    onChange={(e) => {
                      setValue(handleFormatValue(e.target.value));
                      setError("");
                    }}
                    placeholder={
                      type === "percent" ? "Contoh: 10" : "Contoh: 5.000"
                    }
                    className={`w-full py-3 border border-outline-variant rounded-lg text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary bg-surface-container-lowest transition-all ${
                      type === "fixed" ? "pl-9 pr-4" : "px-4"
                    }`}
                  />
                  {type === "percent" && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-secondary font-bold">
                      %
                    </span>
                  )}
                </div>
              </div>

              {/* Expiry */}
              <div>
                <label
                  htmlFor="input-expiry"
                  className="block text-xs font-bold text-secondary mb-2 uppercase tracking-wide"
                >
                  Tanggal & Waktu Berakhir (Opsional)
                </label>
                <input
                  id="input-expiry"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary bg-surface-container-lowest transition-all"
                />
                <p className="text-secondary/70 text-xs mt-1">
                  Kosongkan jika diskon berlaku selamanya tanpa batas waktu.
                </p>
              </div>

              {/* Error block */}
              {error && (
                <div className="flex items-center gap-2 bg-error-container/20 border border-error text-error text-xs font-semibold px-3 py-2.5 rounded-lg">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line
                      x1="12"
                      y1="8"
                      x2="12"
                      y2="12"
                      strokeLinecap="round"
                    />
                    <line
                      x1="12"
                      y1="16"
                      x2="12.01"
                      y2="16"
                      strokeLinecap="round"
                    />
                  </svg>
                  {error}
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-surface-container-high bg-surface-container-low flex gap-3 flex-shrink-0 rounded-b-2xl">
              <button
                type="button"
                id="btn-cancel"
                onClick={handleCloseDrawer}
                className="flex-1 py-3 bg-surface-container-lowest border border-outline rounded-lg text-secondary font-bold text-sm hover:bg-surface-container active:scale-[0.98] cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-submit"
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-primary hover:bg-primary-dark disabled:bg-surface-container-highest disabled:text-secondary text-on-primary font-bold text-sm rounded-lg shadow-active active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="w-4.5 h-4.5 animate-spin text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth={4}
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Menyimpan...
                  </>
                ) : editingDiscount ? (
                  "Simpan Perubahan"
                ) : (
                  "Simpan Promo"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Slide-in & Scale Animation Styles ── */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .text-xxs {
          font-size: 0.65rem;
        }
        .text-xxs {
          font-size: 0.65rem;
        }
      `}</style>
    </div>
  );
}
