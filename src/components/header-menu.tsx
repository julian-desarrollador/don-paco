"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { navRoot, type NavNode } from "@/lib/category-tree";

function categoryBranchChildren(sectionTitle: string): readonly NavNode[] {
  const hit = navRoot.find((n): n is Extract<NavNode, { kind: "branch" }> => n.kind === "branch" && n.label === sectionTitle);
  return hit?.children ?? [];
}

function nestedBranch(parentTitle: string, childTitle: string): readonly NavNode[] {
  const parent = categoryBranchChildren(parentTitle);
  const hit = parent.find((n): n is Extract<NavNode, { kind: "branch" }> => n.kind === "branch" && n.label === childTitle);
  return hit?.children ?? [];
}

function MenuNavTree({
  nodes,
  depth,
  variant,
  onNavigate,
}: {
  nodes: readonly NavNode[];
  depth: number;
  variant: "mobile" | "desktop";
  onNavigate?: () => void;
}) {
  const isMobile = variant === "mobile";
  const ulClass = isMobile
    ? depth === 0
      ? "space-y-0.5"
      : "ml-2 mt-0.5 space-y-0.5 border-l border-white/30 pl-2.5"
    : depth === 0
      ? "space-y-0.5 p-1"
      : "ml-2 mt-0.5 space-y-0.5 border-l border-[#e8e8e8] pl-2.5";

  const branchClass = isMobile
    ? "mb-0.5 px-2 pt-1.5 text-[11px] font-black uppercase tracking-wider text-white/55"
    : "mb-0.5 px-2 pt-1.5 text-[11px] font-bold uppercase tracking-wide text-[#64748b]";

  const leafClass = isMobile
    ? "block rounded-md px-2 py-1.5 text-left text-[14px] leading-snug text-white/90 transition-colors hover:bg-white/10 hover:text-white"
    : "block rounded-md px-3 py-2 text-left text-[13px] font-medium leading-snug text-[#334155] transition-colors hover:bg-[#f8fafb] hover:text-[#029f9c]";

  return (
    <ul className={ulClass}>
      {nodes.map((node, idx) =>
        node.kind === "leaf" ? (
          <li key={node.id}>
            <Link href={`/?categoria=${node.id}`} onClick={onNavigate} className={leafClass}>
              {node.label}
            </Link>
          </li>
        ) : (
          <li key={`${node.label}-${idx}`}>
            <p className={branchClass}>{node.label}</p>
            <MenuNavTree nodes={node.children} depth={depth + 1} variant={variant} onNavigate={onNavigate} />
          </li>
        ),
      )}
    </ul>
  );
}

type MenuItem = {
  label: string;
  href?: string;
  tree?: readonly NavNode[];
};

const menuItems: MenuItem[] = [
  { label: "Perros", tree: nestedBranch("Por mascota", "Perros") },
  { label: "Gatos", tree: nestedBranch("Por mascota", "Gatos") },
  { label: "Categorías generales", tree: categoryBranchChildren("Categorías generales") },
  { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
  { label: "Contacto", href: "#contacto" },
];

type HeaderMenuProps = {
  isMobileOpen: boolean;
  onRequestClose: () => void;
};

export default function HeaderMenu({ isMobileOpen, onRequestClose }: HeaderMenuProps) {
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);

  useEffect(() => {
    if (!isMobileOpen) {
      setExpandedMobileItem(null);
    }
  }, [isMobileOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 md:hidden ${
          isMobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isMobileOpen}
      >
        <button
          type="button"
          aria-label="Cerrar menu"
          onClick={onRequestClose}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            isMobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          id="mobile-main-menu"
          className={`absolute left-0 top-0 h-full w-[min(100%,22rem)] bg-[#029f9c] text-white shadow-2xl transition-transform duration-300 ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal"
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-white/20 px-4 py-4">
              <p className="text-lg font-extrabold tracking-wide">Menú</p>
              <button
                type="button"
                onClick={onRequestClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"
                aria-label="Cerrar menu"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <form role="search" className="mb-4" action="/" method="get" onSubmit={onRequestClose}>
                <label htmlFor="mobile-search-products" className="sr-only">
                  Buscar producto
                </label>
                <div className="flex items-center overflow-hidden rounded-full bg-white">
                  <input
                    id="mobile-search-products"
                    name="q"
                    type="search"
                    placeholder="¿Qué estás buscando?"
                    className="w-full px-4 py-2.5 text-sm text-[#1a1a2e] outline-none placeholder:text-[#94a3b8]"
                  />
                  <button type="submit" aria-label="Buscar" className="px-3 py-2.5 text-[#029f9c]">
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </form>

              <div className="space-y-1">
                {menuItems.map((item) => (
                  <div key={item.label}>
                    {item.tree ? (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMobileItem((prev) => (prev === item.label ? null : item.label))
                        }
                        className="flex w-full items-center justify-between rounded-md px-2.5 py-3 text-left text-base font-medium text-white/95 transition-colors hover:bg-white/10"
                        aria-expanded={expandedMobileItem === item.label}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${expandedMobileItem === item.label ? "rotate-180" : ""}`}
                        />
                      </button>
                    ) : item.href?.startsWith("/") ? (
                      <Link
                        href={item.href}
                        onClick={onRequestClose}
                        className="flex items-center justify-between rounded-md px-2.5 py-3 text-base font-medium text-white/95 transition-colors hover:bg-white/10"
                      >
                        <span>{item.label}</span>
                      </Link>
                    ) : (
                      <a
                        href={item.href ?? "#"}
                        onClick={onRequestClose}
                        className="flex items-center justify-between rounded-md px-2.5 py-3 text-base font-medium text-white/95 transition-colors hover:bg-white/10"
                      >
                        <span>{item.label}</span>
                      </a>
                    )}

                    {item.tree && expandedMobileItem === item.label ? (
                      <div className="mb-1 ml-3 max-h-[55vh] overflow-y-auto border-l border-white/25 pl-3">
                        <MenuNavTree nodes={item.tree} depth={0} variant="mobile" onNavigate={onRequestClose} />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <nav className="relative z-40 bg-[#029f9c]">
        <div className="mx-auto w-full max-w-[1440px] px-3 md:px-6">
          <div className="hidden no-scrollbar overflow-x-auto md:block">
            <div className="flex min-w-max items-center gap-x-8 py-2.5 text-[15px] font-semibold text-white">
              {menuItems.map((item) => (
                <div key={item.label} className="group/menu relative">
                  {item.href?.startsWith("/") && !item.tree ? (
                    <Link href={item.href} className="inline-flex items-center gap-1 py-1 transition-colors hover:text-white/80">
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href ?? "#"}
                      className="inline-flex items-center gap-1 py-1 transition-colors hover:text-white/80"
                    >
                      {item.label}
                      {item.tree ? <ChevronDown className="h-3.5 w-3.5" /> : null}
                    </a>
                  )}

                  {item.tree ? (
                    <div className="invisible absolute left-0 top-full z-20 pt-2 opacity-0 transition-all group-hover/menu:visible group-hover/menu:opacity-100">
                      <div className="max-h-[70vh] w-[min(100vw-2rem,22rem)] overflow-y-auto rounded-2xl border border-[#e2e8f0] bg-white py-2 shadow-xl">
                        <MenuNavTree nodes={item.tree} depth={0} variant="desktop" />
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
