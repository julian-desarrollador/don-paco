"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HelpCircle, MapPin, Menu, PawPrint, Search, X } from "lucide-react";
import HeaderCart from "@/components/header-cart";
import HeaderMenu from "@/components/header-menu";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/body-scroll-lock";

function SearchField({ id, className }: { id: string; className?: string }) {
  return (
    <form className={className} role="search" action="/" method="get">
      <label htmlFor={id} className="sr-only">
        Buscar producto
      </label>
      <div className="flex items-center overflow-hidden rounded-full border border-[#e2e8f0] bg-[#f8fafb] shadow-sm focus-within:border-[#029f9c] focus-within:ring-2 focus-within:ring-[#029f9c]/20">
        <input
          id={id}
          name="q"
          type="search"
          placeholder="¿Qué estás buscando?"
          className="w-full bg-transparent px-5 py-2.5 text-sm text-[#1a1a2e] outline-none placeholder:text-[#94a3b8] md:py-3"
        />
        <button type="submit" aria-label="Buscar" className="mr-1 rounded-full bg-[#029f9c] p-2.5 text-white hover:bg-[#017d7a]">
          <Search className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

export default function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateViewport = () => setIsDesktopViewport(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      lockBodyScroll();
    }

    return () => {
      if (isMobileMenuOpen) {
        unlockBodyScroll();
      }
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-30 shadow-sm">
      <div className="hidden bg-[#1a1a2e] text-white md:block">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 py-1.5 text-xs">
          <p className="inline-flex items-center gap-1.5 font-medium text-white/80">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Roca 473, Gral. Fernández Oro — RN
          </p>
          <p className="text-center font-semibold tracking-wide">10% off en efectivo · 5% por transferencia</p>
          <div className="flex items-center justify-end gap-3">
            <a href="#" className="inline-flex items-center gap-1 opacity-90 hover:opacity-100" aria-label="Instagram">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                <path d="M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3Zm0 7.8A3.1 3.1 0 1 1 12 8.9a3.1 3.1 0 0 1 0 6.2Zm6-7.9a1.1 1.1 0 1 1-2.1 0 1.1 1.1 0 0 1 2.1 0Z" />
                <path d="M12 2.2h4.1c3.2 0 5.7 2.5 5.7 5.7V16c0 3.2-2.5 5.7-5.7 5.7H7.9A5.7 5.7 0 0 1 2.2 16V7.9c0-3.2 2.5-5.7 5.7-5.7H12Zm0 1.6H7.9a4.1 4.1 0 0 0-4.1 4.1V16A4.1 4.1 0 0 0 7.9 20h8.2a4.1 4.1 0 0 0 4.1-4.1V7.9a4.1 4.1 0 0 0-4.1-4.1H12Z" />
              </svg>
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-3 py-3 md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-6 md:px-6">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e2e8f0] text-[#1a1a2e] md:hidden"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-main-menu"
            aria-label="Abrir o cerrar menú"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="inline-flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f7f6] text-[#029f9c] md:h-11 md:w-11">
              <PawPrint className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-[#1a1a2e]">Don Paco</span>
          </Link>

          {!isDesktopViewport ? (
            <div className="md:hidden">
              <HeaderCart variant="light" />
            </div>
          ) : null}

          <SearchField id="search-products" className="order-last hidden w-full md:order-none md:block" />

          <div className="hidden items-center gap-5 md:flex">
            <Link href="/preguntas-frecuentes" className="hidden text-center text-xs font-semibold text-[#1a1a2e] lg:block">
              <HelpCircle className="mx-auto mb-0.5 h-6 w-6 text-[#029f9c]" />
              Ayuda
            </Link>
            {isDesktopViewport ? <HeaderCart variant="light" /> : null}
          </div>
        </div>
        <div className="px-3 pb-3 md:hidden">
          <SearchField id="search-products-mobile-bar" />
        </div>
      </div>

      <HeaderMenu isMobileOpen={isMobileMenuOpen} onRequestClose={() => setIsMobileMenuOpen(false)} />
    </header>
  );
}
