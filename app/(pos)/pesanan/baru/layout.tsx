import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kasir POS",
  description: "Buat pesanan baru",
};

export default function PesananBaruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
