"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import PawIcon from "@/components/paw-icon";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/body-scroll-lock";
import { formatArs } from "@/lib/products";

type HeaderCartProps = {
  variant?: "light" | "dark";
};

export default function HeaderCart({ variant = "light" }: HeaderCartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { items, totalQuantity, subtotal, updateQuantity, removeItem } = useCart();
  const router = useRouter();
  const cashSaving = Math.round(subtotal * 0.1);

  useEffect(() => {
    if (isOpen) {
      lockBodyScroll();
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const onOpenCart = () => setIsOpen(true);

    window.addEventListener("keydown", onEscape);
    window.addEventListener("open-cart", onOpenCart);

    return () => {
      if (isOpen) {
        unlockBodyScroll();
      }
      window.removeEventListener("keydown", onEscape);
      window.removeEventListener("open-cart", onOpenCart);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`relative text-xs font-semibold transition-opacity hover:opacity-90 ${
          variant === "light" ? "text-[#1a1a2e]" : "text-white"
        }`}
      >
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e4077d] px-1.5 text-[11px] font-black text-white">
          {totalQuantity}
        </span>
        <div className="mx-auto mb-0.5 flex h-8 w-8 items-center justify-center md:mb-1 md:h-9 md:w-9">
          <ShoppingCart className="h-7 w-7" strokeWidth={2.1} />
        </div>
        <span className="hidden min-[1100px]:inline">Mi carrito</span>
      </button>

      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        <div
          onClick={() => setIsOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-md border-l border-[#e2e8f0] bg-white text-[#1a1a2e] shadow-2xl transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Carrito de compras"
        >
          <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#64748b]">Tu compra</p>
                <h2 className="text-xl font-extrabold tracking-tight text-[#1a1a2e]">Mi carrito</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-[#e2e8f0] p-2 text-[#64748b] transition-colors hover:border-[#e4077d] hover:text-[#e4077d]"
                aria-label="Cerrar carrito"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="mt-10 rounded-2xl border border-dashed border-[#e2e8f0] bg-[#f8fafb] p-6 text-center">
                  <p className="text-base font-semibold text-[#1a1a2e]">Tu carrito está vacío</p>
                  <p className="mt-2 text-sm text-[#64748b]">Agregá productos para comenzar tu compra.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={item.slug}
                      className="grid grid-cols-[78px_1fr] items-stretch gap-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafb] p-3"
                    >
                      <div className="relative flex h-full min-h-[108px] items-center justify-center overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
                        {item.imageSrc ? (
                          <Image
                            src={item.imageSrc}
                            alt={item.name}
                            fill
                            className="object-contain p-1.5"
                            sizes="78px"
                          />
                        ) : (
                          <PawIcon className="h-10 w-10 text-[#029f9c]" />
                        )}
                      </div>

                      <div className="grid min-h-[108px] grid-rows-[auto_auto_1fr]">
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            href={`/productos/${item.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="text-sm font-bold leading-tight text-[#1a1a2e] hover:text-[#029f9c]"
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.slug)}
                            className="rounded-md p-1.5 text-[#94a3b8] transition-colors hover:bg-white hover:text-[#e4077d]"
                            aria-label={`Quitar ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <p className="mt-0.5 text-xs text-[#64748b]">{formatArs(item.price)} por unidad</p>

                        <div className="mt-3 flex items-end justify-between">
                          <div className="flex items-center rounded-lg border border-[#e2e8f0] bg-white">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.slug, -1)}
                              className="px-3 py-1.5 text-lg text-[#64748b]"
                              aria-label={`Quitar una unidad de ${item.name}`}
                            >
                              -
                            </button>
                            <span className="min-w-10 px-3 py-1.5 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.slug, 1)}
                              className="px-3 py-1.5 text-lg text-[#64748b]"
                              aria-label={`Agregar una unidad de ${item.name}`}
                            >
                              +
                            </button>
                          </div>
                          <p className="text-base font-extrabold text-[#1a1a2e]">
                            {formatArs(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <footer className="border-t border-[#e2e8f0] bg-white p-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-[#64748b]">{totalQuantity} {totalQuantity === 1 ? "producto" : "productos"}</span>
                <span className="text-xl font-extrabold text-[#1a1a2e]">{formatArs(subtotal)}</span>
              </div>
              {cashSaving > 0 ? (
                <p className="mb-3 text-xs font-medium text-[#017d7a]">
                  Ahorrás hasta {formatArs(cashSaving)} pagando en efectivo.
                </p>
              ) : null}
              <p className="mb-4 text-xs text-[#64748b]">
                El costo de envío e impuestos se calculará al finalizar la compra.
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/checkout");
                  }}
                  className="w-full rounded-xl bg-[#f97316] px-4 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-[#ea580c]"
                >
                  Finalizar compra
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#1a1a2e] transition-colors hover:border-[#029f9c] hover:text-[#029f9c]"
                >
                  Seguir comprando
                </button>
              </div>
            </footer>
          </div>
        </aside>
      </div>
    </>
  );
}
