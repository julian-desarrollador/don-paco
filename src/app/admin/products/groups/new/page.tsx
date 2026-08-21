import { AdminBackNav } from "@/components/admin/admin-back-nav";
import ProductGroupAdminForm from "@/components/admin/product-group-admin-form";

export const dynamic = "force-dynamic";

export default function NewProductGroupPage() {
  return (
    <div className="space-y-6">
      <AdminBackNav href="/admin/products">Productos</AdminBackNav>
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[#18181b]">Nuevo grupo</h1>
      </div>
      <ProductGroupAdminForm mode="create" />
    </div>
  );
}
