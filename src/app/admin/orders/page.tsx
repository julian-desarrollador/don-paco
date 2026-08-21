import { OrdersClient } from "@/app/admin/orders/orders-client";
import { AdminBackNav } from "@/components/admin/admin-back-nav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  let orders: Awaited<ReturnType<typeof prisma.order.findMany>> = [];
  try {
    if (process.env.DATABASE_URL?.trim()) {
      orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    }
  } catch {
    orders = [];
  }

  return (
    <div className="space-y-6">
      <AdminBackNav href="/admin/dashboard">Panel</AdminBackNav>
      <div>
        <h1 className="text-2xl font-black text-[#18181b]">Pedidos</h1>
      </div>
      <OrdersClient orders={orders} />
    </div>
  );
}
