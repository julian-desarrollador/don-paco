"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { invalidateCatalogJsonProductCache } from "@/lib/products-build";
import { createProductWithActivo, setProductActivoValue, updateProductWithActivo } from "@/lib/product-activo";
import { prisma } from "@/lib/prisma";
import { slugifyLabel } from "@/lib/slugify-label";
import { productCreateSchema, productPayloadSchema } from "@/lib/validations/product";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL no configurada");
  }
}

function revalidateStore() {
  revalidatePath("/", "layout");
  revalidatePath("/productos", "layout");
  revalidatePath("/admin/products");
  invalidateCatalogJsonProductCache();
}

function nameFallbacks(name: string, marca?: string, nombre?: string) {
  const trimmed = name.trim();
  return {
    marca: marca?.trim() || trimmed.slice(0, 160),
    nombre: nombre?.trim() || trimmed.slice(0, 200),
  };
}

async function allocateUniqueProductSlug(baseLabel: string): Promise<string> {
  const base = slugifyLabel(baseLabel) || "producto";
  for (let i = 0; i < 100; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const existing = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
  }
  throw new Error("No se pudo generar una URL única; probá otro nombre.");
}

export async function createProduct(raw: unknown) {
  await requireAdmin();
  const data = productCreateSchema.parse(raw);
  const { marca, nombre } = nameFallbacks(data.name, data.marca, data.nombre);
  const slug = await allocateUniqueProductSlug(data.name);

  await createProductWithActivo(
    {
      slug,
      name: data.name.trim(),
      marca,
      nombre,
      description: data.description?.trim() ? data.description.trim() : null,
      lista: data.lista,
      cash: data.cash,
      categoryId: data.categoryId,
      stock: data.stock,
      images: data.images,
      destacado: data.destacado,
      groupSlug: data.groupSlug ?? null,
    } as import("@prisma/client").Prisma.ProductCreateInput,
    data.activo !== false,
  );
  revalidateStore();
  return { ok: true as const };
}

export async function updateProduct(id: string, raw: unknown) {
  await requireAdmin();
  const data = productPayloadSchema.parse(raw);
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");
  const { marca, nombre } = nameFallbacks(data.name, data.marca, data.nombre);
  await updateProductWithActivo(
    id,
    {
      slug: existing.slug,
      name: data.name.trim(),
      marca,
      nombre,
      description: data.description?.trim() ? data.description.trim() : null,
      lista: data.lista,
      cash: data.cash,
      categoryId: data.categoryId,
      stock: data.stock,
      images: data.images,
      destacado: data.destacado,
      groupSlug: data.groupSlug ?? null,
    } as import("@prisma/client").Prisma.ProductUpdateInput,
    data.activo !== false,
  );
  revalidateStore();
  return { ok: true as const };
}

export async function setProductVisible(id: string, visible: boolean) {
  await requireAdmin();
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");
  await setProductActivoValue(id, visible);
  revalidateStore();
  return { ok: true as const };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidateStore();
  return { ok: true as const };
}
