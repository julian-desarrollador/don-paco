"use client";

import { useMemo, useState } from "react";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { faqItems } from "@/lib/faqs";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function PreguntasFrecuentesPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [openItemId, setOpenItemId] = useState<string | null>(faqItems[0]?.id ?? null);

  const categories = useMemo(
    () => ["Todas", ...Array.from(new Set(faqItems.map((item) => item.category)))],
    [],
  );

  const filteredFaqs = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    return faqItems.filter((item) => {
      const matchCategory = selectedCategory === "Todas" || item.category === selectedCategory;
      if (!matchCategory) return false;
      if (!normalizedQuery) return true;

      const searchableText = normalizeText(
        `${item.question} ${item.answer} ${item.keywords.join(" ")}`,
      );
      return searchableText.includes(normalizedQuery);
    });
  }, [query, selectedCategory]);

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory("Todas");
  };

  return (
    <main className="min-h-screen bg-[#f8fafb] text-[#1a1a2e]">
      <SiteHeader />

      <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-black uppercase tracking-wide text-[#4c4c4c] md:text-4xl">
            Preguntas frecuentes
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-[#6b6b6b] md:text-base">
            Encontrá respuestas rápidas sobre pedidos, envíos, pagos y cambios. Si no ves tu
            consulta, escribinos por WhatsApp y te ayudamos.
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="faq-search" className="mb-1.5 block text-sm font-semibold text-[#666]">
            Buscar pregunta
          </label>
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ej: envío, pago, cambio, devolución..."
            className="w-full rounded-lg border border-[#d8d8d8] bg-white px-4 py-2.5 text-sm text-[#444] outline-none transition-colors placeholder:text-[#999] focus:border-[#029f9c]"
          />
        </div>

        <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`cursor-pointer whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-[#029f9c] bg-[#029f9c] text-white"
                    : "border-[#d8d8d8] bg-white text-[#666] hover:border-[#029f9c] hover:text-[#029f9c]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="rounded-xl border border-[#e2e2e2] bg-[#fafafa] p-5">
              <p className="text-sm font-semibold text-[#5f5f5f]">
                No encontramos preguntas para tu búsqueda.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 rounded-md border border-[#d8d8d8] px-3 py-1.5 text-sm font-semibold text-[#666] transition-colors hover:border-[#029f9c] hover:text-[#029f9c]"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            filteredFaqs.map((item) => {
              const isOpen = openItemId === item.id;
              return (
                <article key={item.id} className="rounded-xl border border-[#e3e3e3] bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenItemId((previous) => (previous === item.id ? null : item.id))}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-4 text-left"
                    aria-expanded={isOpen}
                    aria-controls={`faq-content-${item.id}`}
                  >
                    <span>
                      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#029f9c]">
                        {item.category}
                      </span>
                      <span className="text-base font-extrabold text-[#4a4a4a]">{item.question}</span>
                    </span>
                    <span
                      className={`mt-1 shrink-0 text-sm text-[#029f9c] transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    >
                      ▼
                    </span>
                  </button>

                  {isOpen ? (
                    <div id={`faq-content-${item.id}`} className="border-t border-[#ededed] px-4 py-4">
                      <p className="text-sm leading-6 text-[#5f5f5f]">{item.answer}</p>
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
