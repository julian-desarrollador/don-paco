import "server-only";

import fs from "node:fs";
import path from "node:path";

import type { Product as PrismaProductRow } from "@prisma/client";

import { getCatalogRows } from "@/lib/catalog-rows";
import type { CatalogRow } from "@/lib/catalog-types";
import { categoryBadgeLabel, isCategoryId, type CategoryId } from "@/lib/category-tree";
import { CATALOGO_NO_PUBLICADO } from "@/lib/catalogo-reserva";
import { formatArs } from "@/lib/product-format";
import { productGroupImageByGroupSlug, productImageBySlug } from "@/lib/product-image-maps";
import { loadGroupDisplayOverlayMap, type GroupDisplayOverlay } from "@/lib/product-group-display-overlays";
import { loadMergedGroupDefinitions } from "@/lib/product-group-merge";
import { resolveProductGroupSlug } from "@/lib/product-group-slug";
import type { ProductGroupDefinition } from "@/lib/product-groups";
import { getProductGroupDefinition, listGroupSlugs } from "@/lib/product-groups";
import type { ListingEntry, Product } from "@/lib/product-types";
import { loadProductActivoById, resolveProductActivo } from "@/lib/product-activo";
import { prisma } from "@/lib/prisma";
import { precioEfectivoTransfer, precioTarjetaDesdeLista } from "@/lib/pricing";

void CATALOGO_NO_PUBLICADO;

function isRemoteImageUrl(u: string): boolean {
  return /^https?:\/\//i.test(u.trim());
}

/** Prioriza URLs remotas (p. ej. Cloudinary) sobre rutas bajo `public/` y sobre el mapa estático. */
function pickPrimaryImageFromUrls(images: string[] | null | undefined, slug: string): string | undefined {
  const cleaned = images?.map((u) => u?.trim()).filter((u): u is string => Boolean(u)) ?? [];
  const remote = cleaned.find(isRemoteImageUrl);
  if (remote) return remote;
  if (cleaned.length > 0) return cleaned[0];
  return productImageBySlug[slug];
}

/**
 * Ficha de grupo: primero imagen guardada en el panel (`heroImageUrl`), luego variantes (remotas),
 * mapa estático `productGroupImageByGroupSlug`, por último primera imagen de variante.
 */
function pickGroupHeroImage(
  groupSlug: string,
  variants: Product[],
  overlayHeroUrl?: string | null,
): string | undefined {
  const fromDb = overlayHeroUrl?.trim();
  if (fromDb) return fromDb;
  const urls = variants.map((v) => v.imageSrc).filter((u): u is string => Boolean(u));
  const remote = urls.find(isRemoteImageUrl);
  if (remote) return remote;
  const mapped = productGroupImageByGroupSlug[groupSlug];
  if (mapped) return mapped;
  return urls[0];
}

const catalogPath = path.join(process.cwd(), "data", "catalog.json");

function catalogMtimeMs(): number {
  try {
    return fs.statSync(catalogPath).mtimeMs;
  } catch {
    return 0;
  }
}

let productsJsonCache: { mtimeMs: number; list: Product[] } | null = null;

function buildDescriptionFromLista(row: { lista: number; cash: number | null }) {
  const comunTxt = formatArs(row.lista);
  const tarjetaTxt = formatArs(precioTarjetaDesdeLista(row.lista));
  const efectivoTxt = formatArs(precioEfectivoTransfer(row.lista, row.cash));
  return `Precio común (referencia efectivo/transferencia): ${comunTxt}. Con tarjeta (+10% sobre ese precio): ${tarjetaTxt}. Efectivo o transferencia según ficha: ${efectivoTxt}. Consultá promociones 2x1 en latas y pouches según disponibilidad en el local.`;
}

