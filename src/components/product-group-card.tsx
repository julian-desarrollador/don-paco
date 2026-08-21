"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { petAudienceShortLabel } from "@/lib/category-tree";
import { formatArs, type ListingEntry, type Product } from "@/lib/products";

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
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-[#e2e2e2] bg-white shadow-sm transition-shadow hover:shadow-md"
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      tabIndex={0}
      role="link"
      aria-label={`${showPetAudience ? `${petAudienceShortLabel(entry.categoryId)} · ` : ""}Ver opciones de ${entry.displayName}`}
    >
      <div className="relative aspect-[5/6] w-full shrink-0 bg-white sm:aspect-[4/5]">
        {entry.imageSrc ? (
          <Image
            src={entry.imageSrc}
            alt={entry.displayName}
            fill
            className={imageFitClass}
            sizes="(max-width: 640px) 50vw, 280px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f4f4f4] text-sm font-semibold text-[#888]">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        {showPetAudience ? (
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-[#9a9a9a]">
            {petAudienceShortLabel(entry.categoryId)}
          </p>
        ) : null}
        <h4 className="mb-1 min-h-[2.4rem] text-[13px] font-extrabold uppercase leading-tight text-[#777] sm:mb-2 sm:min-h-[3rem] sm:text-base">
          <Link href={href} className="transition-colors hover:text-[#029f9c]">
            {entry.displayName}
          </Link>
        </h4>
        <p className="text-base font-black text-[#18181b] sm:text-xl">Desde {formatArs(entry.fromPrice)}</p>
        <p className="mb-3 text-[11px] text-[#888] sm:mb-4 sm:text-sm">
          Desde {formatArs(entry.fromCashPrice)} efectivo o transferencia
        </p>
        <div className="mt-auto">
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
            className="block w-full rounded-md bg-[#029f9c] px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#028785] disabled:opacity-50 sm:text-xs"
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </article>
  );
}
