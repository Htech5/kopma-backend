"use client";

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

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const menus = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Magazine", href: "/admin/magazines", icon: BookOpen },
    { name: "Categories", href: "/admin/categories", icon: FolderKanban },
    { name: "Events", href: "/admin/events", icon: CalendarDays },
    { name: "Inventaris", href: "/admin/inventaris", icon: Package },
    { name: "Comments", href: "/admin/comments", icon: MessageSquare },
  ];

  const isActive = (href) => {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const closeMenu = () => setIsOpen(false);

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
    <div className="min-h-screen bg-green-50">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex w-64 bg-green-700 text-white p-6 shadow-lg flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-8">Admin Kopma</h1>

            <nav className="space-y-3">
              {menus.map((menu) => {
                const Icon = menu.icon;

                return (
                  <Link
                    key={menu.href}
                    href={menu.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                      isActive(menu.href)
                        ? "bg-green-900 text-white font-semibold"
                        : "text-white hover:bg-green-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{menu.name}</span>
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full rounded-xl px-4 py-3 bg-red-600 hover:bg-red-700 transition text-white font-semibold flex items-center gap-3"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>

          <div className="text-sm text-green-100 mt-8">Admin Panel Kopma</div>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="md:hidden sticky top-0 z-40 bg-white border-b border-green-100 px-4 py-3 flex items-center justify-between shadow-sm">
            <h1 className="text-lg font-bold text-green-700">Admin Kopma</h1>

            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-700 text-white hover:bg-green-800 transition"
              aria-label="Buka menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </header>

          {isOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/40 z-50"
              onClick={closeMenu}
            >
              <div
                className="w-72 max-w-[85%] h-full bg-green-700 text-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">Admin Kopma</h2>
                  <button
                    onClick={closeMenu}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-800 hover:bg-green-900 transition"
                    aria-label="Tutup menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-3">
                  {menus.map((menu) => {
                    const Icon = menu.icon;

                    return (
                      <Link
                        key={menu.href}
                        href={menu.href}
                        onClick={closeMenu}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                          isActive(menu.href)
                            ? "bg-green-900 text-white font-semibold"
                            : "text-white hover:bg-green-800"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{menu.name}</span>
                      </Link>
                    );
                  })}

                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl px-4 py-3 bg-red-600 hover:bg-red-700 transition text-white font-semibold flex items-center gap-3"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </nav>

                <div className="text-sm text-green-100 mt-8">Admin Panel Kopma</div>
              </div>
            </div>
          )}

          <main className="flex-1 bg-green-50 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}