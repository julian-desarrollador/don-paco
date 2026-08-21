import ProductForm from "@/components/admin/product-form";
import { listGroupSelectOptions } from "@/lib/admin-group-select-options";
import { CATEGORY_IDS } from "@/lib/category-tree";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ groupSlug?: string }> };

export default async function NewProductPage({ searchParams }: Props) {
  const sp = await searchParams;
  const preGroup = sp.groupSlug ? decodeURIComponent(sp.groupSlug) : "";
  const groupSelectOptions = await listGroupSelectOptions();

  const defaultValues = {
    slug: "",
    name: "",
    marca: "",
    nombre: "",
    description: "",
    lista: 0,
    cash: null,
    categoryId: CATEGORY_IDS[0]!,
    stock: 5,
    images: [] as string[],
    destacado: false,
    activo: true,
    groupSlug: preGroup,
  };

  return (
    <ProductForm
      mode="create"
      layout="storefront"
      defaultValues={defaultValues}
      groupSelectOptions={groupSelectOptions}
    />
  );
}
