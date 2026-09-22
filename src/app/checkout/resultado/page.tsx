import Link from "next/link";
import { OrderStatus } from "@prisma/client";

import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function isObjectId(value: string) {
  return /^[a-f0-9]{24}$/i.test(value);
}

const copy: Record<OrderStatus, { title: string; text: string }> = {
  PAID: {
    title: "Pago confirmado",
    text: "Mercado Pago acreditó la compra. Te contactamos para coordinar el envío o el retiro.",
  },
  CANCELLED: {
    title: "El pago no se completó",
    text: "Mercado Pago rechazó o canceló el pago. Podés volver al checkout e intentar de nuevo.",
  },
  PENDING: {
    title: "Estamos confirmando el pago",
    text: "Si ya pagaste, la confirmación puede tardar unos segundos. El estado definitivo queda en el pedido, no en esta pantalla.",
  },
  CONFIRMED: {
    title: "Pedido recibido",
    text: "Registramos la compra. Si el pago todavía no figura como acreditado, lo actualizamos cuando Mercado Pago lo confirme.",
  },
  SHIPPED: {
    title: "Pedido enviado",
    text: "El pago ya estaba confirmado y el pedido figura como enviado.",
  },
  DELIVERED: {
    title: "Pedido entregado",
    text: "Esta compra ya figura como entregada.",
  },
};

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string; external_reference?: string }>;
}) {
  const params = await searchParams;
  const orderId = (params.external_reference || params.pedido || "").trim();
  let status: OrderStatus | null = null;

  if (isObjectId(orderId) && process.env.DATABASE_URL?.trim()) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true },
      });
      status = order?.status ?? null;
    } catch {
      status = null;
    }
  }

  const message = status
    ? copy[status]
    : {
        title: "No encontramos el pago",
        text: "Volvé a la tienda. Si ya pagaste, el pedido queda registrado cuando Mercado Pago nos avisa.",
      };

  return (
    <main className="min-h-screen bg-[#f8fafb] text-[#1a1a2e]">
      <SiteHeader />
      <section className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-3xl font-black tracking-tight">{message.title}</h1>
        <p className="mt-3 text-sm leading-6 text-[#64748b]">{message.text}</p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-xl bg-[#f97316] px-5 py-3 text-sm font-bold text-white hover:bg-[#ea580c]"
        >
          Volver a la tienda
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
