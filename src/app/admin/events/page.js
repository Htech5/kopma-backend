"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, ImageOff, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader, EmptyState, LoadingBlock, useAdminFeedback } from "../_components/AdminUI";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notify, askConfirm, closeConfirm, feedbackUI } = useAdminFeedback();

  async function fetchEvents() {
    try {
      setLoading(true);
      const res = await fetch("/api/events", { cache: "no-store" });
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      notify("Gagal mengambil data event", "error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(id) {
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      notify(data.message || "Event dihapus", res.ok ? "success" : "error");
      if (res.ok) fetchEvents();
    } catch (error) {
      console.error(error);
      notify("Gagal menghapus event", "error");
    }
  }

  function handleDelete(id) {
    askConfirm({
      title: "Hapus event",
      message: "Yakin ingin menghapus event ini? Tindakan ini tidak bisa dibatalkan.",
      danger: true,
      onConfirm: () => {
        closeConfirm();
        deleteEvent(id);
      },
    });
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6">
      {feedbackUI}

      <PageHeader
        eyebrow="Manajemen Event"
        title="Events"
        description="Kelola data acara dan berita."
        action={
          <Link
            href="/admin/events/create"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-700 px-5 text-sm font-semibold text-white transition hover:bg-green-800 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Tambah Event
          </Link>
        }
      />

      <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
        {loading ? (
          <LoadingBlock />
        ) : events.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Belum ada event"
            description="Tambahkan acara atau berita pertama untuk mulai mengelola konten."
            action={
              <Link
                href="/admin/events/create"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-green-700 px-5 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                Tambah Sekarang
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {events.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-green-100 p-4 transition hover:shadow-md md:flex-row"
              >
                <div className="h-40 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 md:w-56">
                  {item.main_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.main_image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-gray-400">
                      <ImageOff className="h-6 w-6" />
                      <span className="text-xs">No Image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="mb-1.5 text-sm font-medium text-green-700">
                    {item.category_name || "Tanpa kategori"}
                  </p>
                  <h2 className="text-xl font-bold text-gray-800">{item.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">{item.slug}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/events/edit/${item.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
