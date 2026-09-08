"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

// Kartu header halaman (badge + judul + deskripsi + aksi kanan) dipakai semua
// halaman list/form admin biar konsisten.
export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {eyebrow && (
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-green-700 sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-sm text-gray-600 sm:text-base">{description}</p>
          )}
        </div>
        {action && <div className="flex flex-wrap gap-2">{action}</div>}
      </div>
    </div>
  );
}

// Empty state konsisten dipakai untuk list kosong/hasil pencarian kosong.
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-green-200 bg-white p-10 text-center shadow-sm">
      {Icon && (
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-green-50 text-green-600">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// Skeleton loader generik pengganti teks "Loading...".
export function LoadingBlock({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-2xl border border-green-100 bg-green-50/60"
        />
      ))}
    </div>
  );
}

export function ConfirmDialog({ open, title, message, danger, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-green-100 bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
              danger ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-green-700 hover:bg-green-800"
            }`}
          >
            Ya, lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-50 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg transition ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-green-200 bg-green-50 text-green-700"
      }`}
    >
      {toast.message}
    </div>
  );
}

// Gabungan state untuk confirm dialog + toast, biar tiap halaman tinggal
// pakai `notify()` dan `askConfirm()` tanpa nulis ulang state machine-nya.
export function useAdminFeedback() {
  const [confirmState, setConfirmState] = useState(null);
  const [toast, setToast] = useState(null);

  function notify(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function askConfirm({ title, message, danger, onConfirm }) {
    setConfirmState({ title, message, danger, onConfirm });
  }

  const feedbackUI = (
    <>
      <ConfirmDialog
        open={!!confirmState}
        title={confirmState?.title}
        message={confirmState?.message}
        danger={confirmState?.danger}
        onConfirm={confirmState?.onConfirm}
        onCancel={() => setConfirmState(null)}
      />
      <Toast toast={toast} />
    </>
  );

  return { notify, askConfirm, closeConfirm: () => setConfirmState(null), feedbackUI };
}
