import type { CategoryId } from "./category-tree";

export type Product = {
  slug: string;
  name: string;
  price: number;
  cashPrice: number;
  categoryId: CategoryId;
  category: string;
  brand: string;
  shortDescription: string;
  description: string;
  colors: string[];
  sizes: string[];
  stock: number;
  precioLista: number;
  imageSrc?: string;
  destacado?: boolean;
  activo?: boolean;
  /** Membresía de grupo desde admin (Prisma); si falta, solo cuenta el mapa estático en `product-groups.ts`. */
  groupSlug?: string | null;
};

export type ListingEntry =
  | { type: "product"; product: Product }
  | {
      type: "group";
      groupSlug: string;
      displayName: string;
      /** Texto introductorio en la ficha del grupo; si falta, se usa el copy por defecto. */
      groupDescription?: string | null;
      imageSrc?: string;
      categoryId: CategoryId;
      fromPrice: number;
      fromCashPrice: number;
      variants: Product[];
    };
