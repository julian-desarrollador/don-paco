"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { createProductGroup, deleteProductGroup, updateProductGroup } from "@/actions/product-group";
import { uploadProductImage } from "@/actions/cloudinary";
import { AdminImageCropModal } from "@/components/admin/admin-image-crop-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateProps = {
  mode: "create";
};

type EditProps = {
  mode: "edit";
  groupSlug: string;
  baseDisplayName: string;
  variantCount: number;
  initialDisplayName: string;
  initialDescription: string;
  initialHeroImageUrl: string | null;
  fallbackStorefrontHeroUrl: string | undefined;
  isStaticCatalog: boolean;
};

type Props = CreateProps | EditProps;

export default function ProductGroupAdminForm(props: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const [displayName, setDisplayName] = useState(
    props.mode === "create" ? "" : props.initialDisplayName,
  );
  const [description, setDescription] = useState(
    props.mode === "create" ? "" : props.initialDescription,
  );
  const [heroImageUrl, setHeroImageUrl] = useState(
    props.mode === "create" ? "" : props.initialHeroImageUrl ?? "",
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      fd.set("file", new File([blob], "grupo.webp", { type: "image/webp" }));
      const res = await uploadProductImage(fd);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      if (res.url) {
        setHeroImageUrl(res.url);
        toast.success("Imagen subida");
        setCropOpen(false);
        setPendingFile(null);
      }
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const hero = heroImageUrl.trim() || null;
      if (props.mode === "create") {
        const res = await createProductGroup({
          displayName: displayName.trim(),
          description: description.trim() || null,
          heroImageUrl: hero,
        });
        toast.success("Grupo creado");
        router.push(`/admin/products/groups/${encodeURIComponent(res.slug)}`);
        router.refresh();
        return;
      }
      await updateProductGroup({
        slug: props.groupSlug,
        displayName: displayName.trim(),
        description: description.trim() || null,
        heroImageUrl: hero,
      });
      toast.success("Grupo actualizado");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (props.mode !== "edit") return;
    if (props.variantCount > 0) {
      toast.error("Sacá primero los productos de este grupo");
      return;
    }
    if (!confirm("¿Eliminar este grupo?")) {
      return;
    }
    setBusy(true);
    try {
      await deleteProductGroup(props.groupSlug);
      toast.success("Grupo eliminado");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  const previewSrc =
    props.mode === "edit"
      ? heroImageUrl.trim() || (props.fallbackStorefrontHeroUrl?.trim() ?? "")
      : heroImageUrl.trim();

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
      {props.mode === "edit" ? (
        <p className="text-sm text-[#71717a]">
          {props.variantCount} producto{props.variantCount === 1 ? "" : "s"} en este grupo.
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="pg-display-name">Nombre</Label>
        <Input
          id="pg-display-name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="rounded-lg"
          required
          maxLength={300}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pg-description">Descripción (opcional)</Label>
        <textarea
          id="pg-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          maxLength={8000}
          className="w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2 text-sm text-[#3f3f46] placeholder:text-[#a1a1aa] focus:border-[#029f9c]/50 focus:outline-none"
        />
      </div>

      <div className="space-y-3 rounded-xl border border-[#e4e4e7] bg-white p-4">
        <Label className="text-base">Foto</Label>
        {previewSrc ? (
          <div className="relative mx-auto flex h-48 max-w-md items-center justify-center rounded-lg border border-[#e4e4e7] bg-[#fafafa] p-3">
            <Image
              src={previewSrc}
              alt=""
              width={400}
              height={240}
              className="max-h-44 w-auto max-w-full object-contain"
              unoptimized
            />
          </div>
        ) : (
          <p className="text-sm text-[#a1a1aa]">Todavía no hay foto.</p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            asChild
            disabled={busy}
            className="h-11 cursor-pointer rounded-xl bg-[#029f9c] px-6 text-base font-semibold text-white hover:bg-[#027a78] disabled:pointer-events-none disabled:opacity-60"
          >
            <label className="cursor-pointer">
              Subir imagen
              <input type="file" accept="image/*" className="hidden" onChange={onPickFile} disabled={busy} />
            </label>
          </Button>
          {heroImageUrl.trim() ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setHeroImageUrl("")}>
              Quitar
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={busy} className="rounded-xl bg-[#029f9c] font-semibold hover:bg-[#027a78]">
          {props.mode === "create" ? "Crear grupo" : "Guardar"}
        </Button>
        {props.mode === "edit" && props.variantCount === 0 ? (
          <Button type="button" variant="destructive" className="rounded-xl" disabled={busy} onClick={onDelete}>
            Eliminar grupo
          </Button>
        ) : null}
      </div>
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
    </form>
  );
}
