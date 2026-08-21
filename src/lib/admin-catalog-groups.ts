import "server-only";

import { loadMergedGroupDefinitions } from "@/lib/product-group-merge";
import { resolveProductGroupSlug } from "@/lib/product-group-slug";
import { getProductGroupDefinition } from "@/lib/product-groups";
import type { Product } from "@/lib/product-types";
import { getProducts } from "@/lib/products-build";

export type AdminGroupRow = {
  slug: string;
  displayName: string;
  variantCount: number;
  kind: "static" | "custom";
};

export async function listAdminGroups(): Promise<AdminGroupRow[]> {
  const products = await getProducts({ includeHidden: true });
  const merged = await loadMergedGroupDefinitions(products);
  const slugs = [...merged.keys()].sort((a, b) =>
    (merged.get(a)?.displayName ?? a).localeCompare(merged.get(b)?.displayName ?? b, "es"),
  );

  return slugs.map((slug) => {
    const def = merged.get(slug)!;
    const variantCount = products.filter((p) => resolveProductGroupSlug(p) === slug).length;
    const staticDef = getProductGroupDefinition(slug);
    const kind: "static" | "custom" = staticDef ? "static" : "custom";
    return { slug, displayName: def.displayName, variantCount, kind };
  });
}

export async function listStandaloneCatalogProducts(): Promise<Product[]> {
  const products = await getProducts({ includeHidden: true });
  return products.filter((p) => !resolveProductGroupSlug(p));
}
