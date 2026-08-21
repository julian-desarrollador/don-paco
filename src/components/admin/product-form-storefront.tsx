"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import PawIcon from "@/components/paw-icon";
import { Button } from "@/components/ui/button";
import { CategoryFilterPicker } from "@/components/admin/category-filter-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GroupSelectOption } from "@/lib/admin/product-form-values";
import type { ProductFormValues } from "@/lib/admin/product-form-values";
import { categoryBadgeLabel, isCategoryId } from "@/lib/category-tree";
import { formatArs } from "@/lib/product-format";
import { listaDesdePrecioTarjeta, precioEfectivoTransfer, precioTarjetaDesdeLista } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type Props = {
  mode?: "create" | "edit";
  form: UseFormReturn<ProductFormValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  onDelete?: () => void;
  groupSelectOptions: GroupSelectOption[];
};

function normalizeGalleryImages(images: string[] | undefined | null): string[] {
  return images?.map((u) => u?.trim()).filter((u): u is string => Boolean(u)) ?? [];
}

export function ProductFormStorefront({
  mode = "edit",
  form,
  onSubmit,
  onUpload,
  onDelete,
  groupSelectOptions,
}: Props) {
  const router = useRouter();
  const isCreate = mode === "create";
  const { register, watch, setValue, control, formState } = form;
  const v = watch();
  const images = v.images ?? [];
  const gallery = useMemo(() => normalizeGalleryImages(images), [images]);
  const [heroUrl, setHeroUrl] = useState<string | null>(null);

  useEffect(() => {
    if (gallery.length === 0) {
      setHeroUrl(null);
      return;
    }
    setHeroUrl((prev) => (prev && gallery.includes(prev) ? prev : gallery[0]!));
  }, [gallery]);

  const mainImg = useMemo(() => {
    if (gallery.length === 0) return undefined;
    if (heroUrl && gallery.includes(heroUrl)) return heroUrl;
    return gallery[0];
  }, [gallery, heroUrl]);
  const lista = Number(v.lista) || 0;
  const cr = v.cash;
  const cash =
    cr === null || cr === undefined || (typeof cr === "number" && Number.isNaN(cr))
      ? null
      : typeof cr === "number"
        ? cr
        : null;
  const price = precioTarjetaDesdeLista(lista);
  const cashPrice = precioEfectivoTransfer(lista, cash);
  const catId = v.categoryId;
  const catLabel = isCategoryId(catId) ? categoryBadgeLabel(catId) : "Sin categoría";
  const slugWatch = (v.slug || "").trim();

  return (
    <form onSubmit={onSubmit} className="pb-28 md:pb-0">
      <section className="mx-auto w-full max-w-7xl">
        {isCreate ? (
          <h1 className="mb-4 text-xl font-black tracking-tight text-[#18181b] md:text-2xl">Nuevo producto</h1>
        ) : null}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {!isCreate && slugWatch && v.activo !== false ? (
              <Button type="button" variant="outline" size="sm" className="rounded-xl" asChild>
                <Link href={`/productos/${encodeURIComponent(slugWatch)}`} target="_blank" rel="noopener noreferrer">
                  Ver en tienda ↗
                </Link>
              </Button>
            ) : null}
          </div>
          <div className="hidden gap-2 md:flex">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" className="rounded-xl bg-[#029f9c] font-semibold hover:bg-[#027a78]">
              {isCreate ? "Crear producto" : "Guardar cambios"}
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-4 rounded-2xl border border-[#e6e6e6] bg-gradient-to-br from-[#f6f6f6] to-[#ececec] p-4 sm:p-6">
              <div className="relative flex h-56 items-center justify-center rounded-xl bg-white/80 sm:h-72 md:h-[320px]">
                {mainImg ? (
                  <Image
                    key={mainImg}
                    src={mainImg}
                    alt={v.name || "Producto"}
                    width={720}
                    height={720}
                    className="max-h-full w-auto max-w-full object-contain p-4 sm:p-6"
                    unoptimized
                    priority
                  />
                ) : (
                  <PawIcon className="h-20 w-20 text-[#029f9c] md:h-24 md:w-24" />
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-[#52525b]">Fotos</Label>
              <div>
                <Button type="button" variant="outline" size="sm" className="rounded-xl" asChild>
                  <label className="cursor-pointer">
                    Subir imagen
                    <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                  </label>
                </Button>
              </div>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {images.map((url, i) => {
                  const trimmed = url?.trim() ?? "";
                  const isHero = Boolean(trimmed && mainImg === trimmed);
                  return (
                    <li
                      key={`${trimmed}-${i}`}
                      className={cn(
                        "relative flex aspect-square cursor-pointer list-none items-center justify-center overflow-hidden rounded-xl border bg-white transition-shadow",
                        isHero
                          ? "border-[#029f9c] ring-2 ring-[#029f9c]/35 shadow-md"
                          : "border-[#e2e2e2] hover:border-[#029f9c]/50",
                      )}
                      tabIndex={0}
                      onClick={() => {
                        if (trimmed) setHeroUrl(trimmed);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (trimmed) setHeroUrl(trimmed);
                        }
                      }}
                    >
                      {trimmed ? (
                        <Image src={trimmed} alt="" fill className="object-contain p-1" unoptimized />
                      ) : null}
                      <button
                        type="button"
                        className="absolute right-1 top-1 z-10 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-black/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          setValue(
                            "images",
                            images.filter((_, idx) => idx !== i),
                            { shouldValidate: true },
                          );
                        }}
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e6e6e6] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase">
              <span className="rounded-full bg-[#029f9c]/15 px-2.5 py-1 text-[#029f9c]">{catLabel}</span>
              <span className="rounded-full bg-[#f0f0f0] px-2.5 py-1 text-[#777]">
                Stock:{" "}
                <input
                  type="number"
                  className="w-14 border-0 bg-transparent p-0 text-center text-[11px] font-bold text-[#555] focus:outline-none"
                  {...register("stock", { valueAsNumber: true })}
                />
              </span>
            </div>

            <div className="mb-4 space-y-2">
              <Label htmlFor="storefront-name">Nombre</Label>
              <textarea
                id="storefront-name"
                rows={2}
                {...register("name")}
                className={cn(
                  "w-full resize-none rounded-lg border border-[#e4e4e4] bg-white px-3 py-2 text-xl font-black uppercase leading-tight text-[#555] placeholder:text-[#b4b4b4] focus:border-[#029f9c]/40 focus:outline-none md:text-2xl",
                )}
                placeholder="Nombre del producto"
              />
              {formState.errors.name && (
                <p className="text-xs text-red-600">{formState.errors.name.message}</p>
              )}
            </div>

            <div className="mb-6 rounded-xl bg-[#f7f7f7] p-4">
              <p className="text-3xl font-black text-[#18181b]">{formatArs(price)}</p>
              <p className="mt-1 text-sm text-[#7a7a7a]">{formatArs(cashPrice)} efectivo o transferencia</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="storefront-precio-tarjeta">Precio con tarjeta</Label>
                  <Controller
                    name="lista"
                    control={control}
                    render={({ field }) => {
                      const tarjetaMostrada =
                        field.value === undefined || field.value === null || Number(field.value) === 0
                          ? ""
                          : String(precioTarjetaDesdeLista(Number(field.value)));
                      return (
                        <Input
                          id="storefront-precio-tarjeta"
                          type="number"
                          step="1"
                          min={0}
                          inputMode="numeric"
                          className="rounded-lg border-[#e4e4e4] bg-white"
                          value={tarjetaMostrada}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === "") {
                              field.onChange(0);
                              return;
                            }
                            const n = Number(raw);
                            if (!Number.isFinite(n)) return;
                            field.onChange(listaDesdePrecioTarjeta(n));
                          }}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      );
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="storefront-cash">Efectivo (opcional)</Label>
                  <Input
                    id="storefront-cash"
                    type="number"
                    step="1"
                    className="rounded-lg border-[#e4e4e4] bg-white"
                    {...register("cash")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_330px]">
          <section className="rounded-2xl border border-[#e6e6e6] bg-white p-5 sm:p-6">
            <h2 className="mb-3 text-base font-bold text-[#18181b]">Descripción</h2>
            <textarea
              id="storefront-description"
              rows={8}
              {...register("description")}
              className="w-full rounded-xl border border-[#e4e4e4] bg-[#fafafa] px-3 py-3 text-[15px] leading-7 text-[#666] focus:border-[#029f9c]/50 focus:outline-none"
              placeholder="Texto que ve el cliente en la ficha…"
            />
          </section>

          <aside className="rounded-2xl border border-[#e6e6e6] bg-white p-5 sm:p-6">
            <div className="space-y-4 text-sm">
              <div className="space-y-1">
                <Label>Categoría</Label>
                <CategoryFilterPicker
                  variant="required"
                  hideLabel
                  value={v.categoryId}
                  onChange={(id) => {
                    if (!id || !isCategoryId(id)) return;
                    setValue("categoryId", id, { shouldValidate: true });
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="storefront-group">Grupo (opcional)</Label>
                <select
                  id="storefront-group"
                  className="mt-1 flex h-10 w-full rounded-lg border border-[#e4e4e4] bg-white px-3 text-sm"
                  {...register("groupSlug")}
                >
                  <option value="">— Sin grupo —</option>
                  {groupSelectOptions.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
                {formState.errors.groupSlug && (
                  <p className="mt-1 text-xs text-red-600">{formState.errors.groupSlug.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>En la tienda</Label>
                <button
                  type="button"
                  onClick={() => setValue("activo", v.activo === false, { shouldDirty: true })}
                  className={cn(
                    "mt-1 flex h-11 w-full items-center justify-between rounded-xl border px-3.5 text-sm font-semibold",
                    v.activo === false
                      ? "border-[#e8d9b8] bg-[#faf6ee] text-[#7c5c1e]"
                      : "border-[#b7e0de] bg-[#f0faf9] text-[#027a78]",
                  )}
                >
                  {v.activo === false ? "Oculto en la página" : "Se muestra en la página"}
                  <span
                    className={cn(
                      "relative h-6 w-11 rounded-full",
                      v.activo === false ? "bg-[#c4b89a]" : "bg-[#029f9c]",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 h-4 w-4 rounded-full bg-white transition-all",
                        v.activo === false ? "left-1" : "left-6",
                      )}
                    />
                  </span>
                </button>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="storefront-destacado"
                  type="checkbox"
                  className="h-4 w-4 accent-[#029f9c]"
                  {...register("destacado")}
                />
                <Label htmlFor="storefront-destacado" className="font-medium text-[#555]">
                  Destacado
                </Label>
              </div>
              {!isCreate && onDelete ? (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                  onClick={onDelete}
                >
                  Eliminar producto
                </Button>
              ) : null}
            </div>
          </aside>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e4e4e7] bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl gap-2">
          <Button type="button" variant="outline" className="h-11 min-h-[44px] flex-1 rounded-xl" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" className="h-11 min-h-[44px] flex-[2] rounded-xl bg-[#029f9c] font-semibold hover:bg-[#027a78]">
            {isCreate ? "Crear" : "Guardar"}
          </Button>
        </div>
      </div>
    </form>
  );
}
