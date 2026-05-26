"use client";

import { POSProvider, usePOS } from "./context/POSContext";
import { Sidebar, BottomNav } from "./components/Nav";
import BerandaScreen from "./components/BerandaScreen";
import PesananScreen from "./components/PesananScreen";
import MenuScreen from "./components/MenuScreen";
import TambahMenuScreen from "./components/TambahMenuScreen";
import PesananBaruScreen from "./components/PesananBaruScreen";

function POSApp() {
  const { activeScreen } = usePOS();

  const renderScreen = () => {
    switch (activeScreen) {
      case "beranda":       return <BerandaScreen />;
      case "pesanan":       return <PesananScreen />;
      case "menu":          return <MenuScreen />;
      case "tambah-menu":   return <TambahMenuScreen />;
      case "pesanan-baru":  return <PesananBaruScreen />;
      default:              return <BerandaScreen />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {renderScreen()}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}

export default function Home() {
  return (
    <POSProvider>
      <POSApp />
    </POSProvider>
  );
}
