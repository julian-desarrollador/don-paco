/** Entero con punto de miles (40.000). Sin símbolo. */
export function formatMilesAr(value: number) {
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(Math.round(value));
}

/** Lee un entero ignorando puntos de miles. Vacío → null. */
export function parseMilesAr(text: string): number | null {
  const digits = text.replace(/\D/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

export function formatArs(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Precio por kilo si el nombre o el tamaño mencionan kg. */
export function formatPricePerKg(price: number, sources: Array<string | undefined | null>): string | null {
  const text = sources.filter(Boolean).join(" ");
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*k(?:g|ilos?)\b/i);
  if (!match) return null;
  const kg = Number(match[1].replace(",", "."));
  if (!Number.isFinite(kg) || kg <= 0) return null;
  return `${formatArs(Math.round(price / kg))} / kg`;
}
