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
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Magazine", href: "/admin/magazines", icon: BookOpen },
  { name: "Events", href: "/admin/events", icon: CalendarDays },
  { name: "Categories", href: "/admin/categories", icon: FolderKanban },
  { name: "Inventaris", href: "/admin/inventaris", icon: Package },
  { name: "Comments", href: "/admin/comments", icon: MessageSquare },
];

function isActive(href, pathname) {
  return href === "/admin/dashboard"
    ? pathname === href
    : pathname.startsWith(href);
}

function SidebarContent({ pathname, onNavigate, onLogout }) {
  return (
    <div className="flex h-full flex-col bg-green-700 text-white">
      <div className="flex items-center gap-3 border-b border-green-600 px-5 py-4">
        <Image
          src="/logokopma1.png"
          alt=""
          width={32}
          height={32}
          className="rounded-lg bg-white p-1"
        />
        <div className="leading-tight">
          <p className="text-sm font-bold">Admin Kopma</p>
          <p className="text-xs text-green-200">KOPMA UNNES</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {MENUS.map((menu) => {
          const Icon = menu.icon;
          const active = isActive(menu.href, pathname);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-green-900 font-semibold text-white"
                  : "text-green-100 hover:bg-green-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{menu.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-green-600 p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
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
      <aside className="fixed inset-y-0 hidden w-64 lg:block">
        <SidebarContent pathname={pathname} onLogout={handleLogout} />
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative h-full w-72 max-w-[85%]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Tutup menu"
              className="absolute right-3 top-3 z-10 rounded-lg p-2 text-green-100 hover:bg-green-800"
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
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-green-100 bg-white px-4 md:px-6">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Buka menu"
            className="rounded-lg p-2 text-green-700 hover:bg-green-50 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <span className="text-sm font-semibold text-gray-800">
            {current?.name || "Admin"}
          </span>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
