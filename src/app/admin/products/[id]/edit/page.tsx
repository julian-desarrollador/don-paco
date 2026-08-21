import { notFound } from "next/navigation";

import ProductForm from "@/components/admin/product-form";
import { listGroupSelectOptions } from "@/lib/admin-group-select-options";
import { productToFormValues } from "@/lib/admin/product-form-values";
import { attachProductActivo } from "@/lib/product-activo";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  let product = null;
  try {
    if (process.env.DATABASE_URL?.trim()) {
      const found = await prisma.product.findUnique({ where: { id } });
      product = found ? (await attachProductActivo([found]))[0]! : null;
    }
  } catch {
    product = null;
  }
  if (!product) notFound();

  const groupSelectOptions = await listGroupSelectOptions();

  return (
    <ProductForm
      mode="edit"
      productId={product.id}
      defaultValues={productToFormValues(product)}
      groupSelectOptions={groupSelectOptions}
      layout="storefront"
    />
  );
}
