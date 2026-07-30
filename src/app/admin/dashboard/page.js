import Link from "next/link";
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
  { key: "magazines", label: "Magazine", href: "/admin/magazines" },
  { key: "events", label: "Events", href: "/admin/events" },
  { key: "categories", label: "Kategori", href: "/admin/categories" },
  { key: "inventaris", label: "Inventaris", href: "/admin/inventaris" },
  {
    key: "pending_comments",
    label: "Komentar pending",
    href: "/admin/comments",
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
          <h1 className="text-2xl font-bold text-green-700">Dashboard Admin</h1>
          <p className="mt-1 text-sm text-gray-600">
            Ringkasan data konten dan operasional Kopma.
          </p>
        </div>
        <p className="text-xs text-gray-500">Data per {updatedAt} WIB</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {STATS.map((stat) => (
          <Link
            key={stat.key}
            href={stat.href}
            className="rounded-2xl border border-green-100 border-l-4 border-l-green-600 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="tabular mt-2 text-3xl font-bold text-green-700">
              {data[stat.key]}
            </p>
          </Link>
        ))}
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
