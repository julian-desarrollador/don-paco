"use client";

import ProductCard from "@/components/product-card";
import ProductGroupCard from "@/components/product-group-card";
import type { ListingEntry } from "@/lib/product-types";

function isFeatured(entry: ListingEntry): boolean {
  if (entry.type === "product") return entry.product.destacado === true;
  return entry.variants.some((v) => v.destacado === true);
}

export default function FeaturedProducts({ listing }: { listing: ListingEntry[] }) {
  const featured = listing.filter(isFeatured);
  const items = (featured.length > 0 ? featured : listing).slice(0, 10);
  if (items.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 md:px-6" aria-label="Productos destacados">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#029f9c]">Lo más pedido</p>
          <h2 className="text-2xl font-extrabold text-[#1a1a2e]">Productos destacados</h2>
        </div>
      </div>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {items.map((entry) => (
          <div key={entry.type === "group" ? entry.groupSlug : entry.product.slug} className="w-[220px] shrink-0 snap-start sm:w-[240px]">
            {entry.type === "group" ? (
              <ProductGroupCard entry={entry} showPetAudience />
            ) : (
              <ProductCard product={entry.product} showPetAudience />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
