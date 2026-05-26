"use client";

import { useState } from "react";
import { usePOS } from "../context/POSContext";

export default function PesananBaruScreen() {
  const { addOrder, setActiveScreen, setActiveTab } = usePOS();
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState("");
  const [notes, setNotes] = useState("");
  const [total, setTotal] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const formatPrice = (val: string) => {
    const digits = val.replace(/\D/g, "");
    return digits ? parseInt(digits).toLocaleString("id-ID") : "";
  };

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
      status: "Baru",
    });
    setSuccess(true);
    setTimeout(() => {
      setActiveTab("pesanan");
      setActiveScreen("pesanan");
    }, 800);
  };

  const goBack = () => {
    setActiveTab("pesanan");
    setActiveScreen("pesanan");
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-orange-500 px-5 md:px-8 pt-8 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-orange-400 rounded-full opacity-40" />
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
      <div className="flex-1 px-4 md:px-8 py-5 pb-24 md:pb-8 bg-gray-50">
        <div className="bg-white rounded-2xl p-5 shadow-sm max-w-full">
          <h2 className="text-base font-bold text-gray-800 mb-4">
            Detail Pesanan Pelanggan
          </h2>

          {/* Customer */}
          <div className="mb-4">
            <label
              htmlFor="input-customer-name"
              className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide"
            >
              Nama Pelanggan / Nomor Meja
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg
                  className="w-4 h-4 text-orange-400"
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
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {/* Items */}
          <div className="mb-4">
            <label
              htmlFor="input-items"
              className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide"
            >
              Menu yang Dipesan
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3">
                <svg
                  className="w-4 h-4 text-orange-400"
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
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
              />
            </div>
          </div>

          {/* Total */}
          <div className="mb-4">
            <label
              htmlFor="input-total"
              className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide"
            >
              Total Harga (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                Rp
              </span>
              <input
                id="input-total"
                type="text"
                inputMode="numeric"
                value={total}
                onChange={(e) => setTotal(formatPrice(e.target.value))}
                placeholder="Contoh: 50.000"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label
              htmlFor="input-order-notes"
              className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide"
            >
              Catatan Tambahan
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3">
                <svg
                  className="w-4 h-4 text-orange-400"
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
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs mb-3 font-medium">{error}</p>
          )}

          <button
            id="btn-simpan-pesanan"
            onClick={handleSave}
            disabled={success}
            className={`w-full py-3.5 rounded-2xl text-white font-bold text-sm active:scale-[0.98] cursor-pointer ${
              success
                ? "bg-green-500"
                : "bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200"
            }`}
          >
            {success ? "✓ Order Tersimpan!" : "Simpan & Proses Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
