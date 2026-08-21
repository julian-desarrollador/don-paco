import { z } from "zod";

import { isCategoryId } from "@/lib/category-tree";
import { listGroupSlugs } from "@/lib/product-groups";

const imageRef = z.string().refine(
  (s) => s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/"),
  "Imagen inválida",
);

export const productPayloadSchema = z.object({
  slug: z.string().max(160).optional().default(""),
  name: z.string().min(1).max(400),
  marca: z.string().max(160).optional().default(""),
  nombre: z.string().max(200).optional().default(""),
  description: z.string().max(8000).optional(),
  lista: z.coerce.number().min(0),
  cash: z
    .any()
    .optional()
    .transform((v) => {
      if (v === "" || v === null || v === undefined) return null;
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isFinite(n)) return null;
      return n;
    }),
  categoryId: z.string().refine((v): v is import("@/lib/category-tree").CategoryId => isCategoryId(v), {
    message: "Categoría inválida",
  }),
  stock: z.coerce.number().int().min(0).max(999_999).default(5),
  images: z.array(imageRef).default([]),
  destacado: z.boolean().default(false),
  activo: z.boolean().default(true),
  groupSlug: z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((v) => {
      if (v == null || v === "") return null;
      const s = String(v).trim();
      return s === "" ? null : s;
    })
    .refine(
      (v) => {
        if (v === null) return true;
        if (listGroupSlugs().includes(v)) return true;
        return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) && v.length <= 200;
      },
      {
        message: "Grupo inválido",
      },
    ),
});

export type ProductPayload = z.infer<typeof productPayloadSchema>;

export const productCreateSchema = productPayloadSchema.extend({
  images: z.array(imageRef).min(1, "Agregá al menos una imagen"),
});
