"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createProduct, deleteProduct, updateProduct } from "@/actions/product";
import { uploadProductImage } from "@/actions/cloudinary";
import { listCategorySelectOptions } from "@/lib/admin-category-select";
import { listaDesdePrecioTarjeta, precioTarjetaDesdeLista } from "@/lib/pricing";
import type { ProductFormValues } from "@/lib/admin/product-form-values";
import type { GroupSelectOption } from "@/lib/admin/product-form-values";
import { productPayloadSchema } from "@/lib/validations/product";
import { AdminBackNav } from "@/components/admin/admin-back-nav";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import { AdminImageCropModal } from "@/components/admin/admin-image-crop-modal";
import { ProductFormStorefront } from "@/components/admin/product-form-storefront";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = productPayloadSchema;

type Props = {
  mode: "create" | "edit";
  productId?: string;
  defaultValues: ProductFormValues;
  groupSelectOptions: GroupSelectOption[];
  /** Edición con layout tipo ficha de tienda (`/productos/...`). */
  layout?: "card" | "storefront";
};

export default function ProductForm({
  mode,
  productId,
  defaultValues,
  groupSelectOptions,
  layout = "card",
}: Props) {
  const router = useRouter();
  const categories = listCategorySelectOptions();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const images = form.watch("images") ?? [];
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function appendImage(url: string) {
    form.setValue("images", [...images, url], { shouldValidate: true });
  }

  function removeImageAt(i: number) {
    form.setValue(
      "images",
      images.filter((_, idx) => idx !== i),
      { shouldValidate: true },
    );
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Elegí un archivo de imagen.");
      return;
    }
    setPendingFile(file);
    setCropOpen(true);
  }

  async function uploadCropped(blob: Blob) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", new File([blob], "producto.webp", { type: "image/webp" }));
      const res = await uploadProductImage(fd);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      if (res.url) {
        appendImage(res.url);
        toast.success("Imagen subida");
        setCropOpen(false);
        setPendingFile(null);
      }
    } finally {
      setUploading(false);
    }
  }

  const cropModal = (
    <AdminImageCropModal
      open={cropOpen}
      file={pendingFile}
      busy={uploading}
      onCancel={() => {
        if (uploading) return;
        setCropOpen(false);
        setPendingFile(null);
      }}
      onConfirm={(blob) => void uploadCropped(blob)}
    />
  );

  async function onSubmit(data: ProductFormValues) {
    if (mode === "create" && (!data.images || data.images.length === 0)) {
      toast.error("Agregá al menos una imagen");
      return;
    }
    try {
      if (mode === "create") {
        await createProduct(data);
        toast.success("Producto creado");
      } else if (productId) {
        await updateProduct(productId, data);
        toast.success("Producto actualizado");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error";
      if (msg === "SLUG_EXISTS") toast.error("Ya existe un producto con ese nombre");
      else if (msg === "NOT_FOUND") toast.error("Producto no encontrado");
      else if (msg.includes("ZodError")) toast.error("Revisá los datos del formulario");
      else toast.error(msg);
    }
  }

  function requestDelete() {
    if (!productId) return;
    setConfirmDelete(true);
  }

  async function onConfirmDelete() {
    if (!productId) return;
    setDeleting(true);
    try {
      await deleteProduct(productId);
      toast.success("Producto eliminado");
      setConfirmDelete(false);
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar");
    } finally {
      setDeleting(false);
    }
  }

  const deleteModal = (
    <AdminConfirmModal
      open={confirmDelete}
      title="¿Estás segura de eliminar este producto?"
      description={`Se va a borrar “${defaultValues.name}”. Esta acción no se puede deshacer.`}
      confirmLabel="Sí, eliminar"
      busy={deleting}
      onCancel={() => {
        if (deleting) return;
        setConfirmDelete(false);
      }}
      onConfirm={() => void onConfirmDelete()}
    />
  );

  if (layout === "storefront") {
    return (
      <>
        <AdminBackNav href="/admin/products">Productos</AdminBackNav>
        <ProductFormStorefront
          mode={mode}
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          onUpload={onPickFile}
          onDelete={mode === "edit" ? requestDelete : undefined}
          groupSelectOptions={groupSelectOptions}
        />
        {cropModal}
        {deleteModal}
      </>
    );
  }

  return (
    <>
      <AdminBackNav href="/admin/products">Productos</AdminBackNav>
      <Card className="mx-auto max-w-3xl">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>{mode === "create" ? "Nuevo producto" : "Editar producto"}</CardTitle>
        <div className="flex flex-wrap items-center gap-3">
          {mode === "edit" && defaultValues.slug ? (
            <Link
              href={`/productos/${encodeURIComponent(defaultValues.slug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[#029f9c] hover:underline"
            >
              Ver en tienda ↗
            </Link>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="categoryId">Categoría</Label>
              <select
                id="categoryId"
                className="flex h-9 w-full rounded-md border border-[#e4e4e7] bg-white px-3 text-sm"
                {...form.register("categoryId")}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="groupSlug">Grupo (opcional)</Label>
              <select
                id="groupSlug"
                className="flex h-9 w-full rounded-md border border-[#e4e4e7] bg-white px-3 text-sm"
                {...form.register("groupSlug")}
              >
                <option value="">— Sin grupo —</option>
                {groupSelectOptions.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              {form.formState.errors.groupSlug && (
                <p className="text-xs text-red-600">{form.formState.errors.groupSlug.message}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="lista-tarjeta-card">Precio con tarjeta</Label>
              <Controller
                name="lista"
                control={form.control}
                render={({ field }) => {
                  const tarjetaMostrada =
                    field.value === undefined || field.value === null || Number(field.value) === 0
                      ? ""
                      : String(precioTarjetaDesdeLista(Number(field.value)));
                  return (
                    <Input
                      id="lista-tarjeta-card"
                      type="number"
                      step="1"
                      min={0}
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
            <div className="space-y-2">
              <Label htmlFor="cash">Efectivo (opcional)</Label>
              <Input id="cash" type="number" step="1" {...form.register("cash")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" {...form.register("stock", { valueAsNumber: true })} />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input id="destacado" type="checkbox" {...form.register("destacado")} />
              <Label htmlFor="destacado">Destacado</Label>
            </div>
            <div className="sm:col-span-2">
              <Label>En la tienda</Label>
              <button
                type="button"
                onClick={() => form.setValue("activo", form.getValues("activo") === false, { shouldDirty: true })}
                className="mt-1.5 flex h-11 w-full items-center justify-between rounded-xl border border-[#e4e4e7] bg-white px-3.5 text-sm font-semibold"
              >
                {form.watch("activo") === false ? "Oculto en la página" : "Se muestra en la página"}
              </button>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                rows={4}
                className="flex w-full rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm"
                {...form.register("description")}
              />
            </div>

            <div className="space-y-3 sm:col-span-2">
              <Label>Fotos</Label>
              <Button type="button" variant="outline" size="sm" asChild>
                <label className="cursor-pointer">
                  Subir imagen
                    <input type="file" accept="image/*" className="hidden" onChange={onPickFile} />
                </label>
              </Button>
              <ul className="space-y-2">
                {images.map((url, i) => (
                  <li key={`${url}-${i}`} className="flex items-center gap-2 text-sm">
                    <span className="truncate rounded bg-[#f4f4f5] px-2 py-1 text-xs">{url}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeImageAt(i)}>
                      Quitar
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit">{mode === "create" ? "Crear" : "Guardar"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            {mode === "edit" ? (
              <Button type="button" variant="destructive" onClick={requestDelete}>
                Eliminar
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
      {cropModal}
      {deleteModal}
    </>
  );
}
