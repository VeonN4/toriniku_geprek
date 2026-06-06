"use client";

import { useEffect, useRef, useReducer } from "react";
import { usePOS, Modifier, MenuItem, Category } from "../context/POSContext";
import {
  formatRupiahDelta,
  formatPriceInput,
  parsePrice,
} from "../../lib/utils/format";

interface ItemEditState {
  name: string;
  price: string;
  category: string;
  note: string;
  saved: boolean;
}

type ItemEditAction =
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_PRICE"; payload: string }
  | { type: "SET_CATEGORY"; payload: string }
  | { type: "SET_NOTE"; payload: string }
  | { type: "SET_SAVED"; payload: boolean };

function itemEditReducer(
  state: ItemEditState,
  action: ItemEditAction,
): ItemEditState {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.payload };
    case "SET_PRICE":
      return { ...state, price: action.payload };
    case "SET_CATEGORY":
      return { ...state, category: action.payload };
    case "SET_NOTE":
      return { ...state, note: action.payload };
    case "SET_SAVED":
      return { ...state, saved: action.payload };
  }
}

const INITIAL_ITEM_EDIT: ItemEditState = {
  name: "",
  price: "",
  category: "",
  note: "",
  saved: false,
};

interface Props {
  item: MenuItem | null;
  onClose: () => void;
}

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
  const [name, setName] = useState(() => mod.name);
  const [price, setPrice] = useState(() =>
    mod.priceDelta === 0
      ? ""
      : Math.abs(mod.priceDelta).toLocaleString("id-ID"),
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      setErr("Nama tidak boleh kosong");
      return;
    }
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
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 space-y-2 animate-scale-up">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          aria-label="Nama modifier"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErr("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="Nama modifier"
          className="flex-1 px-3 py-2 border border-outline-variant rounded-lg text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary bg-surface-container-lowest transition-all"
        />
        <div className="relative w-28 flex-shrink-0">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-secondary font-semibold">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Harga modifier"
            value={price}
            onChange={(e) => setPrice(formatPriceInput(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="0"
            className="w-full pl-8 pr-2 py-2 border border-outline-variant rounded-lg text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary bg-surface-container-lowest transition-all"
          />
        </div>
      </div>
      {err && <p className="text-error text-xs font-semibold">{err}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2 bg-primary hover:bg-primary-dark text-on-primary rounded-lg text-sm font-semibold transition-all disabled:opacity-60 cursor-pointer shadow-active"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 bg-surface-container hover:bg-surface-container-high text-secondary rounded-lg text-sm font-semibold transition-all cursor-pointer"
        >
          Batal
        </button>
      </div>
    </div>
  );
}

// ── AddRow — form to add a new modifier ──────────────────────────────────────

function AddRow({
  onAdd,
}: {
  onAdd: (name: string, priceDelta: number) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState("");

  const handleAdd = async () => {
    if (!name.trim()) {
      setErr("Nama tidak boleh kosong");
      return;
    }
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
    <div className="bg-surface-container-low rounded-2xl p-3 border border-surface-container-high space-y-2">
      <p className="text-xs font-bold text-secondary uppercase tracking-wide">
        Tambah Modifier Baru
      </p>
      <div className="flex gap-2">
        <input
          id="input-new-mod-name"
          type="text"
          aria-label="Nama modifier baru"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErr("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Nama modifier (mis: Extra Keju)"
          className="flex-1 px-3 py-2.5 border border-outline-variant rounded-lg text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary bg-surface-container-lowest transition-all"
        />
        <div className="relative w-28 flex-shrink-0">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-secondary font-semibold">
            Rp
          </span>
          <input
            id="input-new-mod-price"
            type="text"
            inputMode="numeric"
            aria-label="Harga modifier baru"
            value={price}
            onChange={(e) => setPrice(formatPriceInput(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="0"
            className="w-full pl-8 pr-2 py-2.5 border border-outline-variant rounded-lg text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary bg-surface-container-lowest transition-all"
          />
        </div>
      </div>
      {err && <p className="text-error text-xs font-semibold">{err}</p>}
      <button
        id="btn-add-new-modifier"
        type="button"
        onClick={handleAdd}
        disabled={adding}
        className="w-full py-2.5 border-2 border-dashed border-primary/40 text-primary hover:border-primary hover:bg-primary/5 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
      >
        {adding ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
        ) : (
          <svg
            className="w-4 h-4"
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
        )}
        {adding ? "Menambah..." : "Tambah Modifier"}
      </button>
    </div>
  );
}

// ── ItemDetailForm — inline editor for the menu item ─────────────────────────

function ItemDetailForm({
  editState,
  dispatch,
  categories,
  onSave,
}: {
  editState: ItemEditState;
  dispatch: React.Dispatch<ItemEditAction>;
  categories: Category[];
  onSave: () => Promise<void>;
}) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-4 border border-surface-container-high space-y-3">
      <p className="text-xs font-bold text-secondary uppercase tracking-wide">
        Detail Menu
      </p>
      <div>
        <label htmlFor="edit-item-name" className="text-xs font-semibold text-secondary block mb-1">
          Nama Menu
        </label>
        <input
          id="edit-item-name"
          type="text"
          aria-label="Nama Menu"
          value={editState.name}
          onChange={(e) => dispatch({ type: "SET_NAME", payload: e.target.value })}
          className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary bg-surface-container-lowest transition-all"
        />
      </div>
      <div>
        <label htmlFor="edit-item-price" className="text-xs font-semibold text-secondary block mb-1">
          Harga (Rp)
        </label>
        <input
          id="edit-item-price"
          type="text"
          inputMode="numeric"
          aria-label="Harga (Rp)"
          value={editState.price}
          onChange={(e) => dispatch({ type: "SET_PRICE", payload: formatPriceInput(e.target.value) })}
          className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary bg-surface-container-lowest transition-all"
        />
      </div>
      <div>
        <label htmlFor="edit-item-category" className="text-xs font-semibold text-secondary block mb-1">
          Kategori
        </label>
        <select
          id="edit-item-category"
          value={editState.category}
          onChange={(e) => dispatch({ type: "SET_CATEGORY", payload: e.target.value })}
          aria-label="Kategori"
          className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary transition-all"
        >
          <option value="">Tidak ada</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="edit-item-note" className="text-xs font-semibold text-secondary block mb-1">
          Deskripsi / Catatan
        </label>
        <textarea
          id="edit-item-note"
          value={editState.note}
          onChange={(e) => dispatch({ type: "SET_NOTE", payload: e.target.value })}
          rows={2}
          aria-label="Deskripsi / Catatan"
          className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary bg-surface-container-lowest transition-all resize-none"
        />
      </div>
      <button
        id="btn-save-item-details"
        type="button"
        onClick={onSave}
        className="w-full py-2.5 bg-primary hover:bg-primary-dark text-on-primary rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-active flex items-center justify-center gap-2"
      >
        {editState.saved ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Tersimpan
          </>
        ) : (
          "Simpan Detail Menu"
        )}
      </button>
    </div>
  );
}

// ── ModifierDrawer — main component ──────────────────────────────────────────

export default function ModifierDrawer({ item, onClose }: Props) {
  // TODO: extract remaining sections (modifier list, header) into subcomponents
  const {
    modifiers,
    addModifier,
    updateModifier,
    deleteModifier,
    updateMenuItem,
    categories,
  } = usePOS();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteErr, setDeleteErr] = useState("");
  const [open, setOpen] = useState(false);

  // Item editing state
  const [editState, dispatch] = useReducer(itemEditReducer, INITIAL_ITEM_EDIT);

  const backdropRef = useRef<HTMLDivElement>(null);

  const itemModifiers = item
    ? modifiers.filter((m) => m.menuItemId === item.id)
    : [];

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => setOpen(true));
  }, []);

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300);
  };

  const handleItemSave = async () => {
    if (!item || !editState.name.trim()) return;
    await updateMenuItem(item.id, {
      name: editState.name.trim(),
      price: parsePrice(editState.price),
      category: editState.category,
      note: editState.note.trim() || undefined,
    });
    dispatch({ type: "SET_SAVED", payload: true });
    setTimeout(() => dispatch({ type: "SET_SAVED", payload: false }), 2000);
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

  const handleUpdate = async (
    modId: string,
    name: string,
    priceDelta: number,
  ) => {
    await updateModifier(modId, name, priceDelta);
    setEditingId(null);
  };

  const handleAdd = async (name: string, priceDelta: number) => {
    if (!item) return;
    await addModifier(item.id, name, priceDelta);
  };

  if (!item) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] overflow-hidden flex items-end md:items-center justify-center md:p-4 transition-all duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
    >
      {/* Backdrop */}
      <button
        ref={backdropRef}
        type="button"
        aria-label="Tutup"
        onClick={handleClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClose();
          }
        }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Sheet / Modal dialog container */}
      <div
        className="relative bg-surface-container-lowest shadow-2xl flex flex-col w-full z-10 transition-all duration-300 ease-out rounded-t-3xl md:rounded-2xl md:max-w-md"
        style={{
          transform: open
            ? "translateY(0) scale(1)"
            : "translateY(100%) scale(0.95)",
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
              Edit Menu
            </h2>
            <p className="text-xs text-primary font-bold mt-0.5 truncate max-w-[15rem] md:max-w-xs">
              {item.name}
            </p>
          </div>
          <button type="button"
            id="btn-close-modifier-drawer"
            onClick={handleClose}
            aria-label="Tutup"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container active:scale-90 cursor-pointer text-secondary hover:text-on-surface mt-0.5 transition-colors"
          >
            <svg
              className="w-4 h-4"
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

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* ── Edit Menu Item ── */}
          <ItemDetailForm
            editState={editState}
            dispatch={dispatch}
            categories={categories}
            onSave={handleItemSave}
          />

          {/* ── Separator ── */}
          <div className="border-t border-surface-container-high" />

          {/* ── Modifier Section ── */}

          {/* Modifier list */}
          {itemModifiers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-secondary">
              <svg
                className="w-12 h-12 mb-2 opacity-35"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-sm font-medium">Belum ada modifier</p>
              <p className="text-xs mt-0.5 text-secondary/70">
                Tambah pilihan di bawah
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {deleteErr && (
                <p className="text-error text-xs font-semibold bg-error-container/20 px-3 py-2 rounded-lg">
                  {deleteErr}
                </p>
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
                    className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-2xl px-4 py-3 group transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-on-surface truncate">
                        {mod.name}
                      </p>
                      <p className="text-xs font-bold text-primary mt-0.5">
                        {formatRupiahDelta(mod.priceDelta)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      {/* Edit */}
                      <button
                        id={`btn-edit-mod-${mod.id}`}
                        type="button"
                        aria-label="Edit modifier"
                        onClick={() => {
                          setEditingId(mod.id);
                          setDeleteErr("");
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-secondary hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536M9 13l6.293-6.293a1 1 0 011.414 0l1.586 1.586a1 1 0 010 1.414L12 16H9v-3z"
                          />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        id={`btn-del-mod-${mod.id}`}
                        type="button"
                        onClick={() => handleDelete(mod.id)}
                        disabled={deletingId === mod.id}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-secondary hover:text-error hover:bg-error/10 transition-colors cursor-pointer disabled:opacity-40"
                        title="Hapus modifier"
                      >
                        {deletingId === mod.id ? (
                          <svg
                            className="w-3.5 h-3.5 animate-spin"
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
                        ) : (
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          {/* Add form — always visible */}
          <AddRow onAdd={handleAdd} />

          {/* Safe area spacer */}
          <div className="h-2" />
        </div>
      </div>
    </div>
  );
}
