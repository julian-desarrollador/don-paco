"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BrandsSection from "@/components/brands-section";
import CategoryChips from "@/components/category-chips";
import FeaturedProducts from "@/components/featured-products";
import HeroCarousel, { type HeroSlide } from "@/components/hero-carousel";
import MobileFilterSort from "@/components/mobile-filter-sort";
import ProductCard from "@/components/product-card";
import ProductGroupCard from "@/components/product-group-card";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import SortDropdown from "@/components/sort-dropdown";
import TrustBar from "@/components/trust-bar";
import { isCategoryId, navRoot, type NavNode } from "@/lib/category-tree";
import type { ListingEntry } from "@/lib/product-types";
import type { SiteSettings } from "@/types/site-settings";

function CategoryNav({
  nodes,
  depth,
  selectedCategory,
  onSelect,
}: {
  nodes: readonly NavNode[];
  depth: number;
  selectedCategory: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className={depth === 0 ? "space-y-2" : "ml-0.5 space-y-1 border-l border-[#e2e8f0] pl-2.5"}>
      {nodes.map((node, idx) =>
        node.kind === "leaf" ? (
          <li key={node.id}>
            <button
              type="button"
              onClick={() => onSelect(node.id)}
              className={`w-full cursor-pointer rounded-md px-2 py-1 text-left text-[14px] transition-colors ${
                selectedCategory === node.id
                  ? "bg-[#029f9c]/10 font-semibold text-[#029f9c]"
                  : "text-[#334155] hover:bg-[#f8fafb] hover:text-[#e4077d]"
              }`}
            >
              {node.label}
            </button>
          </li>
        ) : (
          <li key={`${node.label}-${idx}`} className={depth > 0 ? "pt-1" : ""}>
            <p
              className={`mb-1 px-2 font-semibold ${
                depth === 0
                  ? "text-[11px] font-black uppercase tracking-wider text-[#64748b]"
                  : "text-[13px] text-[#334155]"
              }`}
            >
              {node.label}
            </p>
            <CategoryNav nodes={node.children} depth={depth + 1} selectedCategory={selectedCategory} onSelect={onSelect} />
          </li>
        ),
      )}
    </ul>
  );
}

