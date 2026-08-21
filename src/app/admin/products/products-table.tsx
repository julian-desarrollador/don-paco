"use client";

import type { Product } from "@prisma/client";
import { AlertTriangle, Eye, EyeOff, Package, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { deleteProduct, setProductVisible } from "@/actions/product";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import { CategoryFilterPicker } from "@/components/admin/category-filter-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categoryBadgeLabel, type CategoryId } from "@/lib/category-tree";
import { formatArs } from "@/lib/product-format";
import { productImageBySlug } from "@/lib/product-image-maps";
import { precioTarjetaDesdeLista } from "@/lib/pricing";
import { cn } from "@/lib/utils";

function thumbSrc(p: Product): string | null {
  const fromDb = p.images?.find((u) => u?.trim())?.trim();
  if (fromDb) return fromDb;
  return productImageBySlug[p.slug] ?? null;
}

function productMatchesQuery(p: Product, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase();
  return (
    p.name.toLowerCase().includes(n) ||
    p.marca.toLowerCase().includes(n) ||
    p.nombre.toLowerCase().includes(n) ||
    p.slug.toLowerCase().includes(n)
  );
}

export function ProductsTable({
  products,
  embeddedSearch = false,
}: {
  products: Product[];
  /** Si true, oculta el buscador de texto (p. ej. búsqueda global arriba en /admin/products). */
  embeddedSearch?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const filtered = useMemo(() => {
    let rows = products;
    if (categoryId) {
      rows = rows.filter((p) => p.categoryId === categoryId);
    }
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((p) => productMatchesQuery(p, q));
  }, [products, query, categoryId]);

  async function onToggleVisible(p: Product) {
    const visible = (p as Product & { activo?: boolean }).activo !== false;
    setBusyId(p.id);
    try {
      await setProductVisible(p.id, !visible);
      toast.success(!visible ? "Se muestra en la página" : "Ya no se muestra en la página");
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar");
    } finally {
      setBusyId(null);
    }
  }

  async function onConfirmDelete() {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    try {
      await deleteProduct(confirmDelete.id);
      toast.success("Producto eliminado");
      setConfirmDelete(null);
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#e4e4e7] bg-white p-4 shadow-sm">
        <div className={`flex flex-col gap-3 ${embeddedSearch ? "" : "sm:flex-row sm:items-end"}`}>
          {!embeddedSearch ? (
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="admin-product-search" className="text-xs font-semibold uppercase tracking-wide text-[#71717a]">
                Buscar
              </Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1a1aa]"
                  aria-hidden
                />
                <Input
                  id="admin-product-search"
                  type="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  placeholder="Buscar…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-11 min-h-[44px] rounded-xl border-[#e4e4e7] pl-10 text-base sm:text-sm"
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#71717a]">Filtrá por categoría.</p>
          )}
          <div className="w-full sm:max-w-[min(100%,320px)]">
            <CategoryFilterPicker value={categoryId} onChange={setCategoryId} />
          </div>
        </div>
        <p className="mt-3 text-xs text-[#71717a]">
          Mostrando <span className="font-semibold text-[#18181b]">{filtered.length}</span>
          {products.length !== filtered.length ? (
            <>
              {" "}
              de <span className="font-semibold text-[#18181b]">{products.length}</span>
            </>
          ) : null}
        </p>
      </div>

      {/* Lista: tarjetas mobile-first; rejilla en pantallas grandes */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e4e4e7] bg-white px-6 py-16 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-[#d4d4d8]" aria-hidden />
          <p className="text-sm font-medium text-[#52525b]">No hay productos cargados</p>
          <p className="mt-1 text-xs text-[#a1a1aa]">Creá uno nuevo con el botón de arriba.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#fde68a] bg-[#fffbeb] px-6 py-12 text-center">
          <p className="text-sm font-semibold text-[#92400e]">No encontramos productos con estos criterios</p>
          <p className="mt-1 text-xs text-[#b45309]">Probá otras palabras o elegí &quot;Todas las categorías&quot;.</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 rounded-xl"
            onClick={() => {
              setQuery("");
              setCategoryId("");
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:gap-4">
          {filtered.map((p) => {
            const thumb = thumbSrc(p);
            const price = formatArs(precioTarjetaDesdeLista(p.lista));
            const catLabel = categoryBadgeLabel(p.categoryId as CategoryId);
            const visible = (p as Product & { activo?: boolean }).activo !== false;
            const lowStock = p.stock <= 2;

            return (
              <li
                key={p.id}
                className={cn(
                  "rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
                  visible ? "border-[#e4e4e7]" : "border-[#eadfce] opacity-90",
                )}
              >
                <div className="flex gap-4">
                  <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-[#f4f4f5] ring-1 ring-black/5">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt=""
                        fill
                        sizes="88px"
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#d4d4d8]">
                        <Package className="h-8 w-8" aria-hidden />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#029f9c]">{catLabel}</p>
                    <div className="mt-0.5 flex flex-wrap items-start justify-between gap-2">
                      <h2 className="line-clamp-2 min-w-0 flex-1 text-base font-bold leading-snug sm:text-[15px]">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="text-[#18181b] decoration-[#029f9c]/40 underline-offset-2 transition-colors hover:text-[#029f9c] hover:underline focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#029f9c]"
                        >
                          {p.name}
                        </Link>
                      </h2>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                          visible ? "bg-[#e7f6f5] text-[#027a78]" : "bg-[#f4f1ea] text-[#7e6b48]",
                        )}
                      >
                        {visible ? "Publicado" : "Oculto"}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <p className="text-lg font-black text-[#18181b]">{price}</p>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          lowStock ? "bg-amber-100 text-amber-900" : "bg-[#f4f4f5] text-[#52525b]",
                        )}
                      >
                        {lowStock ? <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
                        Stock {p.stock}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <Button
                    asChild
                    className="h-11 min-h-[44px] w-full rounded-xl bg-[#029f9c] font-semibold text-white hover:bg-[#027a78] sm:w-auto sm:min-w-[120px]"
                  >
                    <Link href={`/admin/products/${p.id}/edit`}>Editar</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busyId === p.id}
                    className="h-11 min-h-[44px] w-full rounded-xl sm:h-10 sm:w-auto"
                    onClick={() => void onToggleVisible(p)}
                  >
                    {visible ? (
                      <>
                        <EyeOff className="mr-1.5 h-4 w-4" />
                        Dejar de mostrar
                      </>
                    ) : (
                      <>
                        <Eye className="mr-1.5 h-4 w-4" />
                        Mostrar en la página
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 min-h-[44px] w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 sm:h-10 sm:w-auto sm:min-w-[44px] sm:px-3"
                    aria-label={`Eliminar ${p.name}`}
                    onClick={() => setConfirmDelete({ id: p.id, name: p.name })}
                  >
                    <Trash2 className="h-4 w-4 sm:mr-0" />
                    <span className="sm:sr-only">Eliminar</span>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AdminConfirmModal
        open={Boolean(confirmDelete)}
        title="¿Estás segura de eliminar este producto?"
        description={
          confirmDelete
            ? `Se va a borrar “${confirmDelete.name}”. Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Sí, eliminar"
        busy={deletingId !== null}
        onCancel={() => {
          if (deletingId) return;
          setConfirmDelete(null);
        }}
        onConfirm={() => void onConfirmDelete()}
      />
    </div>
  );
}
