import type { Metadata } from "next";
import AnalitikClient from "./AnalitikClient";

export const metadata: Metadata = {
  title: "Analitik",
  description: "Analitik penjualan",
};

export default async function AnalitikPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/analitik?period=30d`, { cache: "no-store" });
  const initialData = await res.json();

  return <AnalitikClient initialData={initialData} />;
}
