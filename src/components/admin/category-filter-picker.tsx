"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  categoryLeafShortLabel,
  categoryLeafTrailPrefix,
  isCategoryId,
  navRoot,
  type CategoryId,
  type NavNode,
} from "@/lib/category-tree";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (categoryId: string) => void;
  /** `filter`: permite “Todas” (listado admin). `required`: solo hojas del árbol (formulario producto). */
  variant?: "filter" | "required";
  /** Oculta la etiqueta superior “Categoría” (ej. cuando ya hay `<dt>` en ficha). */
  hideLabel?: boolean;
};

function NavNodes({
  nodes,
  depth,
  selectedId,
  onPickLeaf,
}: {
  nodes: readonly NavNode[];
  depth: number;
  selectedId: string;
  onPickLeaf: (id: CategoryId) => void;
}) {
  return (
    <div className={cn("space-y-2", depth > 0 && "ml-0.5 border-l-2 border-[#029f9c]/20 pl-3")}>
      {nodes.map((node, idx) => {
        if (node.kind === "leaf") {
          const selected = selectedId === node.id;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => onPickLeaf(node.id)}
              className={cn(
                "flex w-full min-h-[44px] cursor-pointer items-center rounded-xl border px-3 py-2.5 text-left text-sm font-semibold leading-snug transition-colors",
                selected
                  ? "border-[#029f9c] bg-[#029f9c]/10 text-[#026d6b]"
                  : "border-transparent bg-[#fafafa] text-[#18181b] hover:bg-[#f4f4f5] active:bg-[#e4e4e7]",
              )}
            >
              {node.label}
            </button>
          );
        }
        return (
          <div key={`${depth}-${idx}-${node.label}`} className="space-y-2">
            <p
              className={cn(
                "select-none font-bold tracking-tight text-[#18181b]",
                depth === 0 && "text-[13px] uppercase tracking-wide text-[#029f9c]",
                depth === 1 && "text-[15px] font-black normal-case text-[#18181b]",
                depth >= 2 && "text-sm font-bold text-[#52525b]",
              )}
            >
              {node.label}
            </p>
            <NavNodes
              nodes={node.children}
              depth={depth + 1}
              selectedId={selectedId}
              onPickLeaf={onPickLeaf}
            />
          </div>
        );
      })}
    </div>
  );
}

export function CategoryFilterPicker({
  value,
  onChange,
  variant = "filter",
  hideLabel = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = value.trim();
  const known = selected && isCategoryId(selected);
  const required = variant === "required";

  const title = !selected
    ? required
      ? "Elegí categoría"
      : "Todas"
    : known
      ? categoryLeafShortLabel(selected)
      : "Categoría";
  const subtitle = known ? categoryLeafTrailPrefix(selected) : null;

  function pickAll() {
    if (required) return;
    onChange("");
    setOpen(false);
  }

  function pickLeaf(id: CategoryId) {
    onChange(id);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="space-y-2">
        {!hideLabel ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-[#71717a]">Categoría</p>
        ) : null}
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-[44px] w-full cursor-pointer justify-between gap-2 rounded-xl border-[#e4e4e7] px-3 py-2.5 text-left font-normal shadow-sm hover:bg-[#fafafa]"
            aria-expanded={open}
            aria-haspopup="dialog"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-[#18181b]">{title}</span>
              {subtitle ? (
                <span className="mt-0.5 line-clamp-2 text-xs font-normal leading-snug text-[#71717a]">
                  {subtitle}
                </span>
              ) : !selected ? (
                <span className="mt-0.5 block text-xs text-[#a1a1aa]">
                  {required ? "Tocá para elegir la categoría de la tienda" : "Tocá para filtrar por sección"}
                </span>
              ) : null}
            </span>
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#71717a] transition-transform", open && "rotate-180")} />
          </Button>
        </SheetTrigger>
      </div>

      <SheetContent
        side="left"
        className="flex w-[min(100vw,26rem)] max-w-[min(100vw,26rem)] flex-col border-r border-[#e4e4e7] p-0 sm:max-w-md"
      >
        <div className="border-b border-[#e4e4e7] px-4 py-4 pr-12">
          <DialogTitle className="text-left text-lg font-black tracking-tight text-[#029f9c]">
            Categorías
          </DialogTitle>
          <p className="mt-1 text-xs leading-relaxed text-[#71717a]">Misma estructura que en la tienda. Elegí una para filtrar.</p>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-8">
          {!required ? (
            <button
              type="button"
              onClick={pickAll}
              className={cn(
                "mb-4 flex w-full min-h-[44px] cursor-pointer items-center rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition-colors",
                !selected
                  ? "border-[#029f9c] bg-[#029f9c]/10 text-[#026d6b]"
                  : "border-[#e4e4e7] bg-white text-[#18181b] hover:bg-[#fafafa]",
              )}
            >
              Todas
            </button>
          ) : null}

          <div className="space-y-6">
            {navRoot.map((root) =>
              root.kind === "branch" ? (
                <section key={root.label} className="space-y-3">
                  <h2 className="border-b border-[#f4f4f5] pb-1 text-xs font-black uppercase tracking-widest text-[#029f9c]">
                    {root.label}
                  </h2>
                  <NavNodes nodes={root.children} depth={0} selectedId={selected} onPickLeaf={pickLeaf} />
                </section>
              ) : null,
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
