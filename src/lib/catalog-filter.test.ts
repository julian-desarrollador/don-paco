import assert from "node:assert/strict";
import { test } from "node:test";
import { filterListingEntries, listingEntryMatchesCategory } from "./catalog-filter";
import type { ListingEntry, Product } from "./product-types";

function product(partial: Pick<Product, "slug" | "name" | "categoryId">): Product {
  return {
    price: 1000,
    cashPrice: 900,
    category: partial.categoryId,
    brand: "Don Paco",
    shortDescription: "",
    description: "",
    colors: [],
    sizes: [],
    stock: 1,
    precioLista: 1000,
    ...partial,
  };
}

const bozal: ListingEntry = {
  type: "product",
  product: product({
    slug: "bozal",
    name: "Bozal rejilla",
    categoryId: "general-accesorios-bozales",
  }),
};

const collares: ListingEntry = {
  type: "group",
  groupSlug: "collar-simple",
  displayName: "Collar simple",
  categoryId: "general-accesorios-collares-correas",
  fromPrice: 1000,
  fromCashPrice: 900,
  variants: [
    product({
      slug: "collar-1",
      name: "Collar simple talle 1",
      categoryId: "general-accesorios-collares-correas",
    }),
  ],
};

const alimento: ListingEntry = {
  type: "product",
  product: product({
    slug: "alimento",
    name: "Alimento seco perro",
    categoryId: "mascota-perro-alimento-seco",
  }),
};

test("el grupo Accesorios deja pasar bozales y collares, no alimentos", () => {
  assert.equal(listingEntryMatchesCategory(bozal, "general-accesorios"), true);
  assert.equal(listingEntryMatchesCategory(collares, "general-accesorios"), true);
  assert.equal(listingEntryMatchesCategory(alimento, "general-accesorios"), false);
});

test("filterListingEntries aplica el filtro de Accesorios", () => {
  const filtered = filterListingEntries([bozal, collares, alimento], "general-accesorios", "");
  assert.deepEqual(
    filtered.map((entry) => (entry.type === "product" ? entry.product.slug : entry.groupSlug)),
    ["bozal", "collar-simple"],
  );
});
