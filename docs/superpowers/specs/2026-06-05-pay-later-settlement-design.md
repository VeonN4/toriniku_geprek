# Pay-Later Settlement — Payment Confirmation for Unpaid Orders

## Problem

Orders created with "Bayar Belakangan" (pay later) are saved with `status: "open"` and no payment data (`amount_paid: null`, `paid_at: null`). Staff can change status via the OrderCard dropdown, but marking an order as "Selesai" just flips a DB flag — there is no payment confirmation step. The system never captures how much was paid, via what method, or how much change was given.

## Solution

When a staff member clicks an unpaid order card (Baru/Diproses), a payment modal slides open showing the full order detail and a payment form. Submitting the form settles the order: writes payment data to the DB and sets status to "Selesai".

## Architecture

### New API function: `settleOrder`

**File:** `lib/api/orders.ts`

```ts
async function settleOrder(
  orderId: string,
  payment: {
    paymentMethod: "cash" | "qris";
    amountPaid: number;
    changeGiven: number;
  }
): Promise<void>
```

Updates the DB row:
- `payment_method` = payment.paymentMethod
- `amount_paid` = payment.amountPaid
- `change_given` = payment.changeGiven
- `paid_at` = `new Date().toISOString()`
- `status` = `"paid"`

### New component: `PaymentModal`

**File:** `app/components/PaymentModal.tsx`

A centered overlay modal (not a slide-in sidebar) that displays:

**Header:**
- Order number (`#TN-ABCD`)
- Order type (Dine In / Takeaway)

**Order items section (read-only):**
- Each item: `{qty}× {name} @ {unitPrice}`
- Notes shown in italic below item if present
- Subtotal line
- Discount line (if any)
- **Total** (prominent)

**Payment form:**
- Payment method toggle: Tunai (Cash) | QRIS
- If Cash: amount paid input with quick buttons (Uang Pas, 20.000, 50.000, 100.000)
- Change given display (calculated: amountPaid - total)
- If QRIS: static message "Tunjukkan kode QR ke pelanggan" + amount paid auto-set to total

**Action buttons:**
- "Konfirmasi Pembayaran" (primary) — calls `settleOrder`, closes modal, refreshes order list
- "Batal" (secondary) — closes modal without changes

### Modified component: `OrderCard`

**File:** `app/components/OrderCard.tsx`

- Wrap card body in a clickable area for unpaid orders (Baru, Diproses)
- On click: open `PaymentModal` with the order data
- Status badge dropdown still works independently (stopPropagation)
- For paid orders (Selesai, Dibatalkan): no click action

### Modified screen: `PesananScreen`

**File:** `app/components/PesananScreen.tsx`

- Import and render `PaymentModal` when triggered
- Pass the selected order to the modal
- After settlement succeeds, refresh the orders list

### Data flow

```
User clicks OrderCard (unpaid)
  → PaymentModal opens with order data
  → User selects payment method, enters amount
  → "Konfirmasi Pembayaran" clicked
  → settleOrder(orderId, paymentPayload) called
  → DB updated: status="paid", payment_method, amount_paid, change_given, paid_at
  → Modal closes
  → Parent re-fetches orders
  → OrderCard now shows "Selesai" badge
```

## Design constraints

- Follow the same design theme as the existing app (Material 3 surface colors, rounded-2xl, same shadows, same button styles)
- Quick cash buttons and payment input reuse the same `formatPriceInput` / `parsePrice` utils
- The modal should be responsive (full-screen on mobile, centered dialog on desktop)
- No new dependencies

## Files changed

| File | Change |
|------|--------|
| `lib/api/orders.ts` | Add `settleOrder()` function |
| `app/components/PaymentModal.tsx` | **New** — payment modal component |
| `app/components/OrderCard.tsx` | Make card clickable for unpaid orders |
| `app/components/PesananScreen.tsx` | Add modal state, render PaymentModal |

## Future considerations (not in scope)

- Receipt printing
- QRIS payment gateway integration
- Edit payment after settlement
- Split payment / partial payment
