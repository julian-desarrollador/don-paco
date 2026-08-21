import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const HIDDEN_FILE = path.join(process.cwd(), "data", "product-hidden.json");

function isUnknownActivoError(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientValidationError && String(e.message).includes("activo")
  );
}

function mongoIdToString(id: unknown): string | null {
  if (typeof id === "string" && id) return id;
  if (id && typeof id === "object" && "$oid" in id) {
    const oid = (id as { $oid?: unknown }).$oid;
    return typeof oid === "string" ? oid : null;
  }
  return null;
}

async function readHiddenIds(): Promise<Set<string>> {
  try {
    const t = await fs.readFile(HIDDEN_FILE, "utf8");
    const o = JSON.parse(t) as unknown;
    if (Array.isArray(o)) {
      return new Set(o.filter((x): x is string => typeof x === "string" && x.length > 0));
    }
  } catch {
    /* sin archivo */
  }
  return new Set();
}

async function writeHiddenId(id: string, hidden: boolean): Promise<void> {
  const set = await readHiddenIds();
  if (hidden) set.add(id);
  else set.delete(id);
  await fs.mkdir(path.dirname(HIDDEN_FILE), { recursive: true });
  await fs.writeFile(HIDDEN_FILE, JSON.stringify([...set], null, 2), "utf8");
}

async function persistProductActivoRaw(id: string, activo: boolean): Promise<void> {
  await prisma.$runCommandRaw({
    update: "Product",
    updates: [
      {
        q: { _id: { $oid: id } },
        u: { $set: { activo } },
      },
    ],
  });
}

async function persistActivoFallback(id: string, activo: boolean): Promise<void> {
  try {
    await persistProductActivoRaw(id, activo);
  } catch {
    /* colección o comando no disponible */
  }
  try {
    await writeHiddenId(id, !activo);
  } catch {
    /* filesystem de solo lectura (p. ej. algunos hosts) */
  }
}

export async function createProductWithActivo(
  data: import("@prisma/client").Prisma.ProductCreateInput,
  activo: boolean,
) {
  const payload = { ...data, activo } as import("@prisma/client").Prisma.ProductCreateInput;
  try {
    const created = await prisma.product.create({ data: payload });
    if (!activo) await persistActivoFallback(created.id, false);
    return created;
  } catch (e) {
    if (!isUnknownActivoError(e)) throw e;
    const created = await prisma.product.create({ data });
    await persistActivoFallback(created.id, activo);
    return created;
  }
}

export async function updateProductWithActivo(
  id: string,
  data: import("@prisma/client").Prisma.ProductUpdateInput,
  activo: boolean,
) {
  const payload = { ...data, activo } as import("@prisma/client").Prisma.ProductUpdateInput;
  try {
    const updated = await prisma.product.update({ where: { id }, data: payload });
    await persistActivoFallback(id, activo);
    return updated;
  } catch (e) {
    if (!isUnknownActivoError(e)) throw e;
    const updated = await prisma.product.update({ where: { id }, data });
    await persistActivoFallback(id, activo);
    return updated;
  }
}

export async function setProductActivoValue(id: string, activo: boolean) {
  try {
    await prisma.product.update({
      where: { id },
      data: { activo } as import("@prisma/client").Prisma.ProductUpdateInput,
    });
    await persistActivoFallback(id, activo);
  } catch (e) {
    if (!isUnknownActivoError(e)) throw e;
    await persistActivoFallback(id, activo);
  }
}

export async function loadProductActivoById(): Promise<Map<string, boolean>> {
  const map = new Map<string, boolean>();
  try {
    const hidden = await readHiddenIds();
    for (const id of hidden) map.set(id, false);
  } catch {
    /* ignore */
  }
  try {
    const result = (await prisma.$runCommandRaw({
      find: "Product",
      filter: {},
      projection: { _id: 1, activo: 1 },
      batchSize: 5000,
    })) as {
      cursor?: { firstBatch?: Array<{ _id?: unknown; activo?: boolean }> };
    };
    for (const doc of result.cursor?.firstBatch ?? []) {
      const id = mongoIdToString(doc._id);
      if (!id) continue;
      if (typeof doc.activo === "boolean") map.set(id, doc.activo);
    }
  } catch {
    /* ignore */
  }
  return map;
}

export function resolveProductActivo(
  row: { id: string; activo?: boolean },
  flags: Map<string, boolean>,
): boolean {
  if (typeof row.activo === "boolean") return row.activo;
  return flags.get(row.id) !== false;
}

export async function attachProductActivo<T extends { id: string }>(
  rows: T[],
): Promise<Array<T & { activo: boolean }>> {
  if (rows.length === 0) return [];
  const flags = await loadProductActivoById();
  return rows.map((row) => ({
    ...row,
    activo: resolveProductActivo(row as T & { activo?: boolean }, flags),
  }));
}
