"use client";

import { useReducer, useState } from "react";
import { usePOS, Discount } from "../context/POSContext";
import { formatPriceInput, parsePrice } from "../../lib/utils/format";
import { DiscountHeader } from "./DiscountHeader";
import { DiscountList } from "./DiscountList";

interface DiscountFormState {
  name: string;
  type: "percent" | "fixed";
  value: string;
  expiresAt: string;
  error: string;
  isSubmitting: boolean;
}

type DiscountFormAction =
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_TYPE"; payload: "percent" | "fixed" }
  | { type: "SET_VALUE"; payload: string }
  | { type: "SET_EXPIRES_AT"; payload: string }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_SUBMITTING"; payload: boolean };

function discountFormReducer(
  state: DiscountFormState,
  action: DiscountFormAction,
): DiscountFormState {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.payload, error: "" };
    case "SET_TYPE":
      return { ...state, type: action.payload, value: "", error: "" };
    case "SET_VALUE":
      return { ...state, value: action.payload, error: "" };
    case "SET_EXPIRES_AT":
      return { ...state, expiresAt: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.payload };
  }
}

function initDiscountFormState(
  editingDiscount: Discount | null,
): DiscountFormState {
  return {
    name: editingDiscount?.name ?? "",
    type: editingDiscount?.type ?? "percent",
    value: editingDiscount
      ? editingDiscount.type === "fixed"
        ? formatPriceInput(String(editingDiscount.value))
        : String(editingDiscount.value)
      : "",
    expiresAt: editingDiscount?.expiresAt
      ? new Date(editingDiscount.expiresAt).toISOString().slice(0, 16)
      : "",
    error: "",
    isSubmitting: false,
  };
}

interface DiscountFormProps {
  editingDiscount: Discount | null;
  onClose: () => void;
  onSave: (data: {
    name: string;
    type: "percent" | "fixed";
    value: number;
    expiresAt?: string;
  }) => Promise<void>;
}

