import type { Metadata } from "next";
import TambahMenuScreen from "../../../components/TambahMenuScreen";

export const metadata: Metadata = {
  title: "Tambah Menu",
};

export default function TambahMenuPage() {
  return <TambahMenuScreen />;
}
