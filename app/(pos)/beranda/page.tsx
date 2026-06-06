import type { Metadata } from "next";
import BerandaScreen from "../../components/BerandaScreen";

export const metadata: Metadata = {
  title: "Beranda",
};

export default function BerandaPage() {
  return <BerandaScreen />;
}
