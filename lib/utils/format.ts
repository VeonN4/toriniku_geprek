export function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

export function formatRupiahShort(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return formatRupiah(n);
}

export function formatRupiahDelta(n: number): string {
  if (n === 0) return "Gratis";
  return (n > 0 ? "+" : "") + formatRupiah(Math.abs(n));
}

export function formatPriceInput(val: string): string {
  const digits = val.replace(/\D/g, "");
  return digits ? parseInt(digits).toLocaleString("id-ID") : "";
}

export function parsePrice(val: string): number {
  return parseInt(val.replace(/\D/g, "") || "0", 10);
}
