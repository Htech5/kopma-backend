"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  CalendarDays,
  Package,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const MENUS = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, group: "Ringkasan" },
  { name: "Magazine", href: "/admin/magazines", icon: BookOpen, group: "Konten" },
  { name: "Events", href: "/admin/events", icon: CalendarDays, group: "Konten" },
  { name: "Categories", href: "/admin/categories", icon: FolderKanban, group: "Konten" },
  { name: "Inventaris", href: "/admin/inventaris", icon: Package, group: "Operasional" },
  { name: "Comments", href: "/admin/comments", icon: MessageSquare, group: "Operasional" },
];

const GROUPS = ["Ringkasan", "Konten", "Operasional"];

function isActive(href, pathname) {
  return href === "/admin/dashboard"
    ? pathname === href
    : pathname.startsWith(href);
}

function SidebarContent({ pathname, onNavigate, onLogout }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <Image
          src="/logokopma1.png"
          alt=""
          width={32}
          height={32}
          className="rounded-lg bg-white p-1"
        />
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">KOPMA UNNES</p>
          <p className="text-[11px] text-slate-500">Admin Console</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {GROUPS.map((group) => (
          <div key={group}>
            <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
              {group}
            </p>
            <div className="space-y-1">
              {MENUS.filter((m) => m.group === group).map((menu) => {
                const Icon = menu.icon;
                const active = isActive(menu.href, pathname);

                return (
                  <Link
                    key={menu.href}
                    href={menu.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                      active
                        ? "bg-white/10 font-medium text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${active ? "text-emerald-400" : ""}`}
                    />
                    <span>{menu.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const current = MENUS.find((m) => isActive(m.href, pathname));

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        router.replace("/login");
        router.refresh();
      } else {
        alert("Logout gagal");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal logout");
    }
  };

  return (
    <div className="min-h-screen lg:flex">
      <aside className="fixed inset-y-0 hidden w-64 bg-slate-950 lg:block">
        <SidebarContent pathname={pathname} onLogout={handleLogout} />
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="h-full w-72 max-w-[85%] bg-slate-950"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Tutup menu"
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              pathname={pathname}
              onNavigate={() => setIsOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Buka menu"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <span className="text-sm font-medium text-slate-900">
            {current?.name || "Admin"}
          </span>

          <span className="ml-auto hidden text-xs text-slate-400 sm:block">
            api.ukmkopmaunnes.com
          </span>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
