"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  usePOS,
  MenuItem,
  Modifier,
  Discount,
} from "../../../context/POSContext";
import { formatRupiah, formatPriceInput } from "../../../../lib/utils/format";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );
}

interface CartItem {
  cartId: string; // unique cart entry ID (since same item can be added with different modifiers)
  item: MenuItem;
  quantity: number;
  selectedModifiers: Modifier[];
  customNotes?: string;
}

export default function PesananBaruPage() {
  const router = useRouter();
  const {
    menuItems,
    menuLoading,
    categories,
    categoriesLoading,
    modifiers,
    discounts,
    discountsLoading,
    addCompleteOrder,
  } = usePOS();

  // Search & Filter State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<"dine_in" | "takeaway">("dine_in");
  const [selectedDiscountId, setSelectedDiscountId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const [amountPaid, setAmountPaid] = useState("");

  // Modifiers Modal State
  const [activeItemForModifiers, setActiveItemForModifiers] =
    useState<MenuItem | null>(null);
  const [tempSelectedModifiers, setTempSelectedModifiers] = useState<
    Modifier[]
  >([]);
  const [tempNotes, setTempNotes] = useState("");

  // Mobile cart sheet
  const [cartOpen, setCartOpen] = useState(false);

  // Checkout Status
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForLater, setIsForLater] = useState(false);

  // ── Modifiers belonging to the current menu item ──
  const currentItemModifiers = useMemo(() => {
    if (!activeItemForModifiers) return [];
    return modifiers.filter(
      (mod) => mod.menuItemId === activeItemForModifiers.id,
    );
  }, [activeItemForModifiers, modifiers]);

  // ── Filtered Menu Items ──
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCategory =
        selectedCategoryId === "all" || item.category === selectedCategoryId;
      const matchSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch && item.status === "Ready";
    });
  }, [menuItems, selectedCategoryId, searchQuery]);

  // ── Active valid discounts ──
  const activeDiscounts = useMemo(() => {
    return discounts.filter((d) => {
      if (!d.isActive) return false;
      if (d.expiresAt && new Date(d.expiresAt).getTime() < new Date().getTime())
        return false;
      return true;
    });
  }, [discounts]);

  // ── Add Item Flow ──
  const handleItemClick = (item: MenuItem) => {
    const itemMods = modifiers.filter((mod) => mod.menuItemId === item.id);
    if (itemMods.length > 0) {
      // Open Modifiers Modal
      setActiveItemForModifiers(item);
      setTempSelectedModifiers([]);
      setTempNotes("");
    } else {
      // Add directly
      addToCart(item, [], "");
    }
  };

  const addToCart = (
    item: MenuItem,
    selectedMods: Modifier[],
    notes: string,
  ) => {
    // Generate a unique ID based on item and selected modifier IDs
    const modString = selectedMods
      .map((m) => m.id)
      .sort()
      .join("-");
    const cartId = `${item.id}-${modString}-${notes}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.cartId === cartId);
      if (existing) {
        return prev.map((i) =>
          i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i,
        );
      } else {
        return [
          ...prev,
          {
            cartId,
            item,
            quantity: 1,
            selectedModifiers: selectedMods,
            customNotes: notes,
          },
        ];
      }
    });
  };

  const handleConfirmModifiers = () => {
    if (activeItemForModifiers) {
      addToCart(activeItemForModifiers, tempSelectedModifiers, tempNotes);
      setActiveItemForModifiers(null);
    }
  };

  // ── Cart mutations ──
  const updateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.cartId === cartId ? { ...i, quantity: i.quantity + delta } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const removeCartItem = (cartId: string) => {
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  // ── Calculations ──
  const subtotal = useMemo(() => {
    return cart.reduce((sum, entry) => {
      const itemPrice = entry.item.price;
      const modsPrice = entry.selectedModifiers.reduce(
        (s, m) => s + m.priceDelta,
        0,
      );
      return sum + (itemPrice + modsPrice) * entry.quantity;
    }, 0);
  }, [cart]);

  const selectedDiscount = useMemo(() => {
    return activeDiscounts.find((d) => d.id === selectedDiscountId);
  }, [selectedDiscountId, activeDiscounts]);

  const discountAmount = useMemo(() => {
    if (!selectedDiscount) return 0;
    if (selectedDiscount.type === "percent") {
      return (subtotal * selectedDiscount.value) / 100;
    } else {
      return Math.min(selectedDiscount.value, subtotal);
    }
  }, [subtotal, selectedDiscount]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const changeGiven = useMemo(() => {
    const paid = parseFloat(amountPaid.replace(/\D/g, ""));
    if (isNaN(paid) || paid < total) return 0;
    return paid - total;
  }, [amountPaid, total]);

  // ── Checkout Mutation Trigger ──
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError("Keranjang pesanan kosong");
      return;
    }

    // Only validate payment if not a "for later" order
    let paidVal = 0;
    if (!isForLater) {
      paidVal = parseFloat(amountPaid.replace(/\D/g, ""));
      if (isNaN(paidVal) || paidVal < total) {
        setError("Uang yang dibayarkan kurang");
        return;
      }
    }

    setIsSubmitting(true);
    setError("");

    try {
      const orderPayload = {
        discountId: selectedDiscountId || undefined,
        orderType,
        subtotal,
        discountAmount,
        tax: 0,
        total,
        paymentMethod,
        amountPaid: isForLater ? undefined : paidVal,
        changeGiven: isForLater ? undefined : changeGiven,
        isForLater,
      };

      const itemsPayload = cart.map((entry) => ({
        menuItemId: entry.item.id,
        quantity: entry.quantity,
        unitPrice: entry.item.price,
        notes: entry.customNotes,
        selectedModifiers: entry.selectedModifiers,
      }));

      await addCompleteOrder(orderPayload, itemsPayload);
      setSuccess(true);
      setCart([]);
      setAmountPaid("");
      setSelectedDiscountId("");

      setTimeout(() => {
        router.push("/pesanan");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Gagal memproses transaksi kasir");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickCash = (amt: number) => {
    setAmountPaid(amt.toLocaleString("id-ID"));
    setError("");
  };

  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <div className="relative flex flex-col md:flex-row min-h-dvh md:h-screen md:overflow-hidden bg-surface-container-low font-sans">
      {/* ── LEFT PANEL: MENU & SELECTION ── */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto pb-28 md:pb-6 md:pr-[27rem] transition-all">
        <div className="flex flex-col gap-4 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kasir POS</h1>
              <p className="text-gray-500 text-sm hidden md:block">
                Pilih menu, konfigurasi modifier
              </p>
            </div>
            <button
              onClick={() => router.push("/pesanan")}
              className="px-4 py-2 border border-gray-200 hover:bg-white text-gray-600 font-semibold text-xs rounded-xl cursor-pointer"
            >
              Kembali ke Orderan
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                className="w-4.5 h-4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari masakan atau minuman..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              id="cat-tab-all"
              onClick={() => setSelectedCategoryId("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategoryId === "all"
                  ? "bg-orange-500 text-white shadow-md shadow-orange-100"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"
              }`}
            >
              Semua Menu
            </button>
            {categoriesLoading
              ? [1, 2].map((i) => (
                  <Skeleton key={i} className="h-8 w-20 rounded-full" />
                ))
              : categories.map((cat) => (
                  <button
                    key={cat.id}
                    id={`cat-tab-${cat.id}`}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                      selectedCategoryId === cat.id
                        ? "bg-orange-500 text-white shadow-md shadow-orange-100"
                        : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
          </div>
        </div>

        {/* Menu Grid */}
        {menuLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2 animate-pulse h-36"
              />
            ))}
          </div>
        ) : filteredMenuItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <p className="font-semibold text-gray-800">Menu tidak ditemukan</p>
            <p className="text-sm mt-1">
              Coba gunakan kata kunci pencarian yang lain.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenuItems.map((item) => {
              const hasMods = modifiers.some(
                (mod) => mod.menuItemId === item.id,
              );

              return (
                <button
                  key={item.id}
                  id={`menu-item-button-${item.id}`}
                  onClick={() => handleItemClick(item)}
                  className="bg-white rounded-2xl p-4 text-left border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between h-36"
                >
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">
                      {item.name}
                    </h3>
                    {item.note && (
                      <p className="text-gray-400 text-xxs mt-0.5 line-clamp-1">
                        {item.note}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3 w-full">
                    <span className="text-orange-500 font-bold text-sm">
                      {formatRupiah(item.price)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MOBILE: Floating Cart Button ── */}
      {totalItems > 0 && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-bold rounded-xl px-5 py-4 flex items-center justify-between shadow-active cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg px-2.5 py-1 text-sm font-bold">
                {totalItems}
              </div>
              <span className="text-sm font-bold uppercase tracking-wide">
                Detail Pesanan
              </span>
            </div>
            <span className="text-sm font-bold">{formatRupiah(total)}</span>
          </button>
        </div>
      )}

      {/* ── MOBILE: Cart Bottom Sheet ── */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${cartOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setCartOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${cartOpen ? "opacity-100" : "opacity-0"}`}
        />
        {/* Sheet */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-surface-container-lowest rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-out`}
          style={{
            transform: cartOpen ? "translateY(0)" : "translateY(100%)",
            maxHeight: "90dvh",
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-12 h-1 bg-surface-container-highest rounded-full" />
          </div>
          {/* Sheet header */}
          <div className="px-5 py-3 flex items-center justify-between border-b border-surface-container-high flex-shrink-0">
            <h2 className="font-bold text-on-surface text-base uppercase tracking-wide">
              Detail Pesanan
            </h2>
            <button
              onClick={() => setCartOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container text-secondary cursor-pointer transition-colors"
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
          {/* Sheet body — scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Dine-in vs Takeaway */}
            <div className="flex gap-2 p-1 bg-surface-container rounded-lg">
              <button
                onClick={() => setOrderType("dine_in")}
                className={`flex-1 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  orderType === "dine_in"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-secondary hover:text-primary"
                }`}
              >
                🍽️ Dine In
              </button>
              <button
                onClick={() => setOrderType("takeaway")}
                className={`flex-1 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  orderType === "takeaway"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-secondary hover:text-primary"
                }`}
              >
                🥡 Bungkus
              </button>
            </div>
            {/* Cart list */}
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-secondary">
                <p className="text-xs font-medium">Keranjang masih kosong</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {cart.map((entry) => {
                  const totalItemPrice =
                    entry.item.price +
                    entry.selectedModifiers.reduce(
                      (s, m) => s + m.priceDelta,
                      0,
                    );
                  return (
                    <div
                      key={entry.cartId}
                      className="flex gap-3 justify-between items-start border-b border-surface-container-high pb-3.5"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-on-surface text-sm truncate">
                          {entry.item.name}
                        </p>
                        {entry.selectedModifiers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.selectedModifiers.map((mod) => (
                              <span
                                key={mod.id}
                                className="bg-surface-container-high text-secondary text-xxs font-medium px-2 py-0.5 rounded border border-outline-variant"
                              >
                                +{mod.name}
                              </span>
                            ))}
                          </div>
                        )}
                        {entry.customNotes && (
                          <p className="text-secondary text-xxs italic mt-0.5">
                            Catatan: {entry.customNotes}
                          </p>
                        )}
                        <p className="text-xs font-bold text-primary mt-1">
                          {formatRupiah(totalItemPrice * entry.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(entry.cartId, -1)}
                          className="w-8 h-8 border border-outline bg-surface-container-lowest text-secondary rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-surface-container transition-colors"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-on-surface">
                          {entry.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(entry.cartId, 1)}
                          className="w-8 h-8 border border-outline bg-surface-container-lowest text-secondary rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-surface-container transition-colors"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeCartItem(entry.cartId)}
                          className="text-secondary hover:text-error p-1 cursor-pointer transition-colors"
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
                    </div>
                  );
                })}
              </div>
            )}
            {/* Discount */}
            <div>
              <label className="block text-xxs font-bold text-secondary uppercase tracking-wider mb-1.5">
                Kupon Diskon
              </label>
              <select
                value={selectedDiscountId}
                onChange={(e) => {
                  setSelectedDiscountId(e.target.value);
                  setError("");
                }}
                className="w-full px-3 py-2.5 border border-outline rounded-lg text-xs font-medium text-on-surface focus:outline-none focus:border-primary bg-surface-container-lowest cursor-pointer transition-all"
              >
                <option value="">-- Pilih Kupon Diskon --</option>
                {activeDiscounts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} (
                    {d.type === "percent"
                      ? `${d.value}%`
                      : `-${formatRupiah(d.value)}`}
                    )
                  </option>
                ))}
              </select>
            </div>
            {/* Price breakdown */}
            <div className="space-y-2 border-b border-surface-container-high pb-3 text-xs text-secondary">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-on-surface">
                  {formatRupiah(subtotal)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-error font-semibold">
                  <span>Diskon</span>
                  <span>-{formatRupiah(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-bold text-on-surface pt-1.5">
                <span>Total Akhir</span>
                <span className="text-primary text-base font-bold">
                  {formatRupiah(total)}
                </span>
              </div>
            </div>
            {/* Order For Later Toggle - Mobile */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-surface-container-high bg-surface-container-low">
              <div>
                <p className="text-xs font-bold text-on-surface">⏳ Pesanan untuk nanti?</p>
                <p className="text-xxs text-secondary mt-0.5">Tandai sebagai <span className="font-semibold text-amber-600">Diproses</span>, bayar belakangan</p>
              </div>
              <button
                type="button"
                onClick={() => setIsForLater((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                  isForLater ? "bg-amber-500" : "bg-surface-container-highest"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    isForLater ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            {/* Payment method */}
            {!isForLater && (
              <div>
                <label className="block text-xxs font-bold text-secondary uppercase tracking-wider mb-1.5">
                  Metode Pembayaran
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("cash");
                      setAmountPaid("");
                      setError("");
                    }}
                    className={`flex-1 py-2.5 border rounded-lg text-xs font-bold transition-all cursor-pointer ${paymentMethod === "cash" ? "border-primary bg-primary/5 text-primary" : "border-outline-variant text-secondary"}`}
                  >
                    💵 Tunai
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("qris");
                      setAmountPaid("");
                      setError("");
                    }}
                    className={`flex-1 py-2.5 border rounded-lg text-xs font-bold transition-all cursor-pointer ${paymentMethod === "qris" ? "border-primary bg-primary/5 text-primary" : "border-outline-variant text-secondary"}`}
                  >
                    📱 QRIS
                  </button>
                </div>
              </div>
            )}
            {/* Quick cash + amount input */}
            {!isForLater && (
              <div className="space-y-2 bg-surface-container-low p-3 rounded-lg border border-surface-container-high">
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  <button
                    type="button"
                    onClick={() => handleQuickCash(total)}
                    className="bg-surface-container-lowest px-2.5 py-1 border border-outline rounded text-xxs font-bold text-secondary hover:bg-surface-container cursor-pointer whitespace-nowrap transition-colors"
                  >
                    Uang Pas
                  </button>
                  {[20000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickCash(amt)}
                      className="bg-surface-container-lowest px-2.5 py-1 border border-outline rounded text-xxs font-bold text-secondary hover:bg-surface-container cursor-pointer whitespace-nowrap transition-colors"
                    >
                      {amt.toLocaleString("id-ID")}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-secondary font-bold">
                    Bayar Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amountPaid}
                    onChange={(e) => {
                      setAmountPaid(formatPriceInput(e.target.value));
                      setError("");
                    }}
                    placeholder="Masukkan nominal"
                    className="w-full pl-18 pr-4 py-2.5 border border-outline rounded-lg text-xs font-bold text-on-surface placeholder-secondary focus:outline-none focus:border-primary bg-surface-container-lowest transition-all"
                  />
                </div>
                {changeGiven > 0 && (
                  <div className="flex justify-between text-tertiary font-bold text-xs pt-1 border-t border-dashed border-outline">
                    <span>Kembalian</span>
                    <span>{formatRupiah(changeGiven)}</span>
                  </div>
                )}
              </div>
            )}
            {error && (
              <p className="text-error text-xs font-semibold text-center">
                {error}
              </p>
            )}
            {/* Checkout button */}
            <button
              onClick={() => {
                handleCheckout();
              }}
              disabled={isSubmitting || success || cart.length === 0}
              className={`w-full py-4 rounded-lg text-white font-bold text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mb-2 ${
                success
                  ? "bg-tertiary shadow-lg"
                  : isForLater
                  ? "bg-amber-500 hover:bg-amber-600 disabled:bg-surface-container-highest disabled:text-secondary shadow-active"
                  : "bg-primary hover:bg-primary-dark disabled:bg-surface-container-highest disabled:text-secondary shadow-active"
              }`}
            >
              {isSubmitting
                ? "Memproses..."
                : success
                ? "✓ Pesanan Tersimpan!"
                : isForLater
                ? "⏳ Simpan (Diproses)"
                : "Bayar & Selesaikan"}
            </button>
            <div className="h-2" />
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: DESKTOP ONLY ── */}
      <div className="hidden md:flex absolute top-4 right-4 bottom-4 w-[25rem] bg-surface-container-lowest p-5 border border-surface-container-high flex-col justify-between shadow-ambient rounded-2xl z-30 transition-all">
        {/* Upper Summary Section */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-surface-container-high pb-3 mb-4">
            <h2 className="font-bold text-on-surface text-base uppercase tracking-wide">
              Detail Pesanan
            </h2>
            <span className="bg-surface-container text-secondary text-xs font-bold px-2.5 py-1 rounded-lg">
              {cart.reduce((s, c) => s + c.quantity, 0)} Items
            </span>
          </div>

          {/* Dine-in vs Takeaway select */}
          <div className="flex gap-2 mb-4 p-1 bg-surface-container rounded-lg">
            <button
              onClick={() => setOrderType("dine_in")}
              className={`flex-1 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                orderType === "dine_in"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-secondary hover:text-primary"
              }`}
            >
              🍽️ Dine In
            </button>
            <button
              onClick={() => setOrderType("takeaway")}
              className={`flex-1 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                orderType === "takeaway"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-secondary hover:text-primary"
              }`}
            >
              🥡 Bungkus
            </button>
          </div>

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-secondary">
              <svg
                className="w-12 h-12 mb-2 opacity-30"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M8 12h8" />
              </svg>
              <p className="text-xs font-medium">Keranjang masih kosong</p>
            </div>
          ) : (
            <div className="space-y-3.5 mb-4 flex-1 overflow-y-auto pr-1">
              {cart.map((entry) => {
                const totalItemPrice =
                  entry.item.price +
                  entry.selectedModifiers.reduce((s, m) => s + m.priceDelta, 0);

                return (
                  <div
                    key={entry.cartId}
                    className="flex gap-3 justify-between items-start border-b border-surface-container-high pb-3.5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-on-surface text-sm truncate">
                        {entry.item.name}
                      </p>

                      {/* Active Modifiers listing */}
                      {entry.selectedModifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entry.selectedModifiers.map((mod) => (
                            <span
                              key={mod.id}
                              className="bg-surface-container text-secondary text-xxs font-medium px-2 py-0.5 rounded border border-outline-variant"
                            >
                              +{mod.name} (
                              {mod.priceDelta > 0
                                ? `+Rp ${mod.priceDelta.toLocaleString("id-ID")}`
                                : "Free"}
                              )
                            </span>
                          ))}
                        </div>
                      )}

                      {entry.customNotes && (
                        <p className="text-secondary text-xxs italic mt-0.5">
                          Catatan: {entry.customNotes}
                        </p>
                      )}
                      <p className="text-xs font-bold text-primary mt-1">
                        {formatRupiah(totalItemPrice * entry.quantity)}
                      </p>
                    </div>

                    {/* Quantity & Delete controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(entry.cartId, -1)}
                        className="w-8 h-8 border border-outline bg-surface-container-lowest text-secondary rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-surface-container transition-all"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-4 text-center text-on-surface">
                        {entry.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(entry.cartId, 1)}
                        className="w-8 h-8 border border-outline bg-surface-container-lowest text-secondary rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-surface-container transition-all"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeCartItem(entry.cartId)}
                        className="text-secondary hover:text-error p-1 cursor-pointer transition-colors"
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
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lower Checkout/Calculation Section */}
        <div className="border-t border-surface-container-high pt-4 bg-surface-container-lowest mt-auto space-y-3.5">
          {/* Discounts Selector */}
          <div>
            <label className="block text-xxs font-bold text-secondary uppercase tracking-wider mb-1.5">
              Kupon Diskon
            </label>
            {discountsLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <select
                value={selectedDiscountId}
                onChange={(e) => {
                  setSelectedDiscountId(e.target.value);
                  setError("");
                }}
                className="w-full px-3 py-2 border border-outline rounded-lg text-xs font-medium text-on-surface focus:outline-none focus:border-primary bg-surface-container-lowest cursor-pointer transition-all"
              >
                <option value="">-- Pilih Kupon Diskon --</option>
                {activeDiscounts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} (
                    {d.type === "percent"
                      ? `${d.value}%`
                      : `-${formatRupiah(d.value)}`}
                    )
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Pricing break downs */}
          <div className="space-y-2 border-b border-surface-container-high pb-3 text-xs text-secondary">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-on-surface">
                {formatRupiah(subtotal)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-error font-semibold">
                <span>Diskon Promo</span>
                <span>-{formatRupiah(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-bold text-on-surface pt-1.5">
              <span>Total Akhir</span>
              <span className="text-primary text-base font-bold">
                {formatRupiah(total)}
              </span>
            </div>
          </div>

          {/* Order For Later Toggle - Desktop */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-surface-container-high bg-surface-container-low">
            <div>
              <p className="text-xs font-bold text-on-surface">⏳ Pesanan untuk nanti?</p>
              <p className="text-xxs text-secondary mt-0.5">Tandai sebagai <span className="font-semibold text-amber-600">Diproses</span>, bayar belakangan</p>
            </div>
            <button
              type="button"
              onClick={() => setIsForLater((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                isForLater ? "bg-amber-500" : "bg-surface-container-highest"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  isForLater ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Payment selector */}
          {!isForLater && (
            <div>
              <label className="block text-xxs font-bold text-secondary uppercase tracking-wider mb-1.5">
                Metode Pembayaran
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("cash");
                    setAmountPaid("");
                    setError("");
                  }}
                  className={`flex-1 py-2 border rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === "cash"
                      ? "border-primary bg-primary/5 text-primary border-2"
                      : "border-outline-variant text-secondary hover:bg-surface-container-low"
                  }`}
                >
                  💵 Tunai (Cash)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("qris");
                    setAmountPaid("");
                    setError("");
                  }}
                  className={`flex-1 py-2 border rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === "qris"
                      ? "border-primary bg-primary/5 text-primary border-2"
                      : "border-outline-variant text-secondary hover:bg-surface-container-low"
                  }`}
                >
                  📱 QRIS
                </button>
              </div>
            </div>
          )}

          {/* Payment inputs */}
          {!isForLater && (
            <div className="space-y-2 bg-surface-container-low p-3 rounded-lg border border-surface-container-high">
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  type="button"
                  onClick={() => handleQuickCash(total)}
                  className="bg-surface-container-lowest px-2.5 py-1 border border-outline rounded text-xxs font-bold text-secondary hover:bg-surface-container cursor-pointer whitespace-nowrap transition-colors"
                >
                  Uang Pas
                </button>
                {[20000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickCash(amt)}
                    className="bg-surface-container-lowest px-2.5 py-1 border border-outline rounded text-xxs font-bold text-secondary hover:bg-surface-container cursor-pointer whitespace-nowrap transition-colors"
                  >
                    {amt.toLocaleString("id-ID")}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-secondary font-bold">
                  Bayar Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amountPaid}
                  onChange={(e) => {
                    setAmountPaid(formatPriceInput(e.target.value));
                    setError("");
                  }}
                  placeholder="Masukkan nominal"
                  className="w-full pl-18 pr-4 py-2 border border-outline rounded-lg text-xs font-bold text-on-surface placeholder-secondary focus:outline-none focus:border-primary bg-surface-container-lowest transition-all"
                />
              </div>

              {changeGiven > 0 && (
                <div className="flex justify-between text-tertiary font-bold text-xs pt-1 border-t border-dashed border-outline">
                  <span>Kembalian Kasir</span>
                  <span>{formatRupiah(changeGiven)}</span>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-error text-xs font-semibold text-center">
              {error}
            </p>
          )}

          {/* Checkout Submit */}
          <button
            onClick={handleCheckout}
            disabled={isSubmitting || success || cart.length === 0}
            className={`w-full py-3.5 rounded-lg text-white font-bold text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
              success
                ? "bg-tertiary shadow-lg"
                : isForLater
                ? "bg-amber-500 hover:bg-amber-600 disabled:bg-surface-container-highest disabled:text-secondary"
                : "bg-primary hover:bg-primary-dark disabled:bg-surface-container-highest disabled:text-secondary"
            }`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
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
                Memproses Order...
              </>
            ) : success ? (
              "✓ Pesanan Tersimpan!"
            ) : isForLater ? (
              "⏳ Simpan (Diproses)"
            ) : (
              "Bayar & Cetak Pesanan"
            )}
          </button>
        </div>
      </div>

      {/* ── MODIFIERS SELECTION MODAL ── */}
      {activeItemForModifiers && (
        <div className="fixed inset-0 z-[60] overflow-hidden flex items-end md:items-center justify-center md:p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setActiveItemForModifiers(null)}
          />

          {/* Dialog — bottom sheet on mobile, centered card on md+ */}
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
                    {activeItemForModifiers.name}
                  </p>
                </div>
                <button
                  onClick={() => setActiveItemForModifiers(null)}
                  className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-secondary hover:text-on-surface cursor-pointer transition-colors"
                >
                  <svg
                    className="w-5 h-5"
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

              {/* Modifiers List checkboxes */}
              <div
                className="space-y-2 overflow-y-auto pr-1"
                style={{ maxHeight: "40dvh" }}
              >
                {currentItemModifiers.length === 0 ? (
                  <p className="text-secondary text-xs text-center py-4">
                    Tidak ada opsi tambahan untuk menu ini.
                  </p>
                ) : (
                  currentItemModifiers.map((mod) => {
                    const isChecked = tempSelectedModifiers.some(
                      (m) => m.id === mod.id,
                    );

                    return (
                      <button
                        type="button"
                        key={mod.id}
                        onClick={() => {
                          if (isChecked) {
                            setTempSelectedModifiers((prev) =>
                              prev.filter((m) => m.id !== mod.id),
                            );
                          } else {
                            setTempSelectedModifiers((prev) => [...prev, mod]);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg text-left cursor-pointer transition-all ${
                          isChecked
                            ? "border-primary bg-primary/5 text-primary font-semibold"
                            : "border-outline-variant text-secondary hover:bg-surface-container-low"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isChecked
                                ? "bg-primary border-primary"
                                : "border-outline bg-surface-container-lowest"
                            }`}
                          >
                            {isChecked && (
                              <svg
                                className="w-2.5 h-2.5 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={3}
                                viewBox="0 0 24 24"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <span className="text-xs">{mod.name}</span>
                        </div>
                        {mod.priceDelta > 0 && (
                          <span className="text-xs font-bold">
                            +{formatRupiah(mod.priceDelta)}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Custom Notes */}
              <div className="mt-4">
                <label
                  htmlFor="modal-notes"
                  className="block text-xxs font-bold text-secondary uppercase tracking-wider mb-1.5"
                >
                  Catatan Tambahan
                </label>
                <input
                  id="modal-notes"
                  type="text"
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  placeholder="Contoh: Sambal dipisah, less sugar..."
                  className="w-full px-3 py-2 border border-outline rounded-lg text-xs text-on-surface placeholder-secondary focus:outline-none focus:border-primary bg-surface-container-low/30 transition-all"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-surface-container-high pt-4 mt-5">
              <button
                type="button"
                onClick={() => setActiveItemForModifiers(null)}
                className="flex-1 py-2.5 border border-outline rounded-lg text-secondary font-bold text-xs hover:bg-surface-container active:scale-[0.98] cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmModifiers}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-on-primary font-bold text-xs rounded-lg shadow-active active:scale-[0.98] cursor-pointer transition-all"
              >
                Tambah ke Orderan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Zoom scale animations ── */}
      <style jsx global>{`
        @keyframes scaleUp {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-up {
          animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
