import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {}, // read-only in route handler
      },
    }
  );

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "30d";
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceISO = since.toISOString();

  // ── 1. Daily revenue ──────────────────────────────────────────────────────────
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select("total, order_type, created_at")
    .eq("status", "paid")
    .gte("created_at", sinceISO)
    .order("created_at", { ascending: true });

  // Build a fully pre-filled map of all days (so zeroes show)
  const revenueMap: Record<string, number> = {};
  for (let d = 0; d < days; d++) {
    const dt = new Date();
    dt.setDate(dt.getDate() - (days - 1 - d));
    const key = dt.toISOString().slice(0, 10);
    revenueMap[key] = 0;
  }
  if (ordersData) {
    ordersData.forEach((row: any) => {
      const key = (row.created_at as string).slice(0, 10);
      if (key in revenueMap) revenueMap[key] = (revenueMap[key] || 0) + Number(row.total);
    });
  }

  const dailyRevenue = Object.entries(revenueMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total }));

  // ── 2. Menu stats ─────────────────────────────────────────────────────────────
  const { data: itemsData } = await supabase
    .from("order_items")
    .select(`
      quantity,
      menu_items ( name ),
      orders!inner ( status, created_at )
    `)
    .eq("orders.status", "paid")
    .gte("orders.created_at", sinceISO);

  const statsMap: Record<string, number> = {};
  if (itemsData) {
    itemsData.forEach((row: any) => {
      const name: string = row.menu_items?.name || "Produk";
      statsMap[name] = (statsMap[name] || 0) + Number(row.quantity);
    });
  }

  const menuStats = Object.entries(statsMap)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity);

  const totalRevenue = dailyRevenue.reduce((s, d) => s + d.total, 0);
  const avgDaily = dailyRevenue.length > 0 ? totalRevenue / dailyRevenue.length : 0;

  // ── 3. Order count & type breakdown ──────────────────────────────────────────
  const orderCount = ordersData?.length ?? 0;
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  const dineInCount = ordersData?.filter((r: any) => r.order_type === "dine_in").length ?? 0;
  const takeawayCount = orderCount - dineInCount;

  // ── 4. Previous period comparison ────────────────────────────────────────────
  const prevSince = new Date(since);
  prevSince.setDate(prevSince.getDate() - days);
  const prevSinceISO = prevSince.toISOString();

  const { data: prevData } = await supabase
    .from("orders")
    .select("total")
    .eq("status", "paid")
    .gte("created_at", prevSinceISO)
    .lt("created_at", sinceISO);

  const prevRevenue = prevData?.reduce((s: number, r: any) => s + Number(r.total), 0) ?? 0;
  const revenueChange = prevRevenue > 0
    ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
    : totalRevenue > 0 ? 100 : 0;

  // ── 5. Summary stats ──────────────────────────────────────────────────────────
  const peakDay = dailyRevenue.reduce(
    (best, d) => (d.total > best.total ? d : best),
    { date: "-", total: 0 }
  );

  return NextResponse.json({
    dailyRevenue,
    menuStats,
    summary: {
      totalRevenue,
      avgDaily,
      peakDay,
      orderCount,
      avgOrderValue,
      dineInCount,
      takeawayCount,
      revenueChange,
    },
    error: ordersError?.message ?? null,
  });
}