function mapCatalogRowToProduct(row: CatalogRow): Product {
  const manualImg = row.imageSrc?.trim();
  const imageSrc = manualImg || productImageBySlug[row.slug];
  const desc = row.descripcion?.trim();
  return {
    slug: row.slug,
    name: `${row.marca} — ${row.nombre}`.trim(),
    brand: row.marca,
    precioLista: row.lista,
    price: precioTarjetaDesdeLista(row.lista),
    cashPrice: precioEfectivoTransfer(row.lista, row.cash),
    categoryId: row.categoryId,
    category: categoryBadgeLabel(row.categoryId),
    shortDescription: `${formatArs(precioTarjetaDesdeLista(row.lista))} con tarjeta · ${row.marca}`,
    description: desc || buildDescriptionFromLista(row),
    colors: [],
    sizes: [],
    stock: 5,
    imageSrc: imageSrc || undefined,
    destacado: row.destacado === true,
  };
}

function getProductsFromCatalogJson(): Product[] {
  const mtimeMs = catalogMtimeMs();
  if (productsJsonCache && productsJsonCache.mtimeMs === mtimeMs) {
    return productsJsonCache.list;
  }
  const rows = getCatalogRows();
  const list = rows.map(mapCatalogRowToProduct);
  productsJsonCache = { mtimeMs, list };
  return list;
}

export function invalidateCatalogJsonProductCache() {
  productsJsonCache = null;
}

function mapPrismaRowToProduct(row: PrismaProductRow): Product {
  const r = row as PrismaProductRow & { groupSlug?: string | null };
  const categoryId = (isCategoryId(r.categoryId) ? r.categoryId : "mascota-perro-alimento-seco") as CategoryId;
  const imageSrc = pickPrimaryImageFromUrls(r.images ?? undefined, r.slug);
  const cash = r.cash ?? null;
  const desc = r.description?.trim();
  return {
    slug: r.slug,
    name: r.name,
    groupSlug: r.groupSlug ?? null,
    brand: r.marca,
    precioLista: r.lista,
    price: precioTarjetaDesdeLista(r.lista),
    cashPrice: precioEfectivoTransfer(r.lista, cash),
    categoryId,
    category: categoryBadgeLabel(categoryId),
    shortDescription: desc
      ? desc.slice(0, 120)
      : `${formatArs(precioTarjetaDesdeLista(r.lista))} con tarjeta · ${r.marca}`,
    description: desc || buildDescriptionFromLista({ lista: r.lista, cash }),
    colors: [],
    sizes: [],
    stock: r.stock,
    imageSrc: imageSrc || undefined,
    destacado: r.destacado,
    activo: (r as PrismaProductRow & { activo?: boolean }).activo !== false,
  };
}

async function loadProducts(includeHidden = false): Promise<Product[]> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return getProductsFromCatalogJson();
  try {
    const count = await prisma.product.count();
    if (count === 0) return getProductsFromCatalogJson();
    const rows = await prisma.product.findMany({ orderBy: { slug: "asc" } });
    const needsFlags = rows.some((r) => typeof (r as { activo?: boolean }).activo !== "boolean");
    const flags = needsFlags ? await loadProductActivoById() : new Map<string, boolean>();
    const mapped = rows.map((row) => {
      const activo = resolveProductActivo(row as { id: string; activo?: boolean }, flags);
      return mapPrismaRowToProduct({ ...(row as object), activo } as PrismaProductRow);
    });
    if (includeHidden) return mapped;
    return mapped.filter((p) => p.activo !== false);
  } catch {
    return getProductsFromCatalogJson();
  }
}

export async function getProducts(opts?: { includeHidden?: boolean }): Promise<Product[]> {
  return loadProducts(opts?.includeHidden === true);
}

export async function getProductBySlug(slug: string) {
  return (await getProducts()).find((product) => product.slug === slug);
}

export async function listAllProductPageSlugs(): Promise<string[]> {
  const slugs = new Set<string>();
  const products = await getProducts();
  for (const p of products) {
    slugs.add(p.slug);
    const g = resolveProductGroupSlug(p);
    if (g) slugs.add(g);
  }
  for (const g of listGroupSlugs()) {
    slugs.add(g);
  }
  if (process.env.DATABASE_URL?.trim()) {
    try {
      const [groupRows, redirects] = await Promise.all([
        prisma.productGroup.findMany({ select: { slug: true } }),
        prisma.groupSlugRedirect.findMany({ select: { fromSlug: true } }),
      ]);
      for (const r of groupRows) slugs.add(r.slug);
      for (const r of redirects) slugs.add(r.fromSlug);
    } catch {
      /* ignore */
    }
  }
  return [...slugs];
}