function DiscountForm({ editingDiscount, onClose, onSave }: DiscountFormProps) {
  const [state, dispatch] = useReducer(
    discountFormReducer,
    editingDiscount,
    initDiscountFormState,
  );

  const handleFormatValue = (val: string) => {
    if (state.type === "fixed") return formatPriceInput(val);
    const digits = val.replace(/\D/g, "");
    return digits ? Math.min(parseInt(digits), 100).toString() : "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.name.trim()) {
      dispatch({ type: "SET_ERROR", payload: "Nama diskon harus diisi" });
      return;
    }

    const parsedValue = parsePrice(state.value);
    if (isNaN(parsedValue) || parsedValue <= 0) {
      dispatch({
        type: "SET_ERROR",
        payload: "Nilai diskon harus lebih dari 0",
      });
      return;
    }
    if (state.type === "percent" && parsedValue > 100) {
      dispatch({
        type: "SET_ERROR",
        payload: "Diskon persentase tidak boleh lebih dari 100%",
      });
      return;
    }

    dispatch({ type: "SET_SUBMITTING", payload: true });
    dispatch({ type: "SET_ERROR", payload: "" });
    try {
      await onSave({
        name: state.name.trim(),
        type: state.type,
        value: parsedValue,
        expiresAt: state.expiresAt
          ? new Date(state.expiresAt).toISOString()
          : undefined,
      });
      onClose();
    } catch {
      dispatch({
        type: "SET_ERROR",
        payload: editingDiscount
          ? "Gagal mengubah diskon"
          : "Gagal menambahkan diskon",
      });
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end md:items-center justify-center md:p-4 transition-all duration-300 pointer-events-auto opacity-100">
      <button
        type="button"
        aria-label="Tutup"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClose();
        }}
      />
      <div
        className="relative bg-surface-container-lowest shadow-2xl flex flex-col w-full z-10 transition-all duration-300 ease-out rounded-t-3xl md:rounded-2xl md:max-w-md"
        style={{ maxHeight: "85dvh" }}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0 md:hidden">
          <div className="w-12 h-1 bg-surface-container-highest rounded-full" />
        </div>
        <div className="px-5 pb-4 pt-4 md:pt-5 border-b border-surface-container-high flex items-start justify-between shrink-0">
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
            type="button"
            id="btn-close-drawer"
            onClick={onClose}
            aria-label="Tutup"
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
        <form
          onSubmit={handleSave}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        >
          <div>
            <label
              htmlFor="type-percent"
              className="block text-xs font-bold text-secondary mb-2 uppercase tracking-wide"
            >
              Tipe Diskon
            </label>
            <div className="flex gap-2 p-1 bg-surface-container rounded-lg">
              {(["percent", "fixed"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  id={`type-${t}`}
                  onClick={() => dispatch({ type: "SET_TYPE", payload: t })}
                  className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                    state.type === t
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  {t === "percent" ? "Persentase (%)" : "Nominal Tetap (Rp)"}
                </button>
              ))}
            </div>
          </div>
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
              value={state.name}
              onChange={(e) => {
                dispatch({ type: "SET_NAME", payload: e.target.value });
              }}
              placeholder="Contoh: Diskon Member Baru, Promo Lebaran"
              className="w-full px-4 py-3 border border-outline-variant rounded-lg text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary bg-surface-container-lowest transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="input-discount-value"
              className="block text-xs font-bold text-secondary mb-2 uppercase tracking-wide"
            >
              {state.type === "percent"
                ? "Nilai Potongan (%)"
                : "Nominal Potongan (Rp)"}
            </label>
            <div className="relative">
              {state.type === "fixed" && (
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-secondary font-bold">
                  Rp
                </span>
              )}
              <input
                id="input-discount-value"
                type="text"
                inputMode="numeric"
                value={state.value}
                onChange={(e) => {
                  dispatch({
                    type: "SET_VALUE",
                    payload: handleFormatValue(e.target.value),
                  });
                }}
                placeholder={
                  state.type === "percent" ? "Contoh: 10" : "Contoh: 5.000"
                }
                className={`w-full py-3 border border-outline-variant rounded-lg text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary bg-surface-container-lowest transition-all ${state.type === "fixed" ? "pl-9 pr-4" : "px-4"}`}
              />
              {state.type === "percent" && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-secondary font-bold">
                  %
                </span>
              )}
            </div>
          </div>
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
              value={state.expiresAt}
              onChange={(e) =>
                dispatch({ type: "SET_EXPIRES_AT", payload: e.target.value })
              }
              className="w-full px-4 py-3 border border-outline-variant rounded-lg text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary bg-surface-container-lowest transition-all"
            />
            <p className="text-secondary/70 text-xs mt-1">
              Kosongkan jika diskon berlaku selamanya tanpa batas waktu.
            </p>
          </div>
          {state.error && (
            <div className="flex items-center gap-2 bg-error-container/20 border border-error text-error text-xs font-semibold px-3 py-2.5 rounded-lg">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
                <line
                  x1="12"
                  y1="16"
                  x2="12.01"
                  y2="16"
                  strokeLinecap="round"
                />
              </svg>
              {state.error}
            </div>
          )}
        </form>
        <div className="px-5 py-4 border-t border-surface-container-high bg-surface-container-low flex gap-3 shrink-0 rounded-b-2xl">
          <button
            type="button"
            id="btn-cancel"
            onClick={onClose}
            className="flex-1 py-3 bg-surface-container-lowest border border-outline rounded-lg text-secondary font-bold text-sm hover:bg-surface-container active:scale-[0.98] cursor-pointer transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            id="btn-submit"
            onClick={handleSave}
            disabled={state.isSubmitting}
            className="flex-1 py-3 bg-primary hover:bg-primary-dark disabled:bg-surface-container-highest disabled:text-secondary text-on-primary font-bold text-sm rounded-lg shadow-active active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 transition-all"
          >
            {state.isSubmitting ? (
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
                </svg>{" "}
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
  );
}

export default function DiskonsScreen() {
  const {
    discounts,
    discountsLoading,
    addDiscount,
    updateDiscount,
    toggleDiscountActive,
    deleteDiscount,
  } = usePOS();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  const totalCount = discounts.length;
  const activeCount = discounts.filter((d) => d.isActive).length;
  const percentCount = discounts.filter((d) => d.type === "percent").length;
  const fixedCount = discounts.filter((d) => d.type === "fixed").length;

  const openAddDrawer = () => {
    setEditingDiscount(null);
    setDrawerOpen(true);
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setDrawerOpen(true);
  };

  return (
    <div className="flex flex-col min-h-full relative overflow-x-hidden font-sans">
      <DiscountHeader
        totalCount={totalCount}
        activeCount={activeCount}
        percentCount={percentCount}
        fixedCount={fixedCount}
        isLoading={discountsLoading}
        onAdd={openAddDrawer}
      />

      <DiscountList
        discounts={discounts}
        isLoading={discountsLoading}
        onEdit={handleEdit}
        onToggleActive={toggleDiscountActive}
        onDelete={deleteDiscount}
        onAdd={openAddDrawer}
      />

      {drawerOpen && (
        <DiscountForm
          editingDiscount={editingDiscount}
          onClose={() => setDrawerOpen(false)}
          onSave={async (data) => {
            if (editingDiscount) {
              await updateDiscount(editingDiscount.id, {
                ...data,
                isActive: editingDiscount.isActive,
              });
            } else {
              await addDiscount({ ...data, isActive: true });
            }
          }}
        />
      )}
    </div>
  );
}
