"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatArs } from "@/lib/products";

type ProductDetailActionsProps = {
  slug: string;
  name: string;
  price: number;
  colors: string[];
  sizes: string[];
  imageSrc?: string;
};

export default function ProductDetailActions({
  slug,
  name,
  price,
  colors,
  sizes,
  imageSrc,
}: ProductDetailActionsProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? "");

  const addToCart = () => {
    addItem({
      slug,
      name: `${name}${selectedColor ? ` - ${selectedColor}` : ""}${selectedSize ? ` - ${selectedSize}` : ""}`,
      price,
      quantity,
      imageSrc,
    });
  };

  const buyNow = () => {
    addToCart();
    window.dispatchEvent(new Event("open-cart"));
  };

  return (
    <>
      {colors.length > 0 ? (
        <div className="mb-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8a8a8a]">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const isSelected = color === selectedColor;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    isSelected
                      ? "border-[#029f9c] bg-[#029f9c]/10 text-[#029f9c]"
                      : "border-[#d8d8d8] text-[#666] hover:border-[#029f9c] hover:text-[#029f9c]"
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {sizes.length > 0 ? (
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8a8a8a]">Tamaño</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = size === selectedSize;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-[#029f9c] bg-[#029f9c]/10 text-[#029f9c]"
                      : "border-[#d8d8d8] text-[#666] hover:border-[#029f9c] hover:text-[#029f9c]"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center rounded-xl border border-[#e2e8f0]">
          <button
            type="button"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            className="px-3 py-2 text-lg text-[#7a7a7a]"
          >
            -
          </button>
          <span className="px-4 py-2 text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((prev) => prev + 1)}
            className="px-3 py-2 text-lg text-[#7a7a7a]"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={addToCart}
          className="w-full rounded-xl bg-[#f97316] px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#ea580c] sm:flex-1"
        >
          Agregar al carrito
        </button>
        <button
          type="button"
          onClick={buyNow}
          className="w-full rounded-xl border border-[#029f9c] px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#029f9c] transition-colors hover:bg-[#029f9c] hover:text-white sm:w-auto"
        >
          Comprar ahora
        </button>
      </div>

      <p className="mt-2 text-xs text-[#8a8a8a]">
        Total estimado actual: <span className="font-semibold text-[#1a1a2e]">{formatArs(price * quantity)}</span>
      </p>
    </>
  );
}
