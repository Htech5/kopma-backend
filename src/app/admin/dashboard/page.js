import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  FolderKanban,
  Package,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  // Satu round-trip untuk semua angka ringkasan.
  const [rows] = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM magazines) AS magazines,
      (SELECT COUNT(*) FROM events) AS events,
      (SELECT COUNT(*) FROM categories) AS categories,
      (SELECT COUNT(*) FROM inventaris) AS inventaris,
      (SELECT COUNT(*) FROM comments WHERE status = 'pending') AS pending_comments
  `);

  return rows[0];
}

const STATS = [
  { key: "magazines", label: "Magazine", href: "/admin/magazines", icon: BookOpen },
  { key: "events", label: "Events", href: "/admin/events", icon: CalendarDays },
  { key: "categories", label: "Kategori", href: "/admin/categories", icon: FolderKanban },
  { key: "inventaris", label: "Inventaris", href: "/admin/inventaris", icon: Package },
  {
    key: "pending_comments",
    label: "Komentar pending",
    href: "/admin/comments",
    icon: MessageSquare,
  },
];

export default async function DashboardPage() {
  const data = await getDashboardData();

  const updatedAt = new Date().toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-green-700">
            Dashboard Admin
          </h1>
          <p className="mt-1.5 text-sm text-gray-600">
            Ringkasan data konten dan operasional Kopma.
          </p>
        </div>
        <p className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
          Data per {updatedAt} WIB
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {STATS.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link
              key={stat.key}
              href={stat.href}
              className="group relative overflow-hidden rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
            >
              <span className="absolute inset-y-0 left-0 w-1 bg-green-600 transition-colors group-hover:bg-green-700" />

              <div className="flex items-start justify-between gap-2 pl-1">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <span className="rounded-lg bg-green-50 p-1.5 text-green-700 transition-colors group-hover:bg-green-100">
                  <Icon className="h-4 w-4" />
                </span>
              </div>

              <p className="tabular mt-3 pl-1 text-3xl font-bold tracking-tight text-green-700">
                {data[stat.key]}
              </p>

              <span className="mt-3 flex items-center gap-1 pl-1 text-xs text-gray-400 transition-colors group-hover:text-green-700">
                Kelola
                <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>

      {data.pending_comments > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <p className="text-sm text-yellow-900">
            <span className="font-semibold">
              {data.pending_comments} komentar
            </span>{" "}
            menunggu moderasi dan belum tampil di situs.
          </p>
          <Link
            href="/admin/comments"
            className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-700"
          >
            Moderasi
          </Link>
        </div>
      )}
    </div>
  );
}