function orderGroupVariants(_groupSlug: string, members: Product[], def: ProductGroupDefinition): Product[] {
  const bySlug = new Map(members.map((v) => [v.slug, v]));
  const ordered: Product[] = [];
  for (const s of def.variantSlugs) {
    const v = bySlug.get(s);
    if (v) ordered.push(v);
  }
  for (const v of members) {
    if (!ordered.some((o) => o.slug === v.slug)) ordered.push(v);
  }
  return ordered;
}

function buildListingFromProducts(
  products: Product[],
  overlays: Map<string, GroupDisplayOverlay>,
  mergedDefs: Map<string, ProductGroupDefinition>,
): ListingEntry[] {
  const groupOrder: string[] = [];
  const byGroup = new Map<string, Product[]>();
  const standalone: Product[] = [];

  for (const p of products) {
    const gSlug = resolveProductGroupSlug(p);
    const def = gSlug ? mergedDefs.get(gSlug) : undefined;
    if (gSlug && def) {
      if (!byGroup.has(gSlug)) groupOrder.push(gSlug);
      const arr = byGroup.get(gSlug) ?? [];
      arr.push(p);
      byGroup.set(gSlug, arr);
    } else {
      standalone.push(p);
    }
  }

  const out: ListingEntry[] = [];

  for (const gSlug of groupOrder) {
    const def = mergedDefs.get(gSlug);
    if (!def) continue;
    const rawMembers = byGroup.get(gSlug) ?? [];
    const variants = orderGroupVariants(gSlug, rawMembers, def);
    if (variants.length === 0) continue;
    const fromPrice = Math.min(...variants.map((v) => v.price));
    const fromCashPrice = Math.min(...variants.map((v) => v.cashPrice));
    const ov = overlays.get(gSlug);
    const displayName = ov?.displayName?.trim() || def.displayName;
    const groupDescription = ov?.description?.trim() || null;
    out.push({
      type: "group",
      groupSlug: gSlug,
      displayName,
      groupDescription: groupDescription || null,
      imageSrc: pickGroupHeroImage(gSlug, variants, ov?.heroImageUrl),
      categoryId: variants[0]!.categoryId,
      fromPrice,
      fromCashPrice,
      variants,
    });
  }

  for (const p of standalone) {
    out.push({ type: "product", product: p });
  }
  return out;
}

export async function buildListingEntries(): Promise<ListingEntry[]> {
  const [products, overlays] = await Promise.all([getProducts(), loadGroupDisplayOverlayMap()]);
  const mergedDefs = await loadMergedGroupDefinitions(products);
  return buildListingFromProducts(products, overlays, mergedDefs);
}

export async function getGroupListingIfExists(groupSlug: string): Promise<(ListingEntry & { type: "group" }) | undefined> {
  const [products, overlays] = await Promise.all([getProducts(), loadGroupDisplayOverlayMap()]);
  const mergedDefs = await loadMergedGroupDefinitions(products);
  const def = mergedDefs.get(groupSlug);
  if (!def) return undefined;
  const members = products.filter((p) => resolveProductGroupSlug(p) === groupSlug);
  const variants = orderGroupVariants(groupSlug, members, def);
  if (variants.length === 0) return undefined;
  const fromPrice = Math.min(...variants.map((v) => v.price));
  const fromCashPrice = Math.min(...variants.map((v) => v.cashPrice));
  const ov = overlays.get(groupSlug);
  const displayName = ov?.displayName?.trim() || def.displayName;
  const groupDescription = ov?.description?.trim() || null;
  return {
    type: "group",
    groupSlug,
    displayName,
    groupDescription: groupDescription || null,
    imageSrc: pickGroupHeroImage(groupSlug, variants, ov?.heroImageUrl),
    categoryId: variants[0]!.categoryId,
    fromPrice,
    fromCashPrice,
    variants,
  };
}

export { isCategoryId };
export type { CategoryId } from "./category-tree";
export type { ListingEntry, Product } from "./product-types";
