"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePOS } from "../context/POSContext";
import { formatPriceInput, formatRupiahDelta } from "../../lib/utils/format";

interface DraftModifier {
  id: string; // local key only, not sent to DB
  name: string;
  priceDelta: number;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

export default function TambahMenuScreen() {
  const { addMenuItemWithModifiers, categories, categoriesLoading } = usePOS();
  const router = useRouter();

  // ── Core Menu Fields ──────────────────────────────────────────
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"Ready" | "Habis">("Ready");

  // ── Modifier Draft State ──────────────────────────────────────
  const [modifiers, setModifiers] = useState<DraftModifier[]>([]);
  const [modName, setModName] = useState("");
  const [modPrice, setModPrice] = useState("");

  // ── UI State ─────────────────────────────────────────────────
  const [error, setError] = useState("");
  const [modError, setModError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Add Modifier to local draft list ─────────────────────────
  const handleAddModifier = () => {
    if (!modName.trim()) {
      setModError("Nama modifier tidak boleh kosong");
      return;
    }
    const delta = parseInt(modPrice.replace(/\D/g, "") || "0", 10);
    setModifiers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: modName.trim(), priceDelta: delta },
    ]);
    setModName("");
    setModPrice("");
    setModError("");
  };

  const handleRemoveModifier = (id: string) => {
    setModifiers((prev) => prev.filter((m) => m.id !== id));
  };

  // ── Save ─────────────────────────────────────────────────────
  const handleSave = async () => {
    setError("");
    if (!name.trim()) {
      setError("Nama menu tidak boleh kosong");
      return;
    }
    const parsedPrice = parseInt(price.replace(/\D/g, ""), 10);
    if (!parsedPrice || parsedPrice <= 0) {
      setError("Harga harus lebih dari 0");
      return;
    }

    setIsSubmitting(true);
    try {
      // Auto-include pending modifier if any is typed in the inputs
      let finalModifiers = [...modifiers];
      if (modName.trim()) {
        const delta = parseInt(modPrice.replace(/\D/g, "") || "0", 10);
        finalModifiers.push({
          id: crypto.randomUUID(),
          name: modName.trim(),
          priceDelta: delta
        });
      }

      await addMenuItemWithModifiers(
        {
          name: name.trim(),
          price: parsedPrice,
          category: categoryId, // real UUID from categories table
          status,
          note: description.trim() || undefined,
        },
        finalModifiers.map((m) => ({ name: m.name, priceDelta: m.priceDelta }))
      );
      setSuccess(true);
      setTimeout(() => {
        router.push("/menu");
        router.refresh();
      }, 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan menu";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Header ── */}
      <div className="bg-primary px-5 md:px-8 pt-8 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary-container rounded-full opacity-40" />
        <div className="relative z-10 flex items-center gap-3">
          <button
            id="btn-back-tambah-menu"
            onClick={() => router.push("/menu")}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/20 active:scale-90 cursor-pointer"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">Tambah Menu</h1>
            <p className="text-on-primary/80 text-xs mt-0.5">Isi detail dan modifier untuk menu baru</p>
          </div>
        </div>
      </div>

      {/* ── Form Body ── */}
      <div className="flex-1 px-4 md:px-8 py-5 pb-24 md:pb-8 bg-background space-y-4">

        {/* ─ Core Details Card ─ */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient border border-outline-variant">
          <h2 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-xs font-bold">1</span>
            Detail Menu
          </h2>

          {/* Name */}
          <div className="mb-4">
            <label htmlFor="input-menu-name" className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
              Nama Menu <span className="text-error">*</span>
            </label>
            <input
              id="input-menu-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="Contoh: Ayam Geprek Mozarella"
              className="w-full px-4 py-3 border border-outline rounded-xl text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest transition-all"
            />
          </div>

          {/* Price */}
          <div className="mb-4">
            <label htmlFor="input-menu-price" className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
              Harga (Rp) <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-outline font-semibold">Rp</span>
              <input
                id="input-menu-price"
                type="text"
                inputMode="numeric"
                value={price}
                onChange={(e) => { setPrice(formatPriceInput(e.target.value)); setError(""); }}
                placeholder="Contoh: 18.000"
                className="w-full pl-10 pr-4 py-3 border border-outline rounded-xl text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest transition-all"
              />
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <label htmlFor="input-menu-category" className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
              Kategori
            </label>
            {categoriesLoading ? (
              <Skeleton className="h-11 w-full" />
            ) : (
              <select
                id="input-menu-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 border border-outline rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest cursor-pointer transition-all"
              >
                <option value="">— Tanpa Kategori —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="input-menu-description" className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
              Deskripsi / Catatan
            </label>
            <textarea
              id="input-menu-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Pilihan level pedas tersedia"
              className="w-full px-4 py-3 border border-outline rounded-xl text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest transition-all resize-none"
            />
          </div>

          {/* Status toggle */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
              Ketersediaan
            </label>
            <div className="flex gap-2 p-1 bg-surface-container rounded-xl">
              {(["Ready", "Habis"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  id={`status-${s.toLowerCase()}`}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    status === s
                      ? "bg-surface-container-lowest text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {s === "Ready" ? "✅ Tersedia" : "❌ Habis"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─ Modifiers Card ─ */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient border border-outline-variant">
          <h2 className="text-sm font-bold text-on-surface mb-1 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-xs font-bold">2</span>
            Modifier / Opsi Tambahan
            <span className="ml-auto text-xs text-outline font-normal">{modifiers.length} ditambahkan</span>
          </h2>
          <p className="text-xs text-on-surface-variant mb-4">
            Tambahkan pilihan tambahan seperti level pedas, extra keju, dll. Harga bisa 0 (gratis).
          </p>

          {/* Added modifiers list */}
          {modifiers.length > 0 && (
            <div className="space-y-2 mb-4">
              {modifiers.map((mod) => (
                <div
                  key={mod.id}
                  className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{mod.name}</p>
                    <p className="text-xs text-primary font-bold">{formatRupiahDelta(mod.priceDelta)}</p>
                  </div>
                  <button
                    type="button"
                    id={`btn-remove-mod-${mod.id}`}
                    onClick={() => handleRemoveModifier(mod.id)}
                    className="text-outline hover:text-error p-1 cursor-pointer transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add modifier form row */}
          <div className="bg-surface-container-low rounded-xl p-3 border border-surface-container-high">
            <p className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide">Tambah Modifier Baru</p>
            <div className="flex gap-2 mb-2">
              <input
                id="input-mod-name"
                type="text"
                value={modName}
                onChange={(e) => { setModName(e.target.value); setModError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleAddModifier()}
                placeholder="Nama modifier (mis: Extra Keju)"
                className="flex-1 px-3 py-2.5 border border-outline rounded-xl text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest transition-all"
              />
              <div className="relative w-32 flex-shrink-0">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-outline font-semibold">Rp</span>
                <input
                  id="input-mod-price"
                  type="text"
                  inputMode="numeric"
                  value={modPrice}
                  onChange={(e) => setModPrice(formatPriceInput(e.target.value))}
                  onKeyDown={(e) => e.key === "Enter" && handleAddModifier()}
                  placeholder="0"
                  className="w-full pl-8 pr-2 py-2.5 border border-outline rounded-xl text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest transition-all"
                />
              </div>
            </div>
            {modError && (
              <p className="text-error text-xs mb-2 font-semibold">{modError}</p>
            )}
            <button
              type="button"
              id="btn-add-modifier"
              onClick={handleAddModifier}
              className="w-full py-2 border-2 border-dashed border-primary/40 text-primary hover:border-primary hover:bg-primary/5 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
              </svg>
              Tambah Modifier
            </button>
          </div>
        </div>

        {/* ─ Error & Save ─ */}
        {error && (
          <div className="flex items-center gap-2 bg-error-container/20 border border-error-container/40 text-error text-xs font-semibold px-4 py-3 rounded-xl">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" /><line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        <button
          id="btn-simpan-menu"
          type="button"
          onClick={handleSave}
          disabled={isSubmitting || success}
          className={`w-full py-4 rounded-2xl text-white font-bold text-sm active:scale-[0.98] cursor-pointer transition-all flex items-center justify-center gap-2 ${
            success
              ? "bg-tertiary shadow-active"
              : "bg-primary hover:bg-primary-dark shadow-active disabled:opacity-60"
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Menyimpan...
            </>
          ) : success ? (
            "✓ Menu Berhasil Disimpan!"
          ) : (
            `Simpan Menu${modifiers.length > 0 ? ` + ${modifiers.length} Modifier` : ""}`
          )}
        </button>
      </div>
    </div>
  );
}
