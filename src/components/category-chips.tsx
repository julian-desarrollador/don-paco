"use client";

import { Bone, Cat, Dog, HeartPulse, Shirt, Sparkles, ToyBrick } from "lucide-react";
import type { CategoryId } from "@/lib/category-tree";

const CHIPS: { id: CategoryId; label: string; icon: typeof Dog }[] = [
  { id: "mascota-perro-alimento-seco", label: "Alimento perro", icon: Dog },
  { id: "mascota-gato-alimento-seco", label: "Alimento gato", icon: Cat },
  { id: "mascota-perro-alimento-snacks", label: "Snacks", icon: Bone },
  { id: "general-accesorios-collares-correas", label: "Accesorios", icon: Sparkles },
  { id: "general-accesorios-juguetes", label: "Juguetes", icon: ToyBrick },
  { id: "mascota-perro-alimento-dietas", label: "Dietas vet.", icon: HeartPulse },
  { id: "general-ropa", label: "Ropa", icon: Shirt },
];

type CategoryChipsProps = {
  selectedCategory: string;
  onSelect: (id: string) => void;
};

export default function CategoryChips({ selectedCategory, onSelect }: CategoryChipsProps) {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 md:px-6" aria-label="Categorías destacadas">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onSelect("Todas")}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
            selectedCategory === "Todas"
              ? "border-[#029f9c] bg-[#029f9c] text-white"
              : "border-[#e2e8f0] bg-white text-[#1a1a2e] hover:border-[#029f9c]"
          }`}
        >
          Todas
        </button>
        {CHIPS.map((chip) => {
          const active = selectedCategory === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onSelect(chip.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                active
                  ? "border-[#029f9c] bg-[#029f9c] text-white"
                  : "border-[#e2e8f0] bg-white text-[#1a1a2e] hover:border-[#029f9c]"
              }`}
            >
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                  active ? "bg-white/20" : "bg-[#e6f7f6] text-[#017d7a]"
                }`}
              >
                <chip.icon className="h-3.5 w-3.5" aria-hidden />
              </span>
              {chip.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
