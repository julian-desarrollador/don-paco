/**
 * Importa `data/catalog.json` a MongoDB (solo inserta si la colección está vacía).
 * Uso: `npm run db:seed`
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { PrismaClient } from "@prisma/client";

import type { CatalogRow } from "../src/lib/catalog-types";
import { productImageBySlug } from "../src/lib/product-image-maps";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  if (count > 0) {
    console.log("Saltando seed: ya hay", count, "productos en la base.");
    return;
  }

  const file = path.join(process.cwd(), "data", "catalog.json");
  const rows = JSON.parse(readFileSync(file, "utf8")) as CatalogRow[];

  for (const row of rows) {
    const name = `${row.marca} — ${row.nombre}`.trim();
    const img = row.imageSrc?.trim() || productImageBySlug[row.slug] || "/banner.jpg";

    await prisma.product.create({
      data: {
        slug: row.slug,
        name,
        marca: row.marca,
        nombre: row.nombre,
        description: row.descripcion ?? null,
        lista: row.lista,
        cash: row.cash,
        categoryId: row.categoryId,
        stock: 5,
        images: [img],
        destacado: row.destacado ?? false,
        activo: true,
      },
    });
  }

  console.log("Seed OK:", rows.length, "productos importados desde data/catalog.json");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
