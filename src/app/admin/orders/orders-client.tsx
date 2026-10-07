"use client";

import type { Order } from "@prisma/client";
import { OrderStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateOrderStatus } from "@/actions/order";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatArs } from "@/lib/products";

const labels: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

type OrderLine = {
  name?: string;
  quantity?: number;
};

function orderLines(items: Order["items"]): OrderLine[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const line = item as OrderLine;
    return [{ name: line.name, quantity: line.quantity }];
  });
}

function StatusSelect({
  order,
  onChange,
  className,
}: {
  order: Order;
  onChange: (id: string, status: OrderStatus) => void;
  className?: string;
}) {
  return (
    <select
      className={className}
      value={order.status}
      onChange={(event) => onChange(order.id, event.target.value as OrderStatus)}
      aria-label={`Estado del pedido de ${order.customerName ?? "cliente"}`}
    >
      {(Object.keys(labels) as OrderStatus[]).map((status) => (
        <option key={status} value={status}>
          {labels[status]}
        </option>
      ))}
    </select>
  );
}

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

  const selectClass = "w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2.5 text-sm";

  return (
    <>
      <ul className="space-y-3 md:hidden">
        {orders.map((order) => {
          const lines = orderLines(order.items);
          return (
            <li key={order.id} className="rounded-2xl border border-[#e4e4e7] bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs text-[#71717a]">{new Date(order.createdAt).toLocaleString("es-AR")}</p>
                <p className="text-sm font-black text-[#18181b]">{formatArs(order.total)}</p>
              </div>
              <p className="mt-2 text-base font-bold text-[#18181b]">{order.customerName ?? "Sin nombre"}</p>
              {order.customerEmail ? <p className="text-sm text-[#52525b]">{order.customerEmail}</p> : null}
              {order.phone ? <p className="text-sm text-[#52525b]">{order.phone}</p> : null}
              {order.address ? <p className="mt-2 text-sm leading-5 text-[#3f3f46]">{order.address}</p> : null}
              {lines.length > 0 ? (
                <ul className="mt-3 space-y-1 border-t border-[#f4f4f5] pt-3 text-sm text-[#3f3f46]">
                  {lines.map((line, index) => (
                    <li key={`${order.id}-${index}`}>
                      {line.quantity ? `${line.quantity} × ` : ""}
                      {line.name ?? "Producto"}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#71717a]">Estado</p>
                <StatusSelect order={order} onChange={changeStatus} className={selectClass} />
              </div>
              <p className="mt-3 text-xs text-[#71717a]">
                Mercado Pago: {order.mpStatus ?? "sin aviso"}
                {order.paymentId ? ` · ${order.paymentId}` : ""}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="hidden rounded-xl border border-[#e4e4e7] bg-white shadow-sm md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Mercado Pago</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="whitespace-nowrap text-xs">
                  {new Date(order.createdAt).toLocaleString("es-AR")}
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{order.customerName ?? "—"}</div>
                  <div className="text-xs text-[#71717a]">{order.customerEmail ?? ""}</div>
                  {order.phone ? <div className="text-xs text-[#71717a]">{order.phone}</div> : null}
                </TableCell>
                <TableCell className="font-semibold">{formatArs(order.total)}</TableCell>
                <TableCell>
                  <StatusSelect
                    order={order}
                    onChange={changeStatus}
                    className="rounded-md border border-[#e4e4e7] bg-white px-2 py-1 text-sm"
                  />
                </TableCell>
                <TableCell>
                  <div className="text-sm">{order.mpStatus ?? "—"}</div>
                  {order.paymentId ? <div className="text-xs text-[#71717a]">{order.paymentId}</div> : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
