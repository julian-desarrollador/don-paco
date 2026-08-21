"use client";

import type { Product } from "@prisma/client";
import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ProductsTable } from "@/app/admin/products/products-table";
import { Input } from "@/components/ui/input";
import type { AdminGroupRow } from "@/lib/admin-catalog-groups";
import { adminGroupMatchesSearch, prismaProductMatchesSearch } from "@/lib/admin-products-search";

type Props = {
  groups: AdminGroupRow[];
  products: Product[];
  orphanRows: Product[];
};

export function AdminProductsCatalog({ groups, products, orphanRows }: Props) {
  const [q, setQ] = useState("");

  const query = q.trim();
  const filteredGroups = useMemo(
    () => (query ? groups.filter((g) => adminGroupMatchesSearch(g, query, products)) : groups),
    [groups, products, query],
  );
  const filteredOrphans = useMemo(
    () => (query ? orphanRows.filter((p) => prismaProductMatchesSearch(p, query)) : orphanRows),
    [orphanRows, query],
  );
  const filteredProducts = useMemo(
    () => (query ? products.filter((p) => prismaProductMatchesSearch(p, query)) : products),
    [products, query],
  );

  return (
    <>
      <div className="rounded-2xl border border-[#e4e4e7] bg-white p-4 shadow-sm">
        <label htmlFor="admin-catalog-search" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#71717a]">
          Buscar en grupos y productos
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a1a1aa]"
            aria-hidden
          />
          <Input
            id="admin-catalog-search"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Buscar…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-11 min-h-[44px] rounded-xl border-[#e4e4e7] pl-11 pr-24 text-base sm:text-sm"
          />
          {query ? (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#71717a] hover:bg-[#f4f4f5] hover:text-[#029f9c]"
              onClick={() => setQ("")}
            >
              Limpiar
            </button>
          ) : null}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#71717a]">
          Grupos ({filteredGroups.length}
          {query && groups.length !== filteredGroups.length ? ` / ${groups.length}` : ""})
        </h2>
        {filteredGroups.length === 0 && query ? (
          <p className="rounded-xl border border-dashed border-[#e4e4e7] bg-[#fafafa] px-4 py-6 text-sm text-[#71717a]">
            Ningún grupo coincide con «{query}».
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#e4e4e7] bg-white shadow-sm">
            <div className="hidden grid-cols-[1fr_4.5rem_4.5rem] border-b border-[#e4e4e7] bg-[#fafafa] px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#71717a] sm:grid">
              <span>Nombre</span>
              <span className="text-center">Productos</span>
              <span className="text-right"> </span>
            </div>
            <ul>
              {filteredGroups.map((g) => (
                <li
                  key={g.slug}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 border-b border-[#f4f4f5] px-4 py-3 last:border-0 sm:grid-cols-[1fr_4.5rem_4.5rem]"
                >
                  <Link
                    href={`/admin/products/groups/${encodeURIComponent(g.slug)}`}
                    className="min-w-0 text-[15px] font-semibold leading-snug text-[#029f9c] underline-offset-2 hover:underline"
                  >
                    {g.displayName}
                  </Link>
                  <span className="hidden text-center text-sm text-[#71717a] sm:block">{g.variantCount}</span>
                  <span className="row-start-2 text-xs text-[#71717a] sm:hidden">
                    {g.variantCount === 1 ? "1 producto" : `${g.variantCount} productos`}
                  </span>
                  <Link
                    href={`/admin/products/groups/${encodeURIComponent(g.slug)}`}
                    className="col-start-2 row-span-2 shrink-0 self-center rounded-lg px-2.5 py-2 text-sm font-semibold text-[#029f9c] hover:bg-[#f0faf9] hover:underline sm:col-start-3 sm:row-span-1 sm:justify-self-end"
                  >
                    Abrir
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {orphanRows.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#71717a]">
            Sin grupo ({filteredOrphans.length}
            {query && orphanRows.length !== filteredOrphans.length ? ` / ${orphanRows.length}` : ""})
          </h2>
          {filteredOrphans.length === 0 && query ? (
            <p className="text-sm text-[#a1a1aa]">Ningún producto suelto coincide con la búsqueda.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {filteredOrphans.slice(0, 24).map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="inline-flex rounded-lg border border-[#e4e4e7] bg-white px-3 py-1.5 text-sm font-medium text-[#3f3f46] hover:border-[#029f9c]/40 hover:text-[#029f9c]"
                  >
                    {p.nombre || p.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {filteredOrphans.length > 24 ? (
            <p className="text-xs text-[#a1a1aa]">Y {filteredOrphans.length - 24} más en la tabla general.</p>
          ) : null}
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#71717a]">
          Todos los productos ({filteredProducts.length}
          {query && products.length !== filteredProducts.length ? ` / ${products.length}` : ""})
        </h2>
        <ProductsTable products={filteredProducts} embeddedSearch />
      </section>
    </>
  );
}
