"use client";

import { useState, useEffect } from "react";

type Period = "7d" | "30d" | "90d";

interface DailyRevenue {
  date: string; // "YYYY-MM-DD"
  total: number;
}

interface MenuStat {
  name: string;
  quantity: number;
}

function formatRupiah(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function formatRupiahFull(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

// ─── Sparkline / Line Chart ────────────────────────────────────────────────────
function LineChart({ data }: { data: DailyRevenue[] }) {
  const W = 600;
  const H = 180;
  const PAD = { top: 16, right: 16, bottom: 36, left: 56 };

  const values = data.map((d) => d.total);
  const maxVal = Math.max(...values, 1);
  const minVal = 0;

  const xStep = (W - PAD.left - PAD.right) / Math.max(data.length - 1, 1);

  const toX = (i: number) => PAD.left + i * xStep;
  const toY = (v: number) =>
    PAD.top + ((H - PAD.top - PAD.bottom) * (1 - (v - minVal) / (maxVal - minVal)));

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.total), ...d }));

  const pathD =
    points.length < 2
      ? ""
      : points
          .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
          .join(" ");

  const areaD =
    points.length < 2
      ? ""
      : `${pathD} L${points[points.length - 1].x},${H - PAD.bottom} L${points[0].x},${H - PAD.bottom} Z`;

  // Y axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    val: maxVal * t,
    y: toY(maxVal * t),
  }));

  // X axis labels — show every N-th label to avoid overlap
  const step = data.length <= 7 ? 1 : data.length <= 14 ? 2 : data.length <= 30 ? 5 : 10;
  const xLabels = points.filter((_, i) => i % step === 0 || i === points.length - 1);

  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={t.y}
            y2={t.y}
            stroke="currentColor"
            strokeOpacity={0.08}
            strokeDasharray="4 3"
          />
          <text
            x={PAD.left - 6}
            y={t.y + 4}
            textAnchor="end"
            fontSize={10}
            fill="currentColor"
            fillOpacity={0.45}
          >
            {formatRupiah(t.val)}
          </text>
        </g>
      ))}

      {/* Area fill */}
      {areaD && <path d={areaD} fill="url(#lineGrad)" />}

      {/* Line */}
      {pathD && (
        <path
          d={pathD}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* X labels */}
      {xLabels.map((p, i) => {
        const [, mm, dd] = p.date.split("-");
        return (
          <text
            key={i}
            x={p.x}
            y={H - PAD.bottom + 14}
            textAnchor="middle"
            fontSize={10}
            fill="currentColor"
            fillOpacity={0.5}
          >
            {dd}/{mm}
          </text>
        );
      })}

      {/* Data points + hover */}
      {points.map((p, i) => (
        <g
          key={i}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          <circle
            cx={p.x}
            cy={p.y}
            r={hovered === i ? 5 : 3}
            fill="var(--color-primary)"
            stroke="white"
            strokeWidth={1.5}
            className="transition-all cursor-pointer"
          />
          {hovered === i && (
            <g>
              <rect
                x={Math.min(p.x - 52, W - PAD.right - 104)}
                y={p.y - 36}
                width={104}
                height={28}
                rx={6}
                fill="var(--color-on-surface)"
                fillOpacity={0.9}
              />
              <text
                x={Math.min(p.x, W - PAD.right - 52)}
                y={p.y - 18}
                textAnchor="middle"
                fontSize={11}
                fill="var(--color-surface)"
                fontWeight={700}
              >
                {formatRupiahFull(p.total)}
              </text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

// ─── Bar Chart ─────────────────────────────────────────────────────────────────
function BarChart({ data }: { data: MenuStat[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxQty = Math.max(...data.map((d) => d.quantity), 1);
  const colors = [
    "var(--color-primary)",
    "#f59e0b",
    "#10b981",
    "#6366f1",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#8b5cf6",
    "#ef4444",
    "#06b6d4",
  ];

  return (
    <div className="flex flex-col gap-2.5">
      {data.map((d, i) => {
        const pct = (d.quantity / maxQty) * 100;
        const color = colors[i % colors.length];
        return (
          <div
            key={d.name}
            className="flex items-center gap-3 group"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="w-5 text-right text-xs font-bold text-outline shrink-0">
              {i + 1}
            </div>
            <div className="w-28 md:w-36 text-xs font-semibold text-on-surface truncate shrink-0">
              {d.name}
            </div>
            <div className="flex-1 h-7 bg-surface-container rounded-lg overflow-hidden relative">
              <div
                className="h-full rounded-lg transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: color,
                  opacity: hovered === null || hovered === i ? 1 : 0.4,
                }}
              />
            </div>
            <div
              className="text-xs font-bold shrink-0 w-12 text-right tabular-nums"
              style={{ color }}
            >
              {d.quantity}×
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalitikPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [menuStats, setMenuStats] = useState<MenuStat[]>([]);
  const [summary, setSummary] = useState<{
    totalRevenue: number;
    avgDaily: number;
    peakDay: { date: string; total: number };
  }>({ totalRevenue: 0, avgDaily: 0, peakDay: { date: "-", total: 0 } });
  const [loading, setLoading] = useState(true);
  const [topN, setTopN] = useState(10);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analitik?period=${period}`)
      .then((r) => r.json())
      .then((data) => {
        setDailyRevenue(data.dailyRevenue ?? []);
        setMenuStats(data.menuStats ?? []);
        setSummary(data.summary ?? { totalRevenue: 0, avgDaily: 0, peakDay: { date: "-", total: 0 } });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  const topMenus = menuStats.slice(0, topN);
  const totalOrdered = menuStats.reduce((s, m) => s + m.quantity, 0);
  const { totalRevenue, avgDaily, peakDay } = summary;

  const PERIODS: { key: Period; label: string }[] = [
    { key: "7d", label: "7 Hari" },
    { key: "30d", label: "30 Hari" },
    { key: "90d", label: "90 Hari" },
  ];

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* ── Header ── */}
      <div className="bg-primary px-5 md:px-8 pt-8 pb-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-container rounded-full opacity-30" />
        <div className="absolute top-6 -right-4 w-24 h-24 bg-primary-container/60 rounded-full opacity-15" />
        <div className="relative z-10">
          <h1 className="text-white text-2xl font-bold">Analitik</h1>
          <p className="text-on-primary/75 text-sm mt-0.5">
            Performa penjualan &amp; menu terlaris
          </p>
        </div>

        {/* Period tabs */}
        <div className="relative z-10 mt-4 flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                period === p.key
                  ? "bg-white text-primary shadow"
                  : "bg-white/15 text-white/80 hover:bg-white/25"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 md:px-8 pt-5 pb-24 md:pb-8 space-y-5">
        {/* ── Summary cards ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Total Pendapatan",
              value: loading ? "—" : formatRupiahFull(totalRevenue),
              sub: `dalam ${period === "7d" ? "7" : period === "30d" ? "30" : "90"} hari`,
              color: "text-primary",
            },
            {
              label: "Rata-rata/Hari",
              value: loading ? "—" : formatRupiah(avgDaily),
              sub: "rata-rata harian",
              color: "text-tertiary",
            },
            {
              label: "Hari Terbaik",
              value: loading ? "—" : formatRupiah(peakDay.total),
              sub: peakDay.date !== "-"
                ? peakDay.date.split("-").reverse().slice(0, 2).join("/")
                : "—",
              color: "text-amber-500",
            },
          ].map((c, i) => (
            <div
              key={i}
              className="bg-surface-container-lowest rounded-2xl p-3.5 md:p-4 shadow-ambient border border-surface-container-high"
            >
              <p className="text-xxs md:text-xs text-on-surface-variant font-medium uppercase tracking-wide">
                {c.label}
              </p>
              {loading ? (
                <div className="h-6 w-16 bg-gray-200 rounded-lg animate-pulse mt-2 mb-1" />
              ) : (
                <p className={`text-base md:text-lg font-bold mt-1 ${c.color} leading-tight`}>
                  {c.value}
                </p>
              )}
              <p className="text-xxs text-outline mt-0.5">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Income History Line Chart ── */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 md:p-5 shadow-ambient border border-surface-container-high">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-on-surface">
                Riwayat Pendapatan
              </h2>
              <p className="text-xxs text-on-surface-variant mt-0.5">
                Pendapatan harian dari pesanan selesai
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <polyline
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="23 6 13.5 15.5 8.5 10.5 1 18"
                />
                <polyline
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="17 6 23 6 23 12"
                />
              </svg>
            </div>
          </div>

          {loading ? (
            <div className="h-44 bg-gray-100 rounded-xl animate-pulse" />
          ) : dailyRevenue.every((d) => d.total === 0) ? (
            <div className="h-44 flex items-center justify-center text-sm text-on-surface-variant">
              Belum ada transaksi selesai dalam periode ini.
            </div>
          ) : (
            <div className="h-44 text-on-surface">
              <LineChart data={dailyRevenue} />
            </div>
          )}
        </div>

        {/* ── Menu Terlaris Bar Chart ── */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 md:p-5 shadow-ambient border border-surface-container-high">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-on-surface">
                Menu Terlaris
              </h2>
              <p className="text-xxs text-on-surface-variant mt-0.5">
                {loading ? "—" : `${totalOrdered} item terjual dalam periode ini`}
              </p>
            </div>
            <div className="flex gap-1.5">
              {[5, 10, 15].map((n) => (
                <button
                  key={n}
                  onClick={() => setTopN(n)}
                  className={`px-2.5 py-1 rounded-lg text-xxs font-bold transition-all cursor-pointer ${
                    topN === n
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-secondary hover:bg-surface-container-high"
                  }`}
                >
                  Top {n}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-5 h-3 bg-gray-200 rounded" />
                  <div className="w-28 h-3 bg-gray-200 rounded" />
                  <div className="flex-1 h-7 bg-gray-100 rounded-lg" />
                  <div className="w-10 h-3 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : topMenus.length === 0 ? (
            <div className="py-12 flex items-center justify-center text-sm text-on-surface-variant">
              Belum ada data penjualan dalam periode ini.
            </div>
          ) : (
            <BarChart data={topMenus} />
          )}
        </div>
      </div>
    </div>
  );
}
