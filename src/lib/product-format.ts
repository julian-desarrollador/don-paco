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
