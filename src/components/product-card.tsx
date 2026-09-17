"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import PawIcon from "@/components/paw-icon";
import { petAudienceShortLabel } from "@/lib/category-tree";
import { formatArs, formatPricePerKg, type Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
  showPetAudience?: boolean;
};

export default function ProductCard({ product, showPetAudience }: ProductCardProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const extraZoomOutProductSlugs = new Set(["sieger-pouch-perro"]);
  const zoomInProductSlugs = new Set(["upper-castrado-x1-5"]);
  const imageFitClass = extraZoomOutProductSlugs.has(product.slug)
    ? "object-contain p-7"
    : zoomInProductSlugs.has(product.slug)
      ? "object-contain p-1"
      : "object-contain p-4";
  const pricePerKg = formatPricePerKg(product.price, [product.name, ...product.sizes]);

  const goToDetail = () => {
    router.push(`/productos/${product.slug}`);
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
      aria-label={`${showPetAudience ? `${petAudienceShortLabel(product.categoryId)} · ` : ""}Ver detalle de ${product.name}`}
    >
      <div className="relative aspect-[4/5] w-full shrink-0 bg-white">
        {product.brand ? (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#017d7a] shadow-sm">
            {product.brand}
          </span>
        ) : null}
        {product.imageSrc ? (
          <Image
            src={product.imageSrc}
            alt={product.name}
            fill
            className={imageFitClass}
            sizes="(max-width: 640px) 50vw, 280px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f8fafb]">
            <PawIcon className="h-9 w-9 text-[#029f9c] sm:h-14 sm:w-14" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {showPetAudience ? (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#64748b]">
            {petAudienceShortLabel(product.categoryId)}
          </p>
        ) : null}
        <h4 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-[#1a1a2e] sm:text-[15px]">
          <Link href={`/productos/${product.slug}`} className="transition-colors hover:text-[#029f9c]">
            {product.name}
          </Link>
        </h4>
        <p className="text-lg font-extrabold text-[#1a1a2e] sm:text-xl">{formatArs(product.price)}</p>
        <p className="text-[11px] text-[#64748b] sm:text-xs">
          {formatArs(product.cashPrice)} efectivo o transferencia
        </p>
        {pricePerKg ? (
          <p className="mb-3 text-[11px] font-medium text-[#017d7a] sm:text-xs">{pricePerKg}</p>
        ) : (
          <div className="mb-3" />
        )}
        <button
          type="button"
          onClick={() =>
            addItem({
              slug: product.slug,
              name: product.name,
              price: product.price,
              imageSrc: product.imageSrc,
            })
          }
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f97316] px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-[#ea580c] sm:text-xs"
        >
          <ShoppingCart className="h-3.5 w-3.5" aria-hidden />
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}
