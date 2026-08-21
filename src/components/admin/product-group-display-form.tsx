"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteProductGroupDisplay, upsertProductGroupDisplay } from "@/actions/product-group-display";
import { AdminBackNav } from "@/components/admin/admin-back-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  groupSlug: string;
  baseDisplayName: string;
  variantCount: number;
  initialDisplayName: string;
  initialDescription: string;
  hasCustomRow: boolean;
};

export default function ProductGroupDisplayForm({
  groupSlug,
  baseDisplayName,
  variantCount,
  initialDisplayName,
  initialDescription,
  hasCustomRow,
}: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [description, setDescription] = useState(initialDescription);
  const [busy, setBusy] = useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await upsertProductGroupDisplay({
        groupSlug,
        displayName: displayName.trim(),
        description: description.trim() || null,
      });
      toast.success("Grupo guardado");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function onReset() {
    if (!hasCustomRow) {
      toast.message("No hay cambios para restaurar.");
      return;
    }
    if (!confirm("¿Volver al nombre y texto originales?")) {
      return;
    }
    setBusy(true);
    try {
      await deleteProductGroupDisplay(groupSlug);
      setDisplayName(baseDisplayName);
      setDescription("");
      toast.success("Se restauró el texto original");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSave} className="mx-auto max-w-2xl space-y-6">
      <AdminBackNav href="/admin/products">Productos</AdminBackNav>
      <p className="text-sm text-[#71717a]">
        {variantCount} producto{variantCount === 1 ? "" : "s"} en este grupo.
      </p>

      <div className="space-y-2">
        <Label htmlFor="group-display-name">Nombre</Label>
        <Input
          id="group-display-name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="rounded-lg"
          required
          maxLength={300}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="group-description">Descripción (opcional)</Label>
        <textarea
          id="group-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          maxLength={8000}
          className="w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2 text-sm text-[#3f3f46] placeholder:text-[#a1a1aa] focus:border-[#029f9c]/50 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={busy} className="rounded-xl bg-[#029f9c] font-semibold hover:bg-[#027a78]">
          Guardar
        </Button>
        <Button type="button" variant="outline" className="rounded-xl" disabled={busy} onClick={onReset}>
          Restaurar
        </Button>
      </div>
    </form>
  );
}
