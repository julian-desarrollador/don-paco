"use client";

import { useCart } from "@/components/cart-provider";
import { formatArs, type Product } from "@/lib/products";

type GroupVariantLinesProps = {
  variants: Product[];
};

export default function GroupVariantLines({ variants }: GroupVariantLinesProps) {
  const { addItem } = useCart();

  return (
    <ul className="mt-2 space-y-3">
      {variants.map((v) => (
        <li
          key={v.slug}
          className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-[#e6e6e6] bg-[#fafafa] p-4"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black uppercase leading-snug text-[#555]">{v.name}</p>
            <p className="mt-2 text-xl font-black text-[#029f9c]">{formatArs(v.price)}</p>
            <p className="text-xs text-[#888]">{formatArs(v.cashPrice)} efectivo o transferencia</p>
            <p className="text-xs text-[#8a8a8a]">Lista {formatArs(v.precioLista)}</p>
          </div>
          <button
            type="button"
            onClick={() =>
              addItem({
                slug: v.slug,
                name: v.name,
                price: v.price,
                imageSrc: v.imageSrc,
              })
            }
            className="shrink-0 rounded-md bg-[#029f9c] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#028785]"
          >
            Agregar
          </button>
        </li>
      ))}
    </ul>
  );
}
