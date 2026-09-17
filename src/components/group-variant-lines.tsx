"use client";

import Image from "next/image";
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
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafb] p-4"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {v.imageSrc ? (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
                <Image src={v.imageSrc} alt="" fill className="object-contain p-1" sizes="56px" />
              </div>
            ) : null}
            <div className="min-w-0">
              <p className="text-sm font-bold leading-snug text-[#1a1a2e]">{v.name}</p>
              <p className="mt-1 text-lg font-extrabold text-[#1a1a2e]">{formatArs(v.price)}</p>
              <p className="text-xs text-[#64748b]">{formatArs(v.cashPrice)} efectivo o transferencia</p>
            </div>
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
            className="shrink-0 rounded-xl bg-[#f97316] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#ea580c]"
          >
            Agregar
          </button>
        </li>
      ))}
    </ul>
  );
}
