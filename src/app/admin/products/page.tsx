import Link from "next/link";

import { AdminBackNav } from "@/components/admin/admin-back-nav";
import { AdminProductsCatalog } from "@/components/admin/admin-products-catalog";
import { listAdminGroups, listStandaloneCatalogProducts } from "@/lib/admin-catalog-groups";
import { Button } from "@/components/ui/button";
import { attachProductActivo } from "@/lib/product-activo";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  try {
    if (process.env.DATABASE_URL?.trim()) {
      products = await attachProductActivo(
        await prisma.product.findMany({ orderBy: { updatedAt: "desc" } }),
      );
    }
  } catch {
    products = [];
  }

  const groups = await listAdminGroups();
  const standaloneCatalog = await listStandaloneCatalogProducts();
  const standaloneSlugs = new Set(standaloneCatalog.map((p) => p.slug));
  const orphanRows = products.filter((p) => standaloneSlugs.has(p.slug));

  return (
    <div className="space-y-10 pb-8">
      <AdminBackNav href="/admin/dashboard">Panel</AdminBackNav>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight text-[#18181b]">Productos</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
            className="h-11 min-h-[44px] rounded-xl border-[#029f9c]/40 font-semibold text-[#029f9c] hover:bg-[#029f9c]/5 sm:h-10 sm:min-h-0"
          >
            <Link href="/admin/products/groups/new">+ Nuevo grupo</Link>
          </Button>
          <Button
            asChild
            className="h-11 min-h-[44px] rounded-xl bg-[#029f9c] font-semibold text-white hover:bg-[#027a78] sm:h-10 sm:min-h-0"
          >
            <Link href="/admin/products/new">+ Nuevo producto</Link>
          </Button>
        </div>
      </div>

      <AdminProductsCatalog groups={groups} products={products} orphanRows={orphanRows} />
    </div>
  );
}
