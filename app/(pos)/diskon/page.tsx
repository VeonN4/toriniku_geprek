import type { Metadata } from "next";
import DiskonsScreen from "../../components/DiskonScreen";

export const metadata: Metadata = {
  title: "Diskon",
};

export default function DiskonPage() {
  return <DiskonsScreen />;
}
