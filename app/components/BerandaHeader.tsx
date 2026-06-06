"use client";

import { formatRupiah } from "../../lib/utils/format";

export function BerandaHeader({
  userEmail,
  dateStr,
  todayRevenue,
  isLoading,
}: {
  userEmail: string;
  dateStr: string;
  todayRevenue: number;
  isLoading: boolean;
}) {
  return (
    <div className="bg-primary px-5 md:px-8 pt-8 pb-8 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-container rounded-full opacity-40" />
      <div className="absolute top-4 -right-4 w-24 h-24 bg-primary-container/60 rounded-full opacity-20" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Toriniku Geprek</h1>
          <p className="text-on-primary/80 text-sm mt-0.5">
            Wilujeng Sumping, {userEmail.split("@")[0]}!
          </p>
        </div>
      </div>
      <div className="relative z-10 mt-5 bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-on-primary/80 text-xs font-semibold uppercase tracking-wide">
              {dateStr}
            </p>
          </div>
          <svg
            className="w-5 h-5 text-white/80"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <polyline strokeLinecap="round" strokeLinejoin="round" points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline strokeLinecap="round" strokeLinejoin="round" points="17 6 23 6 23 12" />
          </svg>
        </div>
        <p className="text-on-primary/80 text-xs font-semibold uppercase tracking-wide mt-3">
          Pendapatan Hari Ini
        </p>
        <p className="text-white text-2xl md:text-3xl font-bold mt-1">
          {isLoading ? "..." : formatRupiah(todayRevenue)}
        </p>
      </div>
    </div>
  );
}
