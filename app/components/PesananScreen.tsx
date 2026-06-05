"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePOS, Order, OrderStatus } from "../context/POSContext";

const STATUS_COLORS: Record<OrderStatus, string> = {
  Baru: "bg-surface-container text-on-surface-variant font-semibold",
  Diproses: "bg-secondary-container text-on-secondary-container font-semibold",
  Selesai: "bg-tertiary-container/30 text-on-tertiary-container font-semibold",
  Dibatalkan: "bg-error-container text-on-error-container font-semibold",
};

function OrderCard({ order }: { order: Order }) {
  const { updateOrderStatus } = usePOS();
  const [showMenu, setShowMenu] = useState(false);
  const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");
  const statusOptions: OrderStatus[] = [
    "Baru",
    "Diproses",
    "Selesai",
    "Dibatalkan",
  ];

  return (
    <div
      id={`order-card-${order.id}`}
      className="bg-surface-container-lowest rounded-2xl p-4 shadow-ambient hover:shadow-md relative transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-bold text-on-surface text-base">
            #{order.orderNumber}
          </span>
          <p className="text-xs text-outline mt-0.5">{order.customerName}</p>
        </div>
        <button
          id={`btn-status-${order.id}`}
          onClick={() => setShowMenu((v) => !v)}
          className={`text-xs font-semibold px-3 py-1 rounded-full cursor-pointer flex-shrink-0 transition-colors ${STATUS_COLORS[order.status]}`}
        >
          {order.status}
        </button>
      </div>

      {showMenu && (
        <div
          className="absolute right-4 top-12 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant z-50 py-1 min-w-36 transition-all"
          onMouseLeave={() => setShowMenu(false)}
        >
          {statusOptions.map((s) => (
            <button
              key={s}
              id={`status-option-${order.id}-${s}`}
              onClick={() => {
                updateOrderStatus(order.id, s);
                setShowMenu(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-surface-container cursor-pointer transition-colors ${order.status === s ? "text-primary" : "text-on-surface-variant"}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-on-surface-variant mb-3">{order.items}</p>
      {order.notes && (
        <p className="text-xs text-outline italic mb-2">{order.notes}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-outline">Jam: {order.time}</span>
        <span className="text-sm font-bold text-primary">
          {formatRupiah(order.total)}
        </span>
      </div>
    </div>
  );
}

type GroupBy = "none" | "type" | "status" | "date";

interface GroupedOrders {
  title: string;
  badgeColor: string;
  icon?: React.ReactNode;
  orders: Order[];
}

export default function PesananScreen() {
  const { orders, ordersLoading } = usePOS();
  const router = useRouter();
  const [filter, setFilter] = useState<"semua" | OrderStatus>("semua");
  const [groupBy, setGroupBy] = useState<GroupBy>("date");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filtered =
    filter === "semua" ? orders : orders.filter((o) => o.status === filter);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, groupBy]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const filters = [
    { id: "semua", label: "Semua" },
    { id: "Diproses", label: "Diproses" },
    { id: "Selesai", label: "Selesai" },
  ];

  const groupOptions = [
    { id: "none", label: "Polos" },
    { id: "type", label: " Tipe" },
    { id: "status", label: "Status" },
    { id: "date", label: "Tanggal" },
  ];

  const getGroupedOrders = (ordersList: Order[]): GroupedOrders[] => {
    if (groupBy === "none") return [];

    if (groupBy === "type") {
      const dineIn = ordersList.filter((o) => o.customerName === "Dine In");
      const takeaway = ordersList.filter((o) => o.customerName === "Takeaway");

      return [
        {
          title: "Dine In",
          badgeColor:
            "bg-secondary-container text-on-secondary-container border border-outline-variant",
          icon: (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3"
              />
            </svg>
          ),
          orders: dineIn,
        },
        {
          title: "Takeaway",
          badgeColor:
            "bg-primary-container text-on-primary-container border border-primary/20",
          icon: (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          ),
          orders: takeaway,
        },
      ].filter((g) => g.orders.length > 0);
    }

    if (groupBy === "status") {
      const statuses: OrderStatus[] = [
        "Baru",
        "Diproses",
        "Selesai",
        "Dibatalkan",
      ];
      return statuses
        .map((s) => {
          const iconMap: Record<OrderStatus, React.ReactNode> = {
            Baru: (
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 6v6h6" />
              </svg>
            ),
            Diproses: (
              <svg
                className="w-3.5 h-3.5 animate-spin"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            ),
            Selesai: (
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            ),
            Dibatalkan: (
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            ),
          };

          return {
            title: s,
            badgeColor: STATUS_COLORS[s],
            icon: iconMap[s],
            orders: ordersList.filter((o) => o.status === s),
          };
        })
        .filter((g) => g.orders.length > 0);
    }

    if (groupBy === "date") {
      const todayList: Order[] = [];
      const yesterdayList: Order[] = [];
      const earlierList: Order[] = [];

      const isToday = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      };

      const isYesterday = (dateStr: string) => {
        const d = new Date(dateStr);
        const yest = new Date();
        yest.setDate(yest.getDate() - 1);
        return (
          d.getDate() === yest.getDate() &&
          d.getMonth() === yest.getMonth() &&
          d.getFullYear() === yest.getFullYear()
        );
      };

      ordersList.forEach((o) => {
        if (isToday(o.createdAt)) todayList.push(o);
        else if (isYesterday(o.createdAt)) yesterdayList.push(o);
        else earlierList.push(o);
      });

      return [
        {
          title: "Hari Ini",
          badgeColor: "bg-primary/10 text-primary border border-primary/20",
          icon: (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4l3 3" />
            </svg>
          ),
          orders: todayList,
        },
        {
          title: "Kemarin",
          badgeColor:
            "bg-secondary-container text-on-secondary-container border border-outline-variant",
          icon: (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
              />
            </svg>
          ),
          orders: yesterdayList,
        },
        {
          title: "Sebelumnya",
          badgeColor:
            "bg-surface-container text-on-surface-variant border border-outline-variant",
          icon: (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
          ),
          orders: earlierList,
        },
      ].filter((g) => g.orders.length > 0);
    }

    return [];
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-primary px-5 md:px-8 pt-8 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary-container rounded-full opacity-40" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">Pesanan</h1>
            <p className="text-on-primary/80 text-sm mt-0.5">
              Pantau semua orderan masuk di sini
            </p>
          </div>
          <button
            id="btn-new-order-header"
            onClick={() => router.push("/pesanan/baru")}
            className="hidden md:flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-sm px-4 py-2.5 rounded-xl backdrop-blur-sm active:scale-95 transition-all cursor-pointer shadow-ambient"
          >
            <svg
              className="w-4 h-4"
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
            Pesanan Baru
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-surface-container-lowest px-4 md:px-8 py-2.5 flex gap-2 overflow-x-auto border-b border-outline-variant flex-shrink-0">
        {filters.map((f) => (
          <button
            key={f.id}
            id={`filter-${f.id}`}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 cursor-pointer transition-all ${
              filter === f.id
                ? "bg-primary text-on-primary shadow-active"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grouping controller */}
      <div className="bg-surface-container-lowest px-4 md:px-8 py-2 flex items-center gap-3 border-b border-outline-variant flex-wrap flex-shrink-0 transition-all">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          Kelompokkan:
        </span>
        <div className="flex bg-surface-container p-0.5 rounded-xl gap-1">
          {groupOptions.map((opt) => (
            <button
              key={opt.id}
              id={`group-opt-${opt.id}`}
              type="button"
              onClick={() => setGroupBy(opt.id as GroupBy)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                groupBy === opt.id
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders grid */}
      <div className="flex-1 px-4 md:px-8 py-4 pb-24 md:pb-8 bg-background">
        {ordersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface-container-lowest rounded-2xl p-4 shadow-ambient space-y-2 animate-pulse"
              >
                <div className="flex justify-between">
                  <div className="h-4 bg-surface-container rounded w-24" />
                  <div className="h-5 bg-surface-container rounded-full w-20" />
                </div>
                <div className="h-3 bg-surface-container rounded w-3/4" />
                <div className="flex justify-between pt-1">
                  <div className="h-3 bg-surface-container rounded w-16" />
                  <div className="h-3 bg-surface-container rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-outline">
            <svg
              className="w-16 h-16 mb-3 opacity-30"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
              />
              <line x1="3" x2="21" y1="6" y2="6" />
            </svg>
            <p className="text-sm font-medium">Tidak ada pesanan</p>
          </div>
        ) : groupBy === "none" ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
              {paginatedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 flex-wrap animate-fade-in">
                <button
                  id="btn-prev-page"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-primary hover:bg-primary/10 hover:border-primary/40 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant disabled:hover:border-outline-variant disabled:cursor-not-allowed transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5 8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      id={`btn-page-${pageNum}`}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold cursor-pointer transition-all ${
                        currentPage === pageNum
                          ? "bg-primary text-on-primary shadow-active"
                          : "bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  id="btn-next-page"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-primary hover:bg-primary/10 hover:border-primary/40 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant disabled:hover:border-outline-variant disabled:cursor-not-allowed transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="space-y-6 animate-fade-in">
              {getGroupedOrders(paginatedOrders).map((group) => (
                <div key={group.title} className="space-y-3">
                  {/* Group section header */}
                  <div className="flex items-center gap-2 pb-1 border-b border-outline-variant/60">
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${group.badgeColor}`}
                    >
                      {group.icon}
                      <span>{group.title}</span>
                    </div>
                    <span className="text-xs font-bold text-outline">
                      ({group.orders.length} Pesanan)
                    </span>
                    <div className="flex-1 h-px bg-outline-variant/40 ml-2" />
                  </div>
                  {/* Group cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.orders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 flex-wrap animate-fade-in">
                <button
                  id="btn-prev-page"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-primary hover:bg-primary/10 hover:border-primary/40 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant disabled:hover:border-outline-variant disabled:cursor-not-allowed transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5 8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      id={`btn-page-${pageNum}`}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold cursor-pointer transition-all ${
                        currentPage === pageNum
                          ? "bg-primary text-on-primary shadow-active"
                          : "bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  id="btn-next-page"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-primary hover:bg-primary/10 hover:border-primary/40 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant disabled:hover:border-outline-variant disabled:cursor-not-allowed transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB — mobile only */}
      <button
        id="fab-new-order"
        onClick={() => router.push("/pesanan/baru")}
        className="md:hidden fixed bottom-20 right-5 z-40 w-14 h-14 bg-primary text-on-primary rounded-full shadow-active flex items-center justify-center hover:bg-primary-dark active:scale-95 transition-all cursor-pointer"
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
