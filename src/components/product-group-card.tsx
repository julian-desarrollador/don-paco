"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { petAudienceShortLabel } from "@/lib/category-tree";
import { formatArs, formatPricePerKg, type ListingEntry, type Product } from "@/lib/products";

function cheapestVariant(variants: Product[]): Product | undefined {
  if (variants.length === 0) return undefined;
  return variants.reduce((lowest, variant) => (variant.price < lowest.price ? variant : lowest));
}

type ProductGroupCardProps = {
  entry: Extract<ListingEntry, { type: "group" }>;
  showPetAudience?: boolean;
};

export default function ProductGroupCard({ entry, showPetAudience }: ProductGroupCardProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const href = `/productos/${entry.groupSlug}`;
  const defaultVariant = cheapestVariant(entry.variants);
  const zoomOutGroupSlugs = new Set(["sieger-gato-kitten"]);
  const zoomInGroupSlugs = new Set(["agility-adulto", "agility-cordero", "agility-adulto-raza-peq"]);
  const imageFitClass = zoomOutGroupSlugs.has(entry.groupSlug)
    ? "object-contain p-6"
    : zoomInGroupSlugs.has(entry.groupSlug)
      ? "object-contain p-2"
      : "object-contain p-4";
  const brand = defaultVariant?.brand;
  const pricePerKg = defaultVariant
    ? formatPricePerKg(defaultVariant.price, [defaultVariant.name, ...defaultVariant.sizes])
    : null;

  const goToDetail = () => {
    router.push(href);
  };

  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea")) return;
    goToDetail();
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    goToDetail();
  };

  return (
    <article
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      tabIndex={0}
      role="link"
      aria-label={`${showPetAudience ? `${petAudienceShortLabel(entry.categoryId)} · ` : ""}Ver opciones de ${entry.displayName}`}
    >
      <div className="relative aspect-[4/5] w-full shrink-0 bg-white">
        {brand ? (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#017d7a] shadow-sm">
            {brand}
          </span>
        ) : null}
        {entry.imageSrc ? (
          <Image
            src={entry.imageSrc}
            alt={entry.displayName}
            fill
            className={imageFitClass}
            sizes="(max-width: 640px) 50vw, 280px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f8fafb] text-sm font-semibold text-[#64748b]">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {showPetAudience ? (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#64748b]">
            {petAudienceShortLabel(entry.categoryId)}
          </p>
        ) : null}
        <h4 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-[#1a1a2e] sm:text-[15px]">
          <Link href={href} className="transition-colors hover:text-[#029f9c]">
            {entry.displayName}
          </Link>
        </h4>
        <p className="text-lg font-extrabold text-[#1a1a2e] sm:text-xl">Desde {formatArs(entry.fromPrice)}</p>
        <p className="text-[11px] text-[#64748b] sm:text-xs">
          Desde {formatArs(entry.fromCashPrice)} efectivo o transferencia
        </p>
        {pricePerKg ? (
          <p className="mb-3 text-[11px] font-medium text-[#017d7a] sm:text-xs">Desde {pricePerKg}</p>
        ) : (
          <div className="mb-3" />
        )}
        <button
          type="button"
          disabled={!defaultVariant}
          onClick={() => {
            if (!defaultVariant) return;
            addItem({
              slug: defaultVariant.slug,
              name: defaultVariant.name,
              price: defaultVariant.price,
              imageSrc: defaultVariant.imageSrc || entry.imageSrc,
            });
          }}
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f97316] px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-[#ea580c] disabled:opacity-50 sm:text-xs"
        >
          <ShoppingCart className="h-3.5 w-3.5" aria-hidden />
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}
