import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminBackNav } from "@/components/admin/admin-back-nav";
import ProductGroupAdminForm from "@/components/admin/product-group-admin-form";
import { getProductGroupDisplayRow } from "@/lib/product-group-display-overlays";
import { loadMergedGroupDefinitions } from "@/lib/product-group-merge";
import { resolveProductGroupSlug } from "@/lib/product-group-slug";
import { getProductGroupDefinition } from "@/lib/product-groups";
import { prisma } from "@/lib/prisma";
import { getGroupListingIfExists, getProducts } from "@/lib/products-build";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function AdminProductGroupDetailPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);

  const products = await getProducts({ includeHidden: true });
  const merged = await loadMergedGroupDefinitions(products);
  if (!merged.has(slug)) notFound();

  const def = merged.get(slug)!;
  const staticDef = getProductGroupDefinition(slug);
  const row = await getProductGroupDisplayRow(slug);
  const initialDisplayName = row?.displayName?.trim() || def.displayName;
  const initialDescription = row?.description?.trim() ?? "";
  const initialHeroImageUrl = row?.heroImageUrl?.trim() ?? null;

  const listingPreview = await getGroupListingIfExists(slug);
  const fallbackStorefrontHeroUrl = listingPreview?.imageSrc;

  let prismaProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  try {
    if (process.env.DATABASE_URL?.trim()) {
      prismaProducts = await prisma.product.findMany({ orderBy: { nombre: "asc" } });
    }
  } catch {
    prismaProducts = [];
  }

  const members = prismaProducts.filter((p) =>
    resolveProductGroupSlug({ slug: p.slug, groupSlug: p.groupSlug ?? null }) === slug,
  );

  return (
    <div className="space-y-10 pb-8">
      <AdminBackNav href="/admin/products">Productos</AdminBackNav>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight text-[#18181b]">{initialDisplayName}</h1>
        </div>
        <Button
          asChild
          className="h-11 min-h-[44px] shrink-0 rounded-xl bg-[#029f9c] font-semibold text-white hover:bg-[#027a78] sm:h-10 sm:min-h-0"
        >
          <Link href={`/admin/products/new?groupSlug=${encodeURIComponent(slug)}`}>+ Producto en este grupo</Link>
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#71717a]">Productos ({members.length})</h2>
        {members.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#e4e4e7] bg-[#fafafa] px-4 py-6 text-center text-sm text-[#71717a]">
            Todavía no hay productos en este grupo.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#e4e4e7] bg-white">
            <ul>
              {members.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 border-b border-[#f4f4f5] px-4 py-3 last:border-0"
                >
                  <p className="min-w-0 flex-1 text-[15px] font-medium leading-snug text-[#18181b]">{p.name}</p>
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="shrink-0 rounded-lg px-2.5 py-2 text-sm font-semibold text-[#029f9c] hover:bg-[#f0faf9] hover:underline"
                  >
                    Editar
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-black text-[#18181b]">Ficha del grupo</h2>
        <ProductGroupAdminForm
          mode="edit"
          groupSlug={slug}
          baseDisplayName={staticDef?.displayName ?? def.displayName}
          variantCount={members.length}
          initialDisplayName={initialDisplayName}
          initialDescription={initialDescription}
          initialHeroImageUrl={initialHeroImageUrl}
          fallbackStorefrontHeroUrl={fallbackStorefrontHeroUrl}
          isStaticCatalog={Boolean(staticDef)}
        />
      </section>
    </div>
  );
}
