"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import PawIcon from "@/components/paw-icon";
import { petAudienceShortLabel } from "@/lib/category-tree";
import { formatArs, type Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
  /** En vista "Todas" ayuda a ver si es perro, gato, etc. */
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
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-[#e2e2e2] bg-white shadow-sm transition-shadow hover:shadow-md"
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      tabIndex={0}
      role="link"
      aria-label={`${showPetAudience ? `${petAudienceShortLabel(product.categoryId)} · ` : ""}Ver detalle de ${product.name}`}
    >
      <div className="relative aspect-[5/6] w-full shrink-0 bg-white sm:aspect-[4/5]">
        {product.imageSrc ? (
          <Image
            src={product.imageSrc}
            alt={product.name}
            fill
            className={imageFitClass}
            sizes="(max-width: 640px) 50vw, 280px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f4f4f4]">
            <PawIcon className="h-9 w-9 text-[#029f9c] sm:h-14 sm:w-14" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        {showPetAudience ? (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#9a9a9a]">
            {petAudienceShortLabel(product.categoryId)}
          </p>
        ) : null}
        <h4 className="mb-1 min-h-[2.4rem] text-[13px] font-extrabold uppercase leading-tight text-[#777] sm:mb-2 sm:min-h-[3rem] sm:text-base">
          <Link href={`/productos/${product.slug}`} className="transition-colors hover:text-[#029f9c]">
            {product.name}
          </Link>
        </h4>
        <p className="text-base font-black text-[#18181b] sm:text-xl">{formatArs(product.price)}</p>
        <p className="mb-3 text-[11px] text-[#888] sm:mb-4 sm:text-sm">
          {formatArs(product.cashPrice)} efectivo o transferencia
        </p>
        <div className="mt-auto flex flex-col gap-1.5 sm:flex-row sm:gap-2">
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
            className="flex-1 rounded-md bg-[#029f9c] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#028785] sm:text-xs"
          >
            Comprar
          </button>
          <Link
            href={`/productos/${product.slug}`}
            className="rounded-md border border-[#e4077d] px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-[#e4077d] transition-colors hover:bg-[#e4077d] hover:text-white sm:text-xs"
          >
            Ver
          </Link>
        </div>
      </div>
    </article>
  );
}
