import { OrderStatus } from "@prisma/client";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  let productCount = 0;
  let pendingOrders = 0;
  try {
    if (process.env.DATABASE_URL?.trim()) {
      productCount = await prisma.product.count();
      pendingOrders = await prisma.order.count({
        where: { status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED] } },
      });
    }
  } catch {
    productCount = 0;
    pendingOrders = 0;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[#18181b]">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Productos publicados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-[#029f9c]">{productCount}</p>
            <Link href="/admin/products" className="mt-2 inline-block text-sm font-semibold text-[#029f9c] hover:underline">
              Ver productos →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pedidos pendientes / confirmados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-[#e4077d]">{pendingOrders}</p>
            <Link href="/admin/orders" className="mt-2 inline-block text-sm font-semibold text-[#029f9c] hover:underline">
              Ver pedidos →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acción rápida</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/products/new"
              className="inline-flex rounded-lg bg-[#029f9c] px-4 py-2 text-sm font-bold text-white hover:opacity-95"
            >
              + Nuevo producto
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
