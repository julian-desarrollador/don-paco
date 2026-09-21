export const CATEGORY_IDS = [
  "mascota-perro-alimento-seco",
  "mascota-perro-alimento-humedo",
  "mascota-perro-alimento-snacks",
  "mascota-perro-alimento-dietas",
  "mascota-perro-farmacia",
  "mascota-perro-pulgas-garrapatas",
  "mascota-gato-alimento-seco",
  "mascota-gato-alimento-humedo",
  "mascota-gato-alimento-snacks",
  "mascota-gato-alimento-dietas",
  "mascota-gato-piedras-arenas",
  "mascota-gato-farmacia",
  "mascota-gato-pulgas-garrapatas",
  "mascota-peces-alimentos-productos",
  "general-accesorios-collares-correas",
  "general-accesorios-bozales",
  "general-accesorios-literas",
  "general-accesorios-bombachas",
  "general-accesorios-comederos",
  "general-accesorios-juguetes",
  "general-higiene-shampoo",
  "general-higiene-perfumes",
  "general-ropa",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export type NavBranchId =
  | "por-mascota"
  | "mascota-perro"
  | "mascota-perro-alimento"
  | "mascota-gato"
  | "mascota-gato-alimento"
  | "mascota-peces"
  | "general"
  | "general-accesorios"
  | "general-higiene";

/** ID de hoja de producto o de un grupo del menú (ej. Accesorios). */
export type CategoryFilterId = CategoryId | NavBranchId;

export type NavNode =
  | { kind: "branch"; id: NavBranchId; label: string; children: readonly NavNode[] }
  | { kind: "leaf"; id: CategoryId; label: string };

/**
 * Por mascota (perro/gato/peces) + categorías generales.
 * Farmacia en perros y en gatos (mismo criterio que comentamos).
 */
export const navRoot: readonly NavNode[] = [
  {
    kind: "branch",
    id: "por-mascota",
    label: "Por mascota",
    children: [
      {
        kind: "branch",
        id: "mascota-perro",
        label: "Perros",
        children: [
          {
            kind: "branch",
            id: "mascota-perro-alimento",
            label: "Alimentos",
            children: [
              { kind: "leaf", id: "mascota-perro-alimento-seco", label: "Seco" },
              { kind: "leaf", id: "mascota-perro-alimento-humedo", label: "Húmedo" },
              { kind: "leaf", id: "mascota-perro-alimento-snacks", label: "Snacks y premios" },
              { kind: "leaf", id: "mascota-perro-alimento-dietas", label: "Dietas veterinarias" },
            ],
          },
          { kind: "leaf", id: "mascota-perro-farmacia", label: "Farmacia" },
          { kind: "leaf", id: "mascota-perro-pulgas-garrapatas", label: "Pulgas y garrapatas" },
        ],
      },
      {
        kind: "branch",
        id: "mascota-gato",
        label: "Gatos",
        children: [
          {
            kind: "branch",
            id: "mascota-gato-alimento",
            label: "Alimentos",
            children: [
              { kind: "leaf", id: "mascota-gato-alimento-seco", label: "Seco" },
              { kind: "leaf", id: "mascota-gato-alimento-humedo", label: "Húmedo" },
              { kind: "leaf", id: "mascota-gato-alimento-snacks", label: "Snacks y premios" },
              { kind: "leaf", id: "mascota-gato-alimento-dietas", label: "Dietas veterinarias" },
            ],
          },
          { kind: "leaf", id: "mascota-gato-piedras-arenas", label: "Piedras / arenas" },
          { kind: "leaf", id: "mascota-gato-farmacia", label: "Farmacia" },
          { kind: "leaf", id: "mascota-gato-pulgas-garrapatas", label: "Pulgas y garrapatas" },
        ],
      },
      {
        kind: "branch",
        id: "mascota-peces",
        label: "Peces",
        children: [
          { kind: "leaf", id: "mascota-peces-alimentos-productos", label: "Alimentos / productos" },
        ],
      },
    ],
  },
  {
    kind: "branch",
    id: "general",
    label: "Categorías generales",
    children: [
      {
        kind: "branch",
        id: "general-accesorios",
        label: "Accesorios",
        children: [
          { kind: "leaf", id: "general-accesorios-collares-correas", label: "Collares y correas" },
          { kind: "leaf", id: "general-accesorios-bozales", label: "Bozales" },
          { kind: "leaf", id: "general-accesorios-literas", label: "Literas" },
          { kind: "leaf", id: "general-accesorios-bombachas", label: "Bombachas higiénicas" },
          { kind: "leaf", id: "general-accesorios-comederos", label: "Comederos / bebederos" },
          { kind: "leaf", id: "general-accesorios-juguetes", label: "Juguetes" },
        ],
      },
      {
        kind: "branch",
        id: "general-higiene",
        label: "Higiene",
        children: [
          { kind: "leaf", id: "general-higiene-shampoo", label: "Shampoo" },
          { kind: "leaf", id: "general-higiene-perfumes", label: "Perfumes" },
        ],
      },
      { kind: "leaf", id: "general-ropa", label: "Ropa" },
    ],
  },
] as const;

function walkLeaves(
  nodes: readonly NavNode[],
  parts: string[],
  out: { id: CategoryId; label: string }[],
) {
  for (const node of nodes) {
    if (node.kind === "leaf") {
      out.push({ id: node.id, label: [...parts, node.label].join(" · ") });
    } else {
      walkLeaves(node.children, [...parts, node.label], out);
    }
  }
}

const leafList: { id: CategoryId; label: string }[] = [];
walkLeaves(navRoot, [], leafList);

export function categoryBadgeLabel(id: CategoryId): string {
  const hit = leafList.find((item) => item.id === id);
  return hit?.label ?? id;
}

/** Último tramo del path (ej. "Seco", "Comederos / bebederos") — útil en UI compacta. */
export function categoryLeafShortLabel(id: CategoryId): string {
  const hit = leafList.find((item) => item.id === id);
  if (!hit) return id;
  const parts = hit.label.split(" · ");
  return parts[parts.length - 1]!.trim();
}

/** Path sin el último tramo (ej. "Por mascota · Perros · Alimentos") o null si es una sola pieza. */
export function categoryLeafTrailPrefix(id: CategoryId): string | null {
  const hit = leafList.find((item) => item.id === id);
  if (!hit) return null;
  const parts = hit.label.split(" · ");
  if (parts.length <= 1) return null;
  return parts.slice(0, -1).join(" · ");
}

/** Para el listado "Todas": indica mascota (o general) sin depender del nombre del producto. */
export function petAudienceShortLabel(id: CategoryId): string {
  if (id.startsWith("mascota-perro-")) return "Perro";
  if (id.startsWith("mascota-gato-")) return "Gato";
  if (id.startsWith("mascota-peces-")) return "Pez";
  if (id.startsWith("general-")) return "General";
  return "Producto";
}

export const allLeafCategoryIds: CategoryId[] = leafList.map((item) => item.id);

export function isCategoryId(value: string): value is CategoryId {
  return (allLeafCategoryIds as string[]).includes(value);
}

function collectLeafIds(nodes: readonly NavNode[], out: CategoryId[]) {
  for (const node of nodes) {
    if (node.kind === "leaf") {
      out.push(node.id);
    } else {
      collectLeafIds(node.children, out);
    }
  }
}

function indexCategoryFilters(
  nodes: readonly NavNode[],
  parts: string[],
  into: Map<string, { leaves: CategoryId[]; label: string }>,
) {
  for (const node of nodes) {
    const path = [...parts, node.label];
    const label = path.join(" · ");
    if (node.kind === "leaf") {
      into.set(node.id, { leaves: [node.id], label });
    } else {
      const leaves: CategoryId[] = [];
      collectLeafIds(node.children, leaves);
      into.set(node.id, { leaves, label });
      indexCategoryFilters(node.children, path, into);
    }
  }
}

const categoryFilterIndex = new Map<string, { leaves: CategoryId[]; label: string }>();
indexCategoryFilters(navRoot, [], categoryFilterIndex);

/** Acepta una hoja (`general-accesorios-bozales`) o un grupo del menú (`general-accesorios`). */
export function isCategoryFilter(value: string): value is CategoryFilterId {
  return categoryFilterIndex.has(value);
}

export function leafIdsMatchingFilter(filter: string): readonly CategoryId[] {
  if (filter === "Todas") return allLeafCategoryIds;
  return categoryFilterIndex.get(filter)?.leaves ?? [];
}

export function categoryIdMatchesFilter(categoryId: string, filter: string): boolean {
  if (filter === "Todas") return true;
  const leaves = categoryFilterIndex.get(filter)?.leaves;
  if (!leaves) return false;
  return leaves.includes(categoryId as CategoryId);
}

export function categoryFilterLabel(filter: string): string {
  if (filter === "Todas") return "Todas";
  return categoryFilterIndex.get(filter)?.label ?? filter;
}

export function catalogCategoryHref(filterId: string): string {
  return `/?categoria=${encodeURIComponent(filterId)}#catalogo`;
}

export const flatCategoryButtons: { id: CategoryId | "Todas"; label: string }[] = [
  { id: "Todas", label: "Todas" },
  ...leafList.map((item) => ({ id: item.id, label: item.label })),
];

/** Menú superior: dos bloques con enlaces planos a `?categoria=`. */
export const shopMenuGroups: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Por mascota",
    links: leafList
      .filter((item) => String(item.id).startsWith("mascota-"))
      .map((item) => ({ label: item.label, href: `/?categoria=${item.id}` })),
  },
  {
    title: "Categorías generales",
    links: leafList
      .filter((item) => String(item.id).startsWith("general-"))
      .map((item) => ({ label: item.label, href: `/?categoria=${item.id}` })),
  },
];
