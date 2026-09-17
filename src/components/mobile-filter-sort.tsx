"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/body-scroll-lock";
import { categoryBadgeLabel, isCategoryId, type NavNode } from "@/lib/category-tree";

type FilterGroup = {
  title: string;
  options: string[];
};

type MobileFilterSortProps = {
  navRoot: readonly NavNode[];
  filterGroups: FilterGroup[];
  selectedCategory: string;
  onChangeCategory: (category: string) => void;
};

function MobileCategoryNav({
  nodes,
  depth,
  selectedCategory,
  onSelectLeaf,
}: {
  nodes: readonly NavNode[];
  depth: number;
  selectedCategory: string;
  onSelectLeaf: (id: string) => void;
}) {
  return (
    <ul className={depth === 0 ? "space-y-2" : "ml-0.5 space-y-1 border-l border-[#e2e8f0] pl-2.5"}>
      {nodes.map((node, idx) =>
        node.kind === "leaf" ? (
          <li key={node.id}>
            <button
              type="button"
              onClick={() => onSelectLeaf(node.id)}
              className={`w-full cursor-pointer rounded-md px-2 py-2 text-left text-[15px] leading-snug transition-colors ${
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
            <MobileCategoryNav
              nodes={node.children}
              depth={depth + 1}
              selectedCategory={selectedCategory}
              onSelectLeaf={onSelectLeaf}
            />
          </li>
        ),
      )}
    </ul>
  );
}

const sortOptions = [
  "Destacado",
  "Precio: menor a mayor",
  "Precio: mayor a menor",
  "Mas nuevo al mas viejo",
];

export default function MobileFilterSort({
  navRoot,
  filterGroups,
  selectedCategory,
  onChangeCategory,
}: MobileFilterSortProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const sortContainerRef = useRef<HTMLDivElement>(null);

  const selectedCount = selectedFilters.length;
  const selectedFilterPreview = useMemo(() => selectedFilters.slice(0, 4), [selectedFilters]);

  const toggleFilterOption = (option: string) => {
    setSelectedFilters((previous) =>
      previous.includes(option)
        ? previous.filter((item) => item !== option)
        : [...previous, option],
    );
  };

  useEffect(() => {
    if (!isSortOpen) return;

    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (sortContainerRef.current && !sortContainerRef.current.contains(target)) {
        setIsSortOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSortOpen]);

  useEffect(() => {
    if (isFilterOpen) {
      lockBodyScroll({ disableTouchAction: true });
    }

    return () => {
      if (isFilterOpen) {
        unlockBodyScroll({ disableTouchAction: true });
      }
    };
  }, [isFilterOpen]);

  return (
    <div className="mb-4 lg:hidden">
      <div className="flex items-center justify-end">
        <div ref={sortContainerRef} className="relative w-full max-w-[220px]">
          <button
            type="button"
            onClick={() => setIsSortOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-sm font-semibold text-[#334155]"
            aria-expanded={isSortOpen}
            aria-haspopup="listbox"
          >
            <span>Ordenar</span>
            <span className={`text-[11px] transition-transform ${isSortOpen ? "rotate-180" : ""}`}>▼</span>
          </button>

          {isSortOpen ? (
            <div className="absolute right-0 top-[calc(100%+6px)] z-40 w-full overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-lg">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSelectedSort(option);
                    setIsSortOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm font-medium ${
                    selectedSort === option
                      ? "bg-[#029f9c]/10 text-[#029f9c]"
                      : "text-[#334155] hover:bg-[#f8fafb]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
        <span className="whitespace-nowrap rounded-full bg-[#029f9c]/12 px-3 py-1 text-xs font-semibold text-[#029f9c]">
          {selectedSort}
        </span>
        <span className="whitespace-nowrap rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold text-[#334155]">
          {selectedCategory === "Todas"
            ? "Todas las categorías"
            : isCategoryId(selectedCategory)
              ? categoryBadgeLabel(selectedCategory)
              : selectedCategory}
        </span>
        {selectedFilterPreview.map((item) => (
          <span
            key={item}
            className="whitespace-nowrap rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold text-[#334155]"
          >
            {item}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          setIsSortOpen(false);
          setIsFilterOpen(true);
        }}
        className="fixed bottom-5 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-[#1a1a2e] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-black/20"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filtrar {selectedCount > 0 ? `(${selectedCount})` : ""}
      </button>

      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isFilterOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isFilterOpen}
      >
        <button
          type="button"
          onClick={() => setIsFilterOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            isFilterOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Cerrar filtros"
        />

        <aside
          className={`absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ${
            isFilterOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-[#e2e8f0]" />
          <div className="flex h-full min-h-0 flex-col">
            <header className="flex items-center justify-between px-4 py-4">
              <h2 className="text-lg font-extrabold text-[#1a1a2e]">Filtros</h2>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="rounded-full border border-[#e2e8f0] px-3 py-1 text-sm font-semibold text-[#64748b]"
              >
                Cerrar
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-2">
              <div className="mb-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#64748b]">Categorías</p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      onChangeCategory("Todas");
                      setIsFilterOpen(false);
                    }}
                    className={`block w-full rounded-md px-2 py-2 text-left text-[15px] font-medium transition-colors ${
                      selectedCategory === "Todas"
                        ? "bg-[#029f9c]/10 font-semibold text-[#029f9c]"
                        : "text-[#334155] hover:bg-[#f8fafb]"
                    }`}
                  >
                    Todas
                  </button>
                  <MobileCategoryNav
                    nodes={navRoot}
                    depth={0}
                    selectedCategory={selectedCategory}
                    onSelectLeaf={(id) => {
                      onChangeCategory(id);
                      setIsFilterOpen(false);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-5 pb-4">
                {filterGroups.map((group) => (
                  <div key={group.title}>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#64748b]">{group.title}</p>
                    <ul className="space-y-2">
                      {group.options.map((option) => {
                        const checked = selectedFilters.includes(option);
                        return (
                          <li key={option}>
                            <label className="flex items-center gap-2 text-[15px] text-[#334155]">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleFilterOption(option)}
                                className="accent-[#029f9c]"
                              />
                              <span>{option}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <footer className="grid grid-cols-2 gap-2 border-t border-[#e2e8f0] p-4">
              <button
                type="button"
                onClick={() => setSelectedFilters([])}
                className="rounded-xl border border-[#e2e8f0] px-3 py-2.5 text-sm font-semibold text-[#334155]"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="rounded-xl bg-[#f97316] px-3 py-2.5 text-sm font-semibold text-white"
              >
                Aplicar
              </button>
            </footer>
          </div>
        </aside>
      </div>
    </div>
  );
}
