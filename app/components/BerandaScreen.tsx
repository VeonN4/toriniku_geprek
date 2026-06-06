"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePOS } from "../context/POSContext";
import { BerandaHeader } from "./BerandaHeader";
import { BusinessSummaryCards } from "./BusinessSummaryCards";
import { RecentOrdersSection } from "./RecentOrdersSection";

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function BerandaScreen() {
  const { orders, menuItems, ordersLoading, menuLoading, session } = usePOS();
  const router = useRouter();
  const userEmail = session?.user?.email ?? "Juragan";

  const activeOrders = orders.filter(
    (o) => o.status === "Baru" || o.status === "Diproses",
  );
  const needsProcessing = orders.filter((o) => o.status === "Baru");

  const todayCompleted = useMemo(
    () => orders.filter((o) => o.status === "Selesai" && isToday(o.createdAt)),
    [orders],
  );
  const todayRevenue = todayCompleted.reduce((sum, o) => sum + o.total, 0);
  const todayOrderCount = todayCompleted.length;

  const activeMenuCount = menuItems.filter((m) => m.status === "Ready").length;

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getFullYear()).slice(2)}`;

  return (
    <div className="flex flex-col min-h-full">
      <BerandaHeader
        userEmail={userEmail}
        dateStr={dateStr}
        todayRevenue={todayRevenue}
        isLoading={ordersLoading}
      />

      <div className="flex-1 px-5 md:px-8 pt-6 pb-24 md:pb-8 bg-background">
        <h2 className="text-base font-bold text-on-surface mb-3">
          Ringkasan Bisnis
        </h2>

        <BusinessSummaryCards
          activeOrderCount={activeOrders.length}
          needsProcessingCount={needsProcessing.length}
          activeMenuCount={activeMenuCount}
          todayOrderCount={todayOrderCount}
          ordersLoading={ordersLoading}
          menuLoading={menuLoading}
          onNewOrder={() => router.push("/pesanan/baru")}
          onViewMenu={() => router.push("/menu")}
          onViewOrders={() => router.push("/pesanan")}
        />

        <RecentOrdersSection
          orders={recentOrders}
          isLoading={ordersLoading}
          onViewAll={() => router.push("/pesanan")}
          onViewOrder={() => router.push("/pesanan")}
        />
      </div>

      <button
        type="button"
        id="fab-pesanan-baru"
        aria-label="Pesanan baru"
        onClick={() => router.push("/pesanan/baru")}
        className="md:hidden fixed bottom-20 right-5 z-40 w-14 h-14 bg-primary text-on-primary rounded-full shadow-active flex items-center justify-center hover:bg-primary-dark active:scale-95 cursor-pointer transition-all"
      >
        <svg
          className="w-7 h-7 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 5v14m-7-7h14"
          />
        </svg>
      </button>
    </div>
  );
}
