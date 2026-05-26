"use client";

import { useState } from "react";
import { usePOS } from "../context/POSContext";

export default function TambahMenuScreen() {
  const { addMenuItem, setActiveScreen, setActiveTab } = usePOS();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"food" | "drink">("food");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    if (!name.trim()) { setError("Nama menu tidak boleh kosong"); return; }
    const parsedPrice = parseInt(price.replace(/\D/g, ""), 10);
    if (!parsedPrice || parsedPrice <= 0) { setError("Harga harus lebih dari 0"); return; }
    addMenuItem({ name: name.trim(), price: parsedPrice, category, status: "Ready", note: note.trim() || undefined });
    setSuccess(true);
    setTimeout(() => { setActiveTab("menu"); setActiveScreen("menu"); }, 800);
  };

  const formatPrice = (val: string) => {
    const digits = val.replace(/\D/g, "");
    return digits ? parseInt(digits).toLocaleString("id-ID") : "";
  };

  const goBack = () => { setActiveTab("menu"); setActiveScreen("menu"); };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-orange-500 px-5 md:px-8 pt-8 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-orange-400 rounded-full opacity-40" />
        <div className="relative z-10 flex items-center gap-3">
          <button
            id="btn-back-tambah-menu"
            onClick={goBack}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/20 active:scale-90 cursor-pointer"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-white text-xl font-bold">Tambah Menu</h1>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-4 md:px-8 py-5 pb-24 md:pb-8 bg-gray-50">
        <div className="bg-white rounded-2xl p-5 shadow-sm max-w-lg">
          <h2 className="text-base font-bold text-gray-800 mb-4">Detail Menu</h2>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Kategori</label>
            <div className="flex gap-2">
              {(["food", "drink"] as const).map((c) => (
                <button
                  key={c}
                  id={`cat-${c}`}
                  onClick={() => setCategory(c)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 cursor-pointer ${
                    category === c ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {c === "food" ? "🍗 Makanan" : "🥤 Minuman"}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label htmlFor="input-menu-name" className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Nama Menu Baru</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 2h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3zM7 13H3M12 2v20M17 7l5-5M22 7c0 4-4.5 5-6 2.5" />
                </svg>
              </div>
              <input
                id="input-menu-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="Contoh: Ayam Geprek Mozarella"
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {/* Price */}
          <div className="mb-4">
            <label htmlFor="input-menu-price" className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Harga (Rp)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">Rp</span>
              <input
                id="input-menu-price"
                type="text"
                inputMode="numeric"
                value={price}
                onChange={(e) => { setPrice(formatPrice(e.target.value)); setError(""); }}
                placeholder="Contoh: 18.000"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {/* Note */}
          <div className="mb-4">
            <label htmlFor="input-menu-note" className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Catatan Menu Baru</label>
            <div className="relative">
              <div className="absolute left-3 top-3">
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <textarea
                id="input-menu-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Pedas, Sedang, Tidak Pedas"
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs mb-3 font-medium">{error}</p>}

          <button
            id="btn-simpan-menu"
            onClick={handleSave}
            disabled={success}
            className={`w-full py-3.5 rounded-2xl text-white font-bold text-sm active:scale-[0.98] cursor-pointer ${
              success ? "bg-green-500" : "bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200"
            }`}
          >
            {success ? "✓ Tersimpan!" : "Simpan Menu Baru"}
          </button>
        </div>
      </div>
    </div>
  );
}
