import { useMemo } from "react";
import type { Order, OrderStatus } from "../api/types";

export type GroupBy = "none" | "type" | "status" | "date";

export interface GroupedOrders {
  title: string;
  badgeColor: string;
  icon?: React.ReactNode;
  orders: Order[];
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  Baru: "bg-surface-container text-on-surface-variant font-semibold",
  Diproses: "bg-secondary-container text-on-secondary-container font-semibold",
  Selesai: "bg-tertiary-container/30 text-on-tertiary-container font-semibold",
  Dibatalkan: "bg-error-container text-on-error-container font-semibold",
};

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function isYesterday(dateStr: string) {
  const d = new Date(dateStr);
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  return (
    d.getDate() === yest.getDate() &&
    d.getMonth() === yest.getMonth() &&
    d.getFullYear() === yest.getFullYear()
  );
}

function groupByType(ordersList: Order[]): GroupedOrders[] {
  const dineIn = ordersList.filter((o) => o.customerName === "Dine In");
  const takeaway = ordersList.filter((o) => o.customerName === "Takeaway");

  return [
    {
      title: "Dine In",
      badgeColor:
        "bg-secondary-container text-on-secondary-container border border-outline-variant",
      orders: dineIn,
    },
    {
      title: "Takeaway",
      badgeColor:
        "bg-primary-container text-on-primary-container border border-primary/20",
      orders: takeaway,
    },
  ].filter((g) => g.orders.length > 0);
}

function groupByStatus(ordersList: Order[]): GroupedOrders[] {
  const statuses: OrderStatus[] = [
    "Baru",
    "Diproses",
    "Selesai",
    "Dibatalkan",
  ];

  return statuses.reduce<GroupedOrders[]>((acc, s) => {
    const filtered = ordersList.filter((o) => o.status === s);
    if (filtered.length > 0) {
      acc.push({
        title: s,
        badgeColor: STATUS_COLORS[s],
        orders: filtered,
      });
    }
    return acc;
  }, []);
}

function groupByDate(ordersList: Order[]): GroupedOrders[] {
  const todayList: Order[] = [];
  const yesterdayList: Order[] = [];
  const earlierList: Order[] = [];

  ordersList.forEach((o) => {
    if (isToday(o.createdAt)) todayList.push(o);
    else if (isYesterday(o.createdAt)) yesterdayList.push(o);
    else earlierList.push(o);
  });

  return [
    {
      title: "Hari Ini",
      badgeColor: "bg-primary/10 text-primary border border-primary/20",
      orders: todayList,
    },
    {
      title: "Kemarin",
      badgeColor:
        "bg-secondary-container text-on-secondary-container border border-outline-variant",
      orders: yesterdayList,
    },
    {
      title: "Sebelumnya",
      badgeColor:
        "bg-surface-container text-on-surface-variant border border-outline-variant",
      orders: earlierList,
    },
  ].filter((g) => g.orders.length > 0);
}

export function useOrderGrouping(orders: Order[], groupBy: GroupBy) {
  return useMemo(() => {
    switch (groupBy) {
      case "type":
        return groupByType(orders);
      case "status":
        return groupByStatus(orders);
      case "date":
        return groupByDate(orders);
      default:
        return [];
    }
  }, [orders, groupBy]);
}
