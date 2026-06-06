"use client";

import { formatRupiah } from "../../../../lib/utils/format";

interface CartItemModifier {
  id: string;
  name: string;
  priceDelta: number;
}

export interface CartItem {
  cartId: string;
  item: { id: string; name: string; price: number; category: string; status: string; note?: string };
  quantity: number;
  selectedModifiers: CartItemModifier[];
  customNotes?: string;
}

interface CartItemCardProps {
  entry: CartItem;
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemove: (cartId: string) => void;
}

export function CartItemCard({ entry, onUpdateQuantity, onRemove }: CartItemCardProps) {
  const totalItemPrice =
    entry.item.price +
    entry.selectedModifiers.reduce((s, m) => s + m.priceDelta, 0);

  return (
    <div className="bg-surface-container-low rounded-xl p-3">
      <div className="flex gap-2 justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-on-surface text-sm truncate">
            {entry.item.name}
          </p>
          {entry.selectedModifiers.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {entry.selectedModifiers.map((mod) => (
                <span
                  key={mod.id}
                  className="bg-surface-container text-on-surface-variant text-xxs font-medium px-2 py-0.5 rounded-md"
                >
                  +{mod.name}
                </span>
              ))}
            </div>
          )}
          {entry.customNotes && (
            <p className="text-on-surface-variant text-xxs italic mt-0.5">
              Catatan: {entry.customNotes}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/30">
        <div className="flex items-center gap-1.5">
          <button type="button"
            onClick={() => onUpdateQuantity(entry.cartId, -1)}
            className="w-7 h-7 bg-surface-container text-on-surface-variant rounded-full flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-surface-container-high transition-colors"
          >
            -
          </button>
          <span className="text-sm font-bold w-5 text-center text-on-surface">
            {entry.quantity}
          </span>
          <button type="button"
            onClick={() => onUpdateQuantity(entry.cartId, 1)}
            className="w-7 h-7 bg-surface-container text-on-surface-variant rounded-full flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-surface-container-high transition-colors"
          >
            +
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary">
            {formatRupiah(totalItemPrice * entry.quantity)}
          </span>
          <button type="button"
            aria-label="Hapus item"
            onClick={() => onRemove(entry.cartId)}
            className="w-6 h-6 flex items-center justify-center text-outline hover:text-error hover:bg-error-container/30 rounded-full cursor-pointer transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
