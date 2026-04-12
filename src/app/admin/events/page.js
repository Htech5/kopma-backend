"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchEvents() {
    try {
      const res = await fetch("/api/events", { cache: "no-store" });
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data event");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const ok = confirm("Yakin ingin menghapus event ini?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus event");
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-md border border-green-100 p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm mb-3">
              Manajemen Event
            </p>
            <h1 className="text-3xl font-bold text-green-700">Events</h1>
            <p className="text-gray-600 mt-2">
              Kelola data acara dan berita.
            </p>
          </div>

          <Link
            href="/admin/events/create"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl"
          >
            + Tambah Event
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-green-100 p-6">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500">Belum ada event.</p>
        ) : (
          <div className="space-y-4">
            {events.map((item) => (
              <div
                key={item.id}
                className="border border-green-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4"
              >
                <div className="w-full md:w-56 h-40 bg-gray-100 rounded-xl overflow-hidden">
                  {item.main_image ? (
                    <img
                      src={item.main_image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm text-green-700 font-medium mb-2">
                    {item.category_name || "Tanpa kategori"}
                  </p>
                  <h2 className="text-xl font-bold text-gray-800">
                    {item.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{item.slug}</p>

                  <div className="flex gap-2 mt-4 flex-wrap">
                    <Link
                      href={`/admin/events/edit/${item.id}`}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
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