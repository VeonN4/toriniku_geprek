import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Toriniku Geprek",
};

export default function RootPage() {
  redirect("/beranda");
}
