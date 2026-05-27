"use client";

import { useEffect, useRef, useState } from "react";
import { usePOS, Modifier, MenuItem } from "../context/POSContext";

interface Props {
  item: MenuItem | null;
  onClose: () => void;
}

const formatRupiah = (n: number) =>
  n === 0 ? "Gratis" : (n > 0 ? "+" : "") + "Rp " + Math.abs(n).toLocaleString("id-ID");

const parsePrice = (val: string): number =>
  parseInt(val.replace(/\D/g, "") || "0", 10);

const formatPriceInput = (val: string): string => {
  const digits = val.replace(/\D/g, "");
  return digits ? parseInt(digits).toLocaleString("id-ID") : "";
};

// ── EditRow — inline editor for one modifier ──────────────────────────────────

function EditRow({
  mod,
  onSave,
  onCancel,
}: {
  mod: Modifier;
  onSave: (name: string, priceDelta: number) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(mod.name);
  const [price, setPrice] = useState(
    mod.priceDelta === 0 ? "" : Math.abs(mod.priceDelta).toLocaleString("id-ID")
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSave = async () => {
    if (!name.trim()) { setErr("Nama tidak boleh kosong"); return; }
    setSaving(true);
    try {
      await onSave(name.trim(), parsePrice(price));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 space-y-2">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setErr(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="Nama modifier"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
        />
        <div className="relative w-28 flex-shrink-0">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(formatPriceInput(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="0"
            className="w-full pl-8 pr-2 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
          />
        </div>
      </div>
      {err && <p className="text-red-500 text-xs font-medium">{err}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
        >
          Batal
        </button>
      </div>
    </div>
  );
}

// ── AddRow — form to add a new modifier ──────────────────────────────────────

function AddRow({ onAdd }: { onAdd: (name: string, priceDelta: number) => Promise<void> }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState("");

  const handleAdd = async () => {
    if (!name.trim()) { setErr("Nama tidak boleh kosong"); return; }
    setAdding(true);
    try {
      await onAdd(name.trim(), parsePrice(price));
      setName("");
      setPrice("");
      setErr("");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal menambah modifier");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tambah Modifier Baru</p>
      <div className="flex gap-2">
        <input
          id="input-new-mod-name"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setErr(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Nama modifier (mis: Extra Keju)"
          className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
        />
        <div className="relative w-28 flex-shrink-0">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">Rp</span>
          <input
            id="input-new-mod-price"
            type="text"
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(formatPriceInput(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="0"
            className="w-full pl-8 pr-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
          />
        </div>
      </div>
      {err && <p className="text-red-500 text-xs font-medium">{err}</p>}
      <button
        id="btn-add-new-modifier"
        type="button"
        onClick={handleAdd}
        disabled={adding}
        className="w-full py-2.5 border-2 border-dashed border-orange-300 text-orange-500 hover:border-orange-400 hover:bg-orange-50 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
      >
        {adding ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
          </svg>
        )}
        {adding ? "Menambah..." : "Tambah Modifier"}
      </button>
    </div>
  );
}

// ── ModifierDrawer — main component ──────────────────────────────────────────

export default function ModifierDrawer({ item, onClose }: Props) {
  const { modifiers, addModifier, updateModifier, deleteModifier } = usePOS();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteErr, setDeleteErr] = useState("");
  const [open, setOpen] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  const itemModifiers = item
    ? modifiers.filter((m) => m.menuItemId === item.id)
    : [];

  // Animate in on mount
  useEffect(() => {
    if (item) {
      requestAnimationFrame(() => setOpen(true));
      setEditingId(null);
      setDeleteErr("");
    } else {
      setOpen(false);
    }
  }, [item]);

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300);
  };

  const handleDelete = async (modId: string) => {
    setDeletingId(modId);
    setDeleteErr("");
    try {
      await deleteModifier(modId);
      if (editingId === modId) setEditingId(null);
    } catch (e: unknown) {
      setDeleteErr(e instanceof Error ? e.message : "Gagal menghapus");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdate = async (modId: string, name: string, priceDelta: number) => {
    await updateModifier(modId, name, priceDelta);
    setEditingId(null);
  };

  const handleAdd = async (name: string, priceDelta: number) => {
    if (!item) return;
    await addModifier(item.id, name, priceDelta);
  };

  if (!item) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleClose}
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          backgroundColor: "rgba(0,0,0,0.4)",
          opacity: open ? 1 : 0,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out flex flex-col"
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
          maxHeight: "85dvh",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pb-4 pt-2 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-800">Modifier</h2>
            <p className="text-xs text-orange-500 font-semibold mt-0.5 truncate max-w-xs">{item.name}</p>
          </div>
          <button
            id="btn-close-modifier-drawer"
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-90 cursor-pointer text-gray-400 hover:text-gray-600 mt-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">

          {/* Modifier list */}
          {itemModifiers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-300">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm font-medium text-gray-400">Belum ada modifier</p>
              <p className="text-xs text-gray-300 mt-0.5">Tambah pilihan di bawah</p>
            </div>
          ) : (
            <div className="space-y-2">
              {deleteErr && (
                <p className="text-red-500 text-xs font-medium bg-red-50 px-3 py-2 rounded-xl">{deleteErr}</p>
              )}
              {itemModifiers.map((mod) =>
                editingId === mod.id ? (
                  <EditRow
                    key={mod.id}
                    mod={mod}
                    onSave={(name, price) => handleUpdate(mod.id, name, price)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div
                    key={mod.id}
                    id={`modifier-row-${mod.id}`}
                    className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">{mod.name}</p>
                      <p className="text-xs font-medium text-orange-500 mt-0.5">{formatRupiah(mod.priceDelta)}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      {/* Edit */}
                      <button
                        id={`btn-edit-mod-${mod.id}`}
                        type="button"
                        onClick={() => { setEditingId(mod.id); setDeleteErr(""); }}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 hover:text-orange-500 hover:bg-orange-100 transition-colors cursor-pointer"
                        title="Edit modifier"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.293-6.293a1 1 0 011.414 0l1.586 1.586a1 1 0 010 1.414L12 16H9v-3z" />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        id={`btn-del-mod-${mod.id}`}
                        type="button"
                        onClick={() => handleDelete(mod.id)}
                        disabled={deletingId === mod.id}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                        title="Hapus modifier"
                      >
                        {deletingId === mod.id ? (
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Add form — always visible */}
          <AddRow onAdd={handleAdd} />

          {/* Safe area spacer */}
          <div className="h-2" />
        </div>
      </div>
    </>
  );
}
