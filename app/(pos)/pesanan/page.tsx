import type { Metadata } from "next";
import PesananScreen from "../../components/PesananScreen";

export const metadata: Metadata = {
  title: "Pesanan",
};

export default function PesananPage() {
  return <PesananScreen />;
}
