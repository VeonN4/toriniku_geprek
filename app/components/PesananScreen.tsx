"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePOS, Order, OrderStatus } from "../context/POSContext";
import { useOrderGrouping, GroupBy } from "../../lib/hooks/useOrderGrouping";
import { usePagination } from "../../lib/hooks/usePagination";
import OrderCard from "./OrderCard";
import Pagination from "./Pagination";
import PaymentModal from "./PaymentModal";
import { PlusIcon, getGroupIcon } from "./icons";

const FILTERS = [
  { id: "semua" as const, label: "Semua" },
  { id: "Diproses" as const, label: "Diproses" },
  { id: "Selesai" as const, label: "Selesai" },
];

const GROUP_OPTIONS = [
  { id: "none", label: "Polos" },
  { id: "type", label: "Tipe" },
  { id: "status", label: "Status" },
  { id: "date", label: "Tanggal" },
] as const;

function Header({ onNewOrder }: { onNewOrder: () => void }) {
  return (
    <div className="bg-primary px-5 md:px-8 pt-8 pb-6 relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary-container rounded-full opacity-40" />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Pesanan</h1>
          <p className="text-on-primary/80 text-sm mt-0.5">
            Pantau semua orderan masuk di sini
          </p>
        </div>
        <button type="button"
          id="btn-new-order-header"
          onClick={onNewOrder}
          className="hidden md:flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-sm px-4 py-2.5 rounded-xl backdrop-blur-sm active:scale-95 transition-all cursor-pointer shadow-ambient"
        >
          <PlusIcon className="w-4 h-4" />
          Pesanan Baru
        </button>
      </div>
    </div>
  );
}

function FilterTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (v: "semua" | OrderStatus) => void;
}) {
  return (
    <div className="bg-surface-container-lowest px-4 md:px-8 py-2.5 flex gap-2 overflow-x-auto border-b border-outline-variant flex-shrink-0">
      {FILTERS.map((f) => (
        <button type="button"
          key={f.id}
          id={`filter-${f.id}`}
          onClick={() => onChange(f.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 cursor-pointer transition-all ${
            active === f.id
              ? "bg-primary text-on-primary shadow-active"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

function GroupSelector({
  groupBy,
  onChange,
}: {
  groupBy: GroupBy;
  onChange: (g: GroupBy) => void;
}) {
  return (
    <div className="bg-surface-container-lowest px-4 md:px-8 py-2 flex items-center gap-3 border-b border-outline-variant flex-wrap flex-shrink-0 transition-all">
      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
        Kelompokkan:
      </span>
      <div className="flex bg-surface-container p-0.5 rounded-xl gap-1">
        {GROUP_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            id={`group-opt-${opt.id}`}
            type="button"
            onClick={() => onChange(opt.id as GroupBy)}
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
  );
}

function LoadingSkeleton() {
  return (
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
  );
}

function EmptyState() {
  return (
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
  );
}

function GroupSection({
  title,
  badgeColor,
  icon: Icon,
  orders,
  onCardClick,
}: {
  title: string;
  badgeColor: string;
  icon?: React.ComponentType<{ className?: string }>;
  orders: Order[];
  onCardClick?: (order: Order) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-1 border-b border-outline-variant/60">
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badgeColor}`}
        >
          {Icon && <Icon className="w-3.5 h-3.5" />}
          <span>{title}</span>
        </div>
        <span className="text-xs font-bold text-outline">
          ({orders.length} Pesanan)
        </span>
        <div className="flex-1 h-px bg-outline-variant/40 ml-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} onCardClick={onCardClick} />
        ))}
      </div>
    </div>
  );
}

function FlatOrderGrid({
  paginatedOrders,
  onCardClick,
}: {
  paginatedOrders: Order[];
  onCardClick?: (order: Order) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
      {paginatedOrders.map((order) => (
        <OrderCard key={order.id} order={order} onCardClick={onCardClick} />
      ))}
    </div>
  );
}

function FabButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button"
      id="fab-new-order"
      onClick={onClick}
      className="md:hidden fixed bottom-20 right-5 z-40 w-14 h-14 bg-primary text-on-primary rounded-full shadow-active flex items-center justify-center hover:bg-primary-dark active:scale-95 transition-all cursor-pointer"
    >
      <PlusIcon className="w-7 h-7 text-white" />
    </button>
  );
}

export default function PesananScreen() {
  const { orders, ordersLoading, settleOrder } = usePOS();
  const router = useRouter();
  const [filter, setFilter] = useState<"semua" | OrderStatus>("semua");
  const [groupBy, setGroupBy] = useState<GroupBy>("date");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const itemsPerPage = 6;

  const filtered =
    filter === "semua" ? orders : orders.filter((o) => o.status === filter);

  const { currentPage, totalPages, paginatedItems, goToPage, reset } =
    usePagination(filtered, itemsPerPage);

  useEffect(() => {
    reset();
  }, [filter, groupBy, reset]);

  const groupedOrders = useOrderGrouping(paginatedItems, groupBy);

  return (
    <div className="flex flex-col min-h-full">
      <Header onNewOrder={() => router.push("/pesanan/baru")} />

      <FilterTabs active={filter} onChange={setFilter} />

      <GroupSelector groupBy={groupBy} onChange={setGroupBy} />

      <div className="flex-1 px-4 md:px-8 py-4 pb-24 md:pb-8 bg-background">
        {ordersLoading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : groupBy === "none" ? (
          <div>
            <FlatOrderGrid
              paginatedOrders={paginatedItems}
              onCardClick={setSelectedOrder}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </div>
        ) : (
          <div>
            <div className="space-y-6 animate-fade-in">
              {groupedOrders.map((group) => {
                const Icon = getGroupIcon(group.title);
                return (
                  <GroupSection
                    key={group.title}
                    title={group.title}
                    badgeColor={group.badgeColor}
                    icon={Icon}
                    orders={group.orders}
                    onCardClick={setSelectedOrder}
                  />
                );
              })}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </div>
        )}
      </div>

      <FabButton onClick={() => router.push("/pesanan/baru")} />

      {/* Payment modal */}
      {selectedOrder && (
        <PaymentModal
          order={selectedOrder}
          onConfirm={(payment) => {
            settleOrder(selectedOrder.id, payment);
            setSelectedOrder(null);
          }}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