const filterGroups = [
  {
    title: "Precio",
    options: ["Menos de $20.000", "$20.000 - $50.000", "$50.000 - $100.000", "Más de $100.000"],
  },
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function entryMatchesQuery(entry: ListingEntry, query: string) {
  if (!query) return true;
  const haystack =
    entry.type === "product"
      ? `${entry.product.name} ${entry.product.brand} ${entry.product.category} ${entry.product.shortDescription}`
      : `${entry.displayName} ${entry.variants.map((v) => `${v.name} ${v.brand}`).join(" ")}`;
  return normalizeText(haystack).includes(query);
}

function buildHeroSlides(site: SiteSettings): HeroSlide[] {
  return [
    {
      id: "bienvenida",
      title: site.bannerTitle || "Todo para tu mascota",
      subtitle: `${site.bannerSubtitle}. ${site.bannerLead}`,
      ctaLabel: "Ver productos",
      ctaHref: "/#catalogo",
      imageSrc: "/banner.jpg",
      tone: "teal",
    },
    {
      id: "perros",
      title: "Alimentos para perros",
      subtitle: "Marcas de confianza, presentaciones para cada etapa y envíos a todo el país.",
      ctaLabel: "Ver alimento perro",
      ctaHref: "/?categoria=mascota-perro-alimento-seco",
      imageSrc: "/Perros/alimentos-secos/royal-canin-mini-adulto.webp",
      tone: "navy",
    },
    {
      id: "gatos",
      title: "Cuidado gatuno, de verdad",
      subtitle: "Alimento seco, húmedo y dietas veterinarias pensadas para el día a día.",
      ctaLabel: "Ver alimento gato",
      ctaHref: "/?categoria=mascota-gato-alimento-seco",
      imageSrc: "/Gatos/alimentos-secos/sieger-adulto.webp",
      tone: "sunset",
    },
    {
      id: "local",
      title: site.cashDiscountLabel,
      subtitle: "Retirá en Roca 473, Gral. Fernández Oro, o recibí el pedido en casa.",
      ctaLabel: "Cómo comprar",
      ctaHref: "/preguntas-frecuentes",
      imageSrc: "/portada.jpeg",
      tone: "teal",
    },
  ];
}

export default function HomeClient({
  initialListing,
  site,
  initialCategory = "Todas",
  initialQuery = "",
}: {
  initialListing: ListingEntry[];
  site: SiteSettings;
  initialCategory?: string;
  initialQuery?: string;
}) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("categoria");
    const q = params.get("q");
    if (c && isCategoryId(c)) {
      setSelectedCategory(c);
    }
    if (q) {
      setSearchQuery(q);
    }
  }, []);

  const selectCategory = useCallback(
    (id: string) => {
      setSelectedCategory(id);
      const params = new URLSearchParams(window.location.search);
      if (id === "Todas") {
        params.delete("categoria");
      } else {
        params.set("categoria", id);
      }
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    },
    [router],
  );

  const filteredListing = useMemo(() => {
    const query = normalizeText(searchQuery);
    return initialListing.filter((entry) => {
      if (selectedCategory !== "Todas") {
        if (entry.type === "product") {
          if (entry.product.categoryId !== selectedCategory) return false;
        } else if (
          entry.categoryId !== selectedCategory &&
          !entry.variants.some((v) => v.categoryId === selectedCategory)
        ) {
          return false;
        }
      }
      return entryMatchesQuery(entry, query);
    });
  }, [selectedCategory, initialListing, searchQuery]);

  const showFeatured = selectedCategory === "Todas" && !searchQuery;

  return (
    <main className="min-h-screen bg-[#f8fafb] text-[#1a1a2e]">
      <SiteHeader />

      <HeroCarousel slides={buildHeroSlides(site)} />
      <TrustBar />

      <div className="py-8">
        <CategoryChips selectedCategory={selectedCategory} onSelect={selectCategory} />
      </div>

      {showFeatured ? (
        <div className="pb-10">
          <FeaturedProducts listing={initialListing} />
        </div>
      ) : null}

      <section id="catalogo" className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#029f9c]">Catálogo</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1a1a2e] md:text-3xl">
              {searchQuery ? `Resultados para “${searchQuery}”` : site.storeName}
            </h1>
          </div>
          <div className="hidden lg:block">
            <SortDropdown />
          </div>
        </div>

        <MobileFilterSort
          navRoot={navRoot}
          filterGroups={filterGroups}
          selectedCategory={selectedCategory}
          onChangeCategory={selectCategory}
        />

        <div className="grid gap-6 lg:items-start lg:grid-cols-[280px_1fr]">
          <aside className="hidden h-fit rounded-2xl border border-[#e2e8f0] bg-white p-5 lg:block">
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-[#029f9c]">Categorías</h2>
            <ul className="mb-6 space-y-1 text-[15px]">
              <li>
                <button
                  type="button"
                  onClick={() => selectCategory("Todas")}
                  className={`w-full cursor-pointer rounded-md px-2 py-1.5 text-left transition-colors ${
                    selectedCategory === "Todas"
                      ? "bg-[#029f9c]/10 font-semibold text-[#029f9c]"
                      : "text-[#334155] hover:bg-[#f8fafb] hover:text-[#e4077d]"
                  }`}
                >
                  Todas
                </button>
              </li>
              <li className="pt-1">
                <CategoryNav
                  nodes={navRoot}
                  depth={0}
                  selectedCategory={selectedCategory}
                  onSelect={selectCategory}
                />
              </li>
            </ul>

            <h3 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-[#029f9c]">Filtrar por</h3>
            <div className="space-y-5">
              {filterGroups.map((group) => (
                <div key={group.title}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#64748b]">{group.title}</p>
                  <ul className="space-y-1.5 text-base text-[#334155] md:text-[17px]">
                    {group.options.map((option) => (
                      <li key={option}>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input type="checkbox" className="cursor-pointer accent-[#029f9c]" />
                          <span>{option}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          <div className="order-1 grid grid-cols-2 gap-3 sm:gap-5 2xl:grid-cols-3 lg:order-2">
            {filteredListing.length === 0 ? (
              <p className="col-span-full rounded-2xl border border-dashed border-[#e2e8f0] bg-white p-8 text-center text-sm text-[#64748b]">
                No encontramos productos para esa búsqueda.
              </p>
            ) : (
              filteredListing.map((entry) =>
                entry.type === "group" ? (
                  <ProductGroupCard
                    key={entry.groupSlug}
                    entry={entry}
                    showPetAudience={selectedCategory === "Todas"}
                  />
                ) : (
                  <ProductCard
                    key={entry.product.slug}
                    product={entry.product}
                    showPetAudience={selectedCategory === "Todas"}
                  />
                ),
              )
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            className="rounded-full border border-[#029f9c] px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#029f9c] transition-colors hover:bg-[#029f9c] hover:text-white"
          >
            Mostrar más productos
          </button>
        </div>
      </section>

      <BrandsSection />
      <SiteFooter />
    </main>
  );
}
