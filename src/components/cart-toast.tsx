"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check, ShoppingBag, X } from "lucide-react";

import PawIcon from "@/components/paw-icon";
import { useCart } from "@/components/cart-provider";

const VISIBLE_MS = 3000;
const EXIT_MS = 320;

export function CartToast() {
  const { toast, dismissToast } = useCart();
  const [phase, setPhase] = useState<"in" | "out">("out");
  const [shown, setShown] = useState<NonNullable<typeof toast> | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];

    if (!toast) {
      if (shown) {
        setPhase("out");
        const t = window.setTimeout(() => setShown(null), EXIT_MS);
        timers.current.push(t);
      }
      return;
    }

    setShown(toast);
    setPhase("out");
    const enter = window.setTimeout(() => setPhase("in"), 20);
    const hide = window.setTimeout(() => {
      setPhase("out");
      const clear = window.setTimeout(() => {
        dismissToast();
        setShown(null);
      }, EXIT_MS);
      timers.current.push(clear);
    }, VISIBLE_MS);
    timers.current.push(enter, hide);

    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to new toast id
  }, [toast?.id]);

  function handleClose() {
    setPhase("out");
    const t = window.setTimeout(() => {
      dismissToast();
      setShown(null);
    }, EXIT_MS);
    timers.current.push(t);
  }

  if (!shown) return null;

  const visible = phase === "in";

  return (
    <div
      className="pointer-events-none fixed top-[4.75rem] right-3 z-[60] w-[min(100%-1.5rem,22rem)] sm:top-[5.25rem] sm:right-5"
      role="status"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto relative flex gap-3 rounded-xl border border-[#d8eae9] bg-white p-3 pr-9 shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all ease-out motion-reduce:transition-none ${
          visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0 sm:translate-x-10"
        }`}
        style={{ transitionDuration: `${EXIT_MS}ms` }}
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f5f5f5]">
          {shown.imagen ? (
            <Image src={shown.imagen} alt="" fill className="object-contain p-1" sizes="56px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <PawIcon className="h-7 w-7 text-[#029f9c]" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[#029f9c]">
            <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Agregado al carrito
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-[#333]">
            {shown.cantidad > 1 ? `${shown.cantidad} × ` : null}
            {shown.nombre}
          </p>
          <button
            type="button"
            onClick={() => {
              handleClose();
              window.dispatchEvent(new Event("open-cart"));
            }}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#029f9c] underline-offset-2 hover:underline"
          >
            <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
            Ver carrito
          </button>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="absolute right-2 top-2 rounded-md p-1 text-[#999] transition-colors hover:bg-[#f4f4f5] hover:text-[#333]"
          aria-label="Cerrar notificación"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
