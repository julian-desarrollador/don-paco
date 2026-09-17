import ProductCard from "@/components/product-card";
import type { Product } from "@/lib/product-types";

export default function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#029f9c]">Seguí recorriendo</p>
          <h2 className="text-2xl font-extrabold text-[#1a1a2e]">También te puede interesar</h2>
        </div>
      </div>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {products.map((item) => (
          <div key={item.slug} className="w-[220px] shrink-0 snap-start sm:w-[240px]">
            <ProductCard product={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
