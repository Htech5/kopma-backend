import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  FolderKanban,
  Package,
  MessageSquare,
  ArrowUpRight,
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

function StatCard({ label, value, icon: Icon, href, accent = false }) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <Icon
          className={`h-4 w-4 ${accent ? "text-amber-500" : "text-slate-400"}`}
        />
      </div>
      <p
        className={`tabular mt-3 text-3xl font-semibold tracking-tight ${
          accent && value > 0 ? "text-amber-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs text-slate-400 transition group-hover:text-emerald-700">
        Kelola <ArrowUpRight className="h-3 w-3" />
      </span>
    </Link>
  );
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const updatedAt = new Date().toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Ringkasan
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Status konten dan operasional KOPMA UNNES.
          </p>
        </div>
        <p className="text-xs text-slate-400">Diperbarui {updatedAt} WIB</p>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Magazine"
          value={data.magazines}
          icon={BookOpen}
          href="/admin/magazines"
        />
        <StatCard
          label="Events"
          value={data.events}
          icon={CalendarDays}
          href="/admin/events"
        />
        <StatCard
          label="Kategori"
          value={data.categories}
          icon={FolderKanban}
          href="/admin/categories"
        />
        <StatCard
          label="Inventaris"
          value={data.inventaris}
          icon={Package}
          href="/admin/inventaris"
        />
        <StatCard
          label="Komentar pending"
          value={data.pending_comments}
          icon={MessageSquare}
          href="/admin/comments"
          accent
        />
      </section>

      {data.pending_comments > 0 && (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div>
            <p className="text-sm font-medium text-amber-900">
              {data.pending_comments} komentar menunggu moderasi
            </p>
            <p className="mt-1 text-sm text-amber-800/80">
              Komentar baru belum tampil di situs sampai disetujui.
            </p>
          </div>
          <Link
            href="/admin/comments"
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
          >
            Moderasi sekarang
          </Link>
        </section>
      )}

      <section>
        <h2 className="text-sm font-medium text-slate-900">Aksi cepat</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Tambah event", href: "/admin/events/create" },
            { label: "Tambah magazine", href: "/admin/magazines/create" },
            { label: "Tambah kategori", href: "/admin/categories/create" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700"
            >
              {action.label}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
