import { categoryIdMatchesFilter } from "./category-tree";
import type { ListingEntry } from "./product-types";

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function entryMatchesQuery(entry: ListingEntry, query: string) {
  if (!query) return true;
  const haystack =
    entry.type === "product"
      ? `${entry.product.name} ${entry.product.brand} ${entry.product.category} ${entry.product.shortDescription}`
      : `${entry.displayName} ${entry.variants.map((v) => `${v.name} ${v.brand}`).join(" ")}`;
  return normalizeSearchText(haystack).includes(query);
}

export function listingEntryMatchesCategory(entry: ListingEntry, selectedCategory: string): boolean {
  if (selectedCategory === "Todas") return true;
  if (entry.type === "product") {
    return categoryIdMatchesFilter(entry.product.categoryId, selectedCategory);
  }
  return (
    categoryIdMatchesFilter(entry.categoryId, selectedCategory) ||
    entry.variants.some((variant) => categoryIdMatchesFilter(variant.categoryId, selectedCategory))
  );
}

export function filterListingEntries(
  listing: readonly ListingEntry[],
  selectedCategory: string,
  searchQuery: string,
): ListingEntry[] {
  const query = normalizeSearchText(searchQuery);
  return listing.filter((entry) => {
    if (!listingEntryMatchesCategory(entry, selectedCategory)) return false;
    return entryMatchesQuery(entry, query);
  });
}
