"use client";

import type { Order } from "@prisma/client";
import { OrderStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateOrderStatus } from "@/actions/order";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const labels: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter();

  async function changeStatus(id: string, status: OrderStatus) {
    try {
      await updateOrderStatus({ id, status });
      toast.success("Estado actualizado");
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar");
    }
  }

  if (orders.length === 0) {
    return (
      <p className="rounded-xl border border-[#e4e4e7] bg-white p-8 text-center text-sm text-[#71717a]">
        Todavía no hay pedidos. Cuando existan ventas, aparecerán aquí.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-[#e4e4e7] bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Mercado Pago</TableHead>
            <TableHead className="text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="whitespace-nowrap text-xs">
                {new Date(o.createdAt).toLocaleString("es-AR")}
              </TableCell>
              <TableCell>
                <div className="text-sm font-medium">{o.customerName ?? "—"}</div>
                <div className="text-xs text-[#71717a]">{o.customerEmail ?? ""}</div>
              </TableCell>
              <TableCell className="font-semibold">
                {o.currency} {o.total.toLocaleString("es-AR")}
              </TableCell>
              <TableCell>
                <select
                  className="rounded-md border border-[#e4e4e7] bg-white px-2 py-1 text-sm"
                  value={o.status}
                  onChange={(e) => void changeStatus(o.id, e.target.value as OrderStatus)}
                >
                  {(Object.keys(labels) as OrderStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {labels[s]}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell>
                <div className="text-sm">{o.mpStatus ?? "—"}</div>
                {o.paymentId ? <div className="text-xs text-[#71717a]">{o.paymentId}</div> : null}
              </TableCell>
              <TableCell className="text-right text-xs text-[#a1a1aa]">{o.id.slice(-6)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
