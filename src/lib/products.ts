/** API pública segura para cliente: sin `server-only` ni lectura de disco. */
export { formatArs, formatPricePerKg } from "./product-format";
export type { ListingEntry, Product } from "./product-types";
export { getDetailHrefForProductSlug } from "./product-routing";
