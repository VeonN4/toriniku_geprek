"use client";

import { MenuItem, Modifier } from "../../../context/POSContext";
import { formatRupiah } from "../../../../lib/utils/format";

interface ModifiersModalProps {
  item: MenuItem;
  modifiers: Modifier[];
  selectedModifierIds: string[];
  tempNotes: string;
  onToggleModifier: (modId: string) => void;
  onNotesChange: (notes: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ModifiersModal({
  item,
  modifiers,
  selectedModifierIds,
  tempNotes,
  onToggleModifier,
  onNotesChange,
  onConfirm,
  onClose,
}: ModifiersModalProps) {
  return (
    <div className="fixed inset-0 z-[60] overflow-hidden flex items-end md:items-center justify-center md:p-4">
      <button type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Tutup modal"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClose(); }}
      />
      <div
        className="relative bg-surface-container-lowest rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:max-w-md z-10 p-5 md:p-6 flex flex-col animate-scale-up"
        style={{ maxHeight: "90dvh" }}
      >
        <div>
          <div className="flex justify-between items-start border-b border-surface-container-high pb-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-on-surface uppercase tracking-wide">
                Opsi Tambahan Menu
              </h3>
              <p className="text-primary font-bold text-sm mt-0.5">
                {item.name}
              </p>
            </div>
            <button type="button"
              aria-label="Tutup"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-secondary hover:text-on-surface cursor-pointer transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: "40dvh" }}>
            {modifiers.length === 0 ? (
              <p className="text-secondary text-xs text-center py-4">
                Tidak ada opsi tambahan untuk menu ini.
              </p>
            ) : (
              modifiers.map((mod) => {
                const isChecked = selectedModifierIds.includes(mod.id);
                return (
                  <button
                    type="button"
                    key={mod.id}
                    onClick={() => onToggleModifier(mod.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg text-left cursor-pointer transition-all ${
                      isChecked
                        ? "border-primary bg-primary/5 text-primary font-semibold"
                        : "border-outline-variant text-secondary hover:bg-surface-container-low"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isChecked ? "bg-primary border-primary" : "border-outline bg-surface-container-lowest"
                      }`}>
                        {isChecked && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs">{mod.name}</span>
                    </div>
                    {mod.priceDelta > 0 && (
                      <span className="text-xs font-bold">+{formatRupiah(mod.priceDelta)}</span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-4">
            <label htmlFor="modal-notes" className="block text-xxs font-bold text-secondary uppercase tracking-wider mb-1.5">
              Catatan Tambahan
            </label>
            <input
              id="modal-notes"
              type="text"
              aria-label="Catatan tambahan"
              value={tempNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Contoh: Sambal dipisah, less sugar..."
              className="w-full px-3 py-2 border border-outline rounded-lg text-xs text-on-surface placeholder-secondary focus:outline-none focus:border-primary bg-surface-container-low/30 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 border-t border-surface-container-high pt-4 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-outline rounded-lg text-secondary font-bold text-xs hover:bg-surface-container active:scale-[0.98] cursor-pointer transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-on-primary font-bold text-xs rounded-lg shadow-active active:scale-[0.98] cursor-pointer transition-all"
          >
            Tambah ke Orderan
          </button>
        </div>
      </div>
    </div>
  );
}
