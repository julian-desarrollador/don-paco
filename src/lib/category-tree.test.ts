import assert from "node:assert/strict";
import { test } from "node:test";
import {
  categoryFilterLabel,
  categoryIdMatchesFilter,
  isCategoryFilter,
  isCategoryId,
  leafIdsMatchingFilter,
} from "./category-tree";

test("Accesorios es un filtro de grupo, no una categoría de producto", () => {
  assert.equal(isCategoryFilter("general-accesorios"), true);
  assert.equal(isCategoryId("general-accesorios"), false);
});

test("filtro Accesorios incluye todas las subcategorías del grupo", () => {
  const ids = leafIdsMatchingFilter("general-accesorios");
  assert.deepEqual(
    [...ids].sort(),
    [
      "general-accesorios-bombachas",
      "general-accesorios-bozales",
      "general-accesorios-collares-correas",
      "general-accesorios-comederos",
      "general-accesorios-juguetes",
      "general-accesorios-literas",
    ],
  );
});

test("una hoja solo coincide consigo misma", () => {
  assert.deepEqual(leafIdsMatchingFilter("general-accesorios-bozales"), ["general-accesorios-bozales"]);
  assert.equal(categoryIdMatchesFilter("general-accesorios-bozales", "general-accesorios-bozales"), true);
  assert.equal(categoryIdMatchesFilter("general-accesorios-literas", "general-accesorios-bozales"), false);
});

test("un bozal entra en el filtro de Accesorios", () => {
  assert.equal(categoryIdMatchesFilter("general-accesorios-bozales", "general-accesorios"), true);
  assert.equal(categoryIdMatchesFilter("mascota-perro-alimento-seco", "general-accesorios"), false);
});

test("la etiqueta del grupo Accesorios es legible", () => {
  assert.equal(categoryFilterLabel("general-accesorios"), "Categorías generales · Accesorios");
});
