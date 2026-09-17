"use client";

import { useState } from "react";
import ProductFaq, { type ProductFaqItem } from "@/components/product-faq";

type SpecRow = { label: string; value: string };

type ProductInfoTabsProps = {
  description: string;
  bullets?: string[];
  specs: SpecRow[];
  faqs?: ProductFaqItem[];
};

export default function ProductInfoTabs({ description, bullets, specs, faqs }: ProductInfoTabsProps) {
  const [tab, setTab] = useState<"desc" | "ficha" | "faq">("desc");

  const tabs = [
    { id: "desc" as const, label: "Descripción" },
    { id: "ficha" as const, label: "Ficha técnica" },
    { id: "faq" as const, label: "FAQ" },
  ];

  return (
    <section className="mt-10 rounded-2xl border border-[#e2e8f0] bg-white">
      <div className="flex gap-1 overflow-x-auto border-b border-[#e2e8f0] px-3 pt-3">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-t-xl px-4 py-2.5 text-sm font-bold ${
              tab === item.id ? "bg-[#f8fafb] text-[#029f9c]" : "text-[#64748b] hover:text-[#1a1a2e]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="p-5 md:p-6">
        {tab === "desc" ? (
          <div>
            <p className="whitespace-pre-wrap text-[15px] leading-7 text-[#334155]">{description}</p>
            {bullets && bullets.length > 0 ? (
              <ul className="mt-5 grid gap-2 text-sm text-[#64748b] sm:grid-cols-2">
                {bullets.map((bullet) => (
                  <li key={bullet}>• {bullet}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        {tab === "ficha" ? (
          <dl className="max-w-xl space-y-3 text-sm">
            {specs.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 border-b border-[#e2e8f0] pb-2">
                <dt className="text-[#64748b]">{row.label}</dt>
                <dd className="text-right font-semibold text-[#1a1a2e]">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {tab === "faq" ? <ProductFaq items={faqs} embedded /> : null}
      </div>
    </section>
  );
}
