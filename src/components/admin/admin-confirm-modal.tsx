"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

type AdminConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AdminConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Sí, eliminar",
  cancelLabel = "Cancelar",
  busy = false,
  onConfirm,
  onCancel,
}: AdminConfirmModalProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onCancel();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center" role="presentation">
      <button
        type="button"
        aria-label="Cerrar"
        disabled={busy}
        onClick={onCancel}
        className="absolute inset-0 bg-[#18181b]/45 backdrop-blur-[2px]"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-desc"
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-[#e4e4e7] bg-white shadow-[0_20px_50px_rgba(24,24,27,0.22)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#f4f4f5] px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1f1] text-[#b44545]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 id="admin-confirm-title" className="text-base font-bold text-[#18181b]">
                {title}
              </h2>
              <p id="admin-confirm-desc" className="mt-1 text-sm leading-relaxed text-[#52525b]">
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Cerrar diálogo"
            disabled={busy}
            onClick={onCancel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#71717a] hover:bg-[#f4f4f5] disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="h-11 rounded-xl border border-[#e4e4e7] px-4 text-sm font-bold text-[#3f3f46] hover:bg-[#f4f4f5] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="h-11 rounded-xl bg-[#b44545] px-4 text-sm font-bold text-white hover:bg-[#9d3a3a] disabled:opacity-50"
          >
            {busy ? "Eliminando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
