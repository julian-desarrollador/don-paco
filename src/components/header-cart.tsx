"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import PawIcon from "@/components/paw-icon";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/body-scroll-lock";
import { formatArs } from "@/lib/products";

export default function HeaderCart() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, totalQuantity, subtotal, updateQuantity, removeItem } = useCart();
  const router = useRouter();

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
        className="relative text-xs font-semibold transition-opacity hover:opacity-90"
      >
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e4077d] px-1.5 text-[11px] font-black text-white">
          {totalQuantity}
        </span>
        <div className="mx-auto mb-0.5 flex h-8 w-8 items-center justify-center md:mb-1 md:h-9 md:w-9">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-7 w-7 md:h-8 md:w-8">
            <circle cx="9" cy="20" r="1.4" />
            <circle cx="18" cy="20" r="1.4" />
            <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H7" />
          </svg>
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
          className={`absolute right-0 top-0 h-full w-full max-w-md border-l border-[#d8d8d8] bg-white text-[#3f3f3f] shadow-2xl transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Carrito de compras"
        >
          <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b border-[#ededed] px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#9a9a9a]">Tu compra</p>
                <h2 className="text-xl font-black uppercase tracking-wide text-[#029f9c]">Mi carrito</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-[#dcdcdc] p-2 text-[#666] transition-colors hover:border-[#e4077d] hover:text-[#e4077d]"
                aria-label="Cerrar carrito"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="mt-10 rounded-xl border border-dashed border-[#d8d8d8] bg-[#fafafa] p-6 text-center">
                  <p className="text-base font-semibold text-[#666]">Tu carrito esta vacio</p>
                  <p className="mt-2 text-sm text-[#8a8a8a]">Agrega productos para comenzar tu compra.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={item.slug}
                      className="grid grid-cols-[78px_1fr] items-stretch gap-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3"
                    >
                      <div className="relative flex h-full min-h-[108px] items-center justify-center overflow-hidden rounded-lg border border-[#dfdfdf] bg-white">
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
                            className="text-sm font-extrabold uppercase leading-tight text-[#666] hover:text-[#029f9c]"
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.slug)}
                            className="rounded-md p-1.5 text-[#b0b0b0] transition-colors hover:bg-[#f1f1f1] hover:text-[#e4077d]"
                            aria-label={`Quitar ${item.name}`}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6M14 11v6" />
                            </svg>
                          </button>
                        </div>

                        <p className="mt-0.5 text-xs text-[#8a8a8a]">{formatArs(item.price)} por unidad</p>

                        <div className="mt-3 flex items-end justify-between">
                          <div className="flex items-center rounded-md border border-[#d8d8d8] bg-white">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.slug, -1)}
                              className="px-3 py-1.5 text-lg text-[#7a7a7a]"
                              aria-label={`Quitar una unidad de ${item.name}`}
                            >
                              -
                            </button>
                            <span className="min-w-10 px-3 py-1.5 text-center text-sm font-semibold text-[#4f4f4f]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.slug, 1)}
                              className="px-3 py-1.5 text-lg text-[#7a7a7a]"
                              aria-label={`Agregar una unidad de ${item.name}`}
                            >
                              +
                            </button>
                          </div>
                          <p className="text-base font-black text-[#029f9c]">
                            {formatArs(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <footer className="border-t border-[#ededed] bg-white p-5">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="font-semibold text-[#777]">Subtotal</span>
                <span className="text-xl font-black text-[#029f9c]">{formatArs(subtotal)}</span>
              </div>
              <p className="mb-4 text-xs text-[#8a8a8a]">
                El costo de envio e impuestos se calculara al finalizar la compra.
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/checkout");
                  }}
                  className="w-full rounded-md bg-[#029f9c] px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#028886]"
                >
                  Finalizar compra
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full rounded-md border border-[#e4077d] px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#e4077d] transition-colors hover:bg-[#e4077d] hover:text-white"
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
