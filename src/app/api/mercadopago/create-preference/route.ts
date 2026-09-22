import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createCheckoutPreference } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";
import { getProductBySlug } from "@/lib/products-build";

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        quantity: z.number().int().positive().max(99),
      }),
    )
    .min(1)
    .max(40),
  customer: z.object({
    fullName: z.string().trim().min(1).max(120),
    phone: z.string().trim().min(8).max(30),
    email: z.string().trim().email().max(160),
    address: z.string().trim().min(1).max(300),
    notes: z.string().max(500).optional(),
  }),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "El pedido no es válido." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisá los datos del checkout e intentá de nuevo." }, { status: 400 });
  }

  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json({ error: "La tienda no puede guardar pedidos en este momento." }, { status: 500 });
  }

  const merged = new Map<string, number>();
  for (const item of parsed.data.items) {
    merged.set(item.id, (merged.get(item.id) ?? 0) + item.quantity);
  }

  const lines: Array<{ slug: string; name: string; quantity: number; unitPrice: number }> = [];
  for (const [slug, quantity] of merged) {
    if (quantity > 99) {
      return NextResponse.json({ error: "La cantidad de un producto supera el máximo." }, { status: 400 });
    }
    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Hay un producto que ya no está disponible." }, { status: 400 });
    }
    lines.push({
      slug: product.slug,
      name: product.name,
      quantity,
      unitPrice: product.price,
    });
  }

  const total = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const { customer } = parsed.data;

  const order = await prisma.order.create({
    data: {
      customerName: customer.fullName,
      customerEmail: customer.email,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes?.trim() || null,
      status: OrderStatus.PENDING,
      total,
      currency: "ARS",
      items: lines,
    },
  });

  try {
    const preference = await createCheckoutPreference({
      orderId: order.id,
      items: lines.map((line) => ({
        id: line.slug,
        title: line.name,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
      payer: {
        email: customer.email,
        name: customer.fullName,
        phone: customer.phone,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { preferenceId: preference.preferenceId },
    });

    return NextResponse.json({ redirectUrl: preference.initPoint });
  } catch (error) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.CANCELLED, mpStatus: "preference_error" },
    });
    const message = error instanceof Error ? error.message : "No se pudo iniciar el pago.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
