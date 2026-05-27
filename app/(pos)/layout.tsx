"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { POSProvider } from "../context/POSContext";
import { Sidebar, BottomNav } from "../components/Nav";

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // The POS terminal is a full-screen two-panel app — render it without sidebar
  const isTerminal = pathname === "/pesanan/baru";

  return (
    <POSProvider>
      {isTerminal ? (
        <div className="h-screen overflow-hidden bg-gray-50">
          {children}
        </div>
      ) : (
        <div className="flex min-h-screen bg-gray-50 pb-16 md:pb-0">
          <Sidebar />
          <main className="flex-1 flex flex-col overflow-y-auto">
            {children}
          </main>
          <BottomNav />
        </div>
      )}
    </POSProvider>
  );
}
