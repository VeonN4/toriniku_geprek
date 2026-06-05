"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePOS } from "../context/POSContext";
import { formatPriceInput } from "../../lib/utils/format";

export default function PesananBaruScreen() {
  const { addOrder } = usePOS();
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState("");
  const [notes, setNotes] = useState("");
  const [total, setTotal] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    if (!customerName.trim()) {
      setError("Nama pelanggan / nomor meja harus diisi");
      return;
    }
    if (!items.trim()) {
      setError("Menu yang dipesan harus diisi");
      return;
    }
    addOrder({
      customerName: customerName.trim(),
      items: items.trim(),
      notes: notes.trim() || undefined,
      total: parseInt(total.replace(/\D/g, ""), 10) || 0,
    });
    setSuccess(true);
    setTimeout(() => {
      router.push("/pesanan");
      router.refresh();
    }, 800);
  };

  const goBack = () => {
    router.push("/pesanan");
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-primary px-5 md:px-8 pt-8 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary-container rounded-full opacity-40" />
        <div className="relative z-10 flex items-center gap-3">
          <button
            id="btn-back-pesanan-baru"
            onClick={goBack}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/20 active:scale-90 cursor-pointer"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15 18-6-6 6-6"
              />
            </svg>
          </button>
          <h1 className="text-white text-xl font-bold">Pesanan Baru</h1>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-4 md:px-8 py-5 pb-24 md:pb-8 bg-background">
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient max-w-full">
          <h2 className="text-base font-bold text-on-surface mb-4">
            Detail Pesanan Pelanggan
          </h2>

          {/* Customer */}
          <div className="mb-4">
            <label
              htmlFor="input-customer-name"
              className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide"
            >
              Nama Pelanggan / Nomor Meja
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                  />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <input
                id="input-customer-name"
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setError("");
                }}
                placeholder="Contoh: Meja 05 atau Andi"
                className="w-full pl-9 pr-4 py-3 border border-outline rounded-xl text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest transition-all"
              />
            </div>
          </div>

          {/* Items */}
          <div className="mb-4">
            <label
              htmlFor="input-items"
              className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide"
            >
              Menu yang Dipesan
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 2h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3zM7 13H3M12 2v20M17 7l5-5M22 7c0 4-4.5 5-6 2.5"
                  />
                </svg>
              </div>
              <textarea
                id="input-items"
                rows={3}
                value={items}
                onChange={(e) => {
                  setItems(e.target.value);
                  setError("");
                }}
                placeholder="Contoh: 2x Ayam Geprek S2, 1x Es Teh"
                className="w-full pl-9 pr-4 py-3 border border-outline rounded-xl text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest transition-all resize-none"
              />
            </div>
          </div>

          {/* Total */}
          <div className="mb-4">
            <label
              htmlFor="input-total"
              className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide"
            >
              Total Harga (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-outline font-medium">
                Rp
              </span>
              <input
                id="input-total"
                type="text"
                inputMode="numeric"
                value={total}
                onChange={(e) => setTotal(formatPriceInput(e.target.value))}
                placeholder="Contoh: 50.000"
                className="w-full pl-10 pr-4 py-3 border border-outline rounded-xl text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest transition-all"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label
              htmlFor="input-order-notes"
              className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide"
            >
              Catatan Tambahan
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                  />
                </svg>
              </div>
              <textarea
                id="input-order-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Sambal dipisah, es teh manis"
                className="w-full pl-9 pr-4 py-3 border border-outline rounded-xl text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest transition-all resize-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-error text-xs mb-3 font-semibold">{error}</p>
          )}

          <button
            id="btn-simpan-pesanan"
            onClick={handleSave}
            disabled={success}
            className={`w-full py-3.5 rounded-2xl text-white font-bold text-sm active:scale-[0.98] cursor-pointer transition-all ${
              success
                ? "bg-tertiary shadow-active"
                : "bg-primary hover:bg-primary-dark shadow-active"
            }`}
          >
            {success ? "✓ Order Tersimpan!" : "Simpan & Proses Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
