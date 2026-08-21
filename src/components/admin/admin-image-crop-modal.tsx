"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Move, X, ZoomIn } from "lucide-react";

type AdminImageCropModalProps = {
  open: boolean;
  file: File | null;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
  busy?: boolean;
};

const OUTPUT_SIZE = 1200;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export function AdminImageCropModal({
  open,
  file,
  onCancel,
  onConfirm,
  busy = false,
}: AdminImageCropModalProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [frame, setFrame] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    if (!open || !file) {
      setObjectUrl(null);
      setNatural({ w: 0, h: 0 });
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [open, file]);

  useEffect(() => {
    if (!open) return;
    const el = viewportRef.current;
    if (!el) return;

    const update = () => setFrame(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      ro.disconnect();
      document.body.style.overflow = prev;
    };
  }, [open]);

  const baseScale =
    natural.w > 0 && natural.h > 0 && frame > 0 ? Math.max(frame / natural.w, frame / natural.h) : 1;

  const clampOffset = useCallback(
    (next: { x: number; y: number }, nextZoom = zoom) => {
      if (!natural.w || !natural.h || !frame) return next;
      const scale = Math.max(frame / natural.w, frame / natural.h) * nextZoom;
      const displayW = natural.w * scale;
      const displayH = natural.h * scale;
      const maxX = Math.max(0, (displayW - frame) / 2);
      const maxY = Math.max(0, (displayH - frame) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      };
    },
    [frame, natural.h, natural.w, zoom],
  );

  function onPointerDown(e: React.PointerEvent) {
    if (busy) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    setOffset(
      clampOffset({
        x: drag.originX + (e.clientX - drag.startX),
        y: drag.originY + (e.clientY - drag.startY),
      }),
    );
  }

  function onPointerUp(e: React.PointerEvent) {
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null;
  }

  function handleZoom(value: number) {
    setZoom(value);
    setOffset((prev) => clampOffset(prev, value));
  }

  async function confirmCrop() {
    if (!objectUrl || !natural.w || !frame) return;
    const displayScale = baseScale * zoom;

    const img = new window.Image();
    img.src = objectUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("No se pudo leer la imagen"));
    });

    const displayW = natural.w * displayScale;
    const displayH = natural.h * displayScale;
    const left = (frame - displayW) / 2 + offset.x;
    const top = (frame - displayH) / 2 + offset.y;

    const sx = (0 - left) / displayScale;
    const sy = (0 - top) / displayScale;
    const sSize = frame / displayScale;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", 0.88),
    );
    if (!blob) return;
    onConfirm(blob);
  }

  if (!open || !file) return null;

  const displayW = natural.w ? natural.w * baseScale * zoom : undefined;
  const displayH = natural.h ? natural.h * baseScale * zoom : undefined;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[#18181b]/55 p-3 backdrop-blur-[2px] sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-title"
        className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#e4e4e7] bg-white shadow-[0_24px_60px_rgba(24,24,27,0.28)]"
      >
        <div className="flex items-center justify-between border-b border-[#f4f4f5] px-4 py-3">
          <div>
            <h2 id="crop-title" className="text-base font-bold text-[#18181b]">
              Ajustar foto
            </h2>
            <p className="text-xs text-[#71717a]">Mové y hacé zoom para encuadrar.</p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            aria-label="Cerrar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#71717a] hover:bg-[#f4f4f5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-4 py-4">
          <div
            ref={viewportRef}
            className="relative mx-auto aspect-square w-full max-w-[340px] touch-none overflow-hidden rounded-2xl bg-[#111]"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {objectUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={objectUrl}
                alt=""
                draggable={false}
                onLoad={(e) => {
                  const el = e.currentTarget;
                  setNatural({ w: el.naturalWidth, h: el.naturalHeight });
                  setOffset({ x: 0, y: 0 });
                  setZoom(1);
                }}
                className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                style={{
                  width: displayW ? `${displayW}px` : "100%",
                  height: displayH ? `${displayH}px` : "auto",
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                }}
              />
            ) : null}

            <div className="pointer-events-none absolute inset-3 rounded-xl border-2 border-dashed border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white">
                <Move className="h-3 w-3" />
                Arrastrá para ubicar
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="crop-zoom"
              className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#3f3f46]"
            >
              <ZoomIn className="h-4 w-4 text-[#029f9c]" />
              Zoom
            </label>
            <input
              id="crop-zoom"
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              disabled={busy || !natural.w}
              onChange={(e) => handleZoom(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-[#029f9c]"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[#f4f4f5] px-4 py-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="h-11 rounded-xl border border-[#e4e4e7] px-4 text-sm font-bold text-[#3f3f46] hover:bg-[#f4f4f5] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={busy || !natural.w}
            onClick={() => void confirmCrop()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#029f9c] px-4 text-sm font-bold text-white hover:bg-[#027a78] disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {busy ? "Subiendo…" : "Usar esta foto"}
          </button>
        </div>
      </div>
    </div>
  );
}
