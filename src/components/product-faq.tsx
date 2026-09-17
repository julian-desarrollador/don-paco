"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type ProductFaqItem = {
  question: string;
  answer: string;
};

export const DEFAULT_PRODUCT_FAQS: ProductFaqItem[] = [
  {
    question: "¿Cómo elijo el alimento ideal para mi mascota?",
    answer:
      "Tené en cuenta edad, tamaño y necesidades (castrado, peso, digestión). Si hay una dieta veterinaria, seguí la indicación profesional. En Don Paco te ayudamos a elegir la presentación.",
  },
  {
    question: "¿Puedo combinar alimento seco y húmedo?",
    answer:
      "Sí. Muchas familias combinan ambos para palatabilidad e hidratación. Hacé el cambio de a poco y respetá las porciones diarias recomendadas.",
  },
  {
    question: "¿Hacen envíos a todo el país?",
    answer:
      "Sí. Coordinamos el envío al checkout. También podés retirar en el local: Roca 473, Gral. Fernández Oro, Río Negro.",
  },
  {
    question: "¿Qué medios de pago aceptan?",
    answer:
      "Tarjeta, Mercado Pago y transferencia. El precio de lista suele coincidir con efectivo/transferencia; con tarjeta se aplica el recargo informado en la ficha.",
  },
];

export default function ProductFaq({
  items = DEFAULT_PRODUCT_FAQS,
  embedded = false,
}: {
  items?: ProductFaqItem[];
  embedded?: boolean;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className={embedded ? "" : "rounded-2xl border border-[#e2e8f0] bg-white p-5 md:p-6"}>
      {embedded ? null : <h2 className="mb-4 text-lg font-extrabold text-[#1a1a2e]">Preguntas frecuentes</h2>}
      <div className="divide-y divide-[#e2e8f0]">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.question}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 py-3 text-left"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="text-sm font-semibold text-[#1a1a2e]">{item.question}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-[#029f9c] transition ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen ? <p className="pb-3 text-sm leading-relaxed text-[#64748b]">{item.answer}</p> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
