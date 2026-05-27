"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

const tabs = [
  {
    id: "beranda",
    href: "/beranda",
    label: "Beranda",
    icon: (active: boolean) => (
      <svg
        className={`w-5 h-5 ${active ? "text-orange-500" : "text-gray-400"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        />
        <polyline
          points="9 22 9 12 15 12 15 22"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "terminal",
    href: "/pesanan/baru",
    label: "Terminal",
    icon: (active: boolean) => (
      <svg
        className={`w-5 h-5 ${active ? "text-orange-500" : "text-gray-400"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
        />
        <line x1="3" x2="21" y1="6" y2="6" strokeLinecap="round" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 11v6m-3-3h6"
        />
      </svg>
    ),
  },
  {
    id: "pesanan",
    href: "/pesanan",
    label: "Pesanan",
    icon: (active: boolean) => (
      <svg
        className={`w-5 h-5 ${active ? "text-orange-500" : "text-gray-400"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
        />
        <line x1="3" x2="21" y1="6" y2="6" strokeLinecap="round" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 10a4 4 0 0 1-8 0"
        />
      </svg>
    ),
  },
  {
    id: "menu",
    href: "/menu",
    label: "Menu",
    icon: (active: boolean) => (
      <svg
        className={`w-5 h-5 ${active ? "text-orange-500" : "text-gray-400"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 2h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 13H3M12 2v20M17 7l5-5M22 7c0 4-4.5 5-6 2.5"
        />
      </svg>
    ),
  },
  {
    id: "diskon",
    href: "/diskon",
    label: "Diskon",
    icon: (active: boolean) => (
      <svg
        className={`w-5 h-5 ${active ? "text-orange-500" : "text-gray-400"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.5 14.5 14.5 9.5M9.5 9.5h.01M14.5 14.5h.01M16.5 18.5a6 6 0 0 0 6-6v-7a2 2 0 0 0-2-2h-7a6 6 0 0 0-6 6v7a2 2 0 0 0 2 2h7z"
        />
      </svg>
    ),
  },
];

/** Bottom nav — mobile only */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex">
      {tabs.map((tab) => {
        const isActive =
          tab.id === "pesanan"
            ? pathname === "/pesanan"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.id}
            id={`nav-mobile-${tab.id}`}
            href={tab.href}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium ${
              isActive ? "text-orange-500" : "text-gray-400"
            }`}
          >
            {tab.icon(isActive)}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Sidebar — desktop only */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 h-screen sticky top-0 flex-shrink-0 shadow-sm">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 2h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3zM7 13H3M12 2v20M17 7l5-5M22 7c0 4-4.5 5-6 2.5"
              />
            </svg>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">
              Toriniku Geprek
            </p>
            <p className="text-xs text-gray-400">POS System</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {tabs.map((tab) => {
          const isActive =
            tab.id === "pesanan"
              ? pathname === "/pesanan"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.id}
              id={`nav-sidebar-${tab.id}`}
              href={tab.href}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium ${
                isActive
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              {tab.icon(isActive)}
              {tab.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-100 flex flex-col gap-2">
        <button
          id="btn-logout-sidebar"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
            />
            <polyline
              strokeLinecap="round"
              strokeLinejoin="round"
              points="16 17 21 12 16 7"
            />
            <line x1="21" x2="9" y1="12" y2="12" strokeLinecap="round" />
          </svg>
          Keluar
        </button>
        <p className="text-xs text-gray-400 text-center">
          v1.0.0 · Toriniku Geprek
        </p>
      </div>
    </aside>
  );
}
