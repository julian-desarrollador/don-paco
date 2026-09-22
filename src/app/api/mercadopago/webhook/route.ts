import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { fetchMercadoPagoPayment, verifyMercadoPagoSignature } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";

function isObjectId(value: string) {
  return /^[a-f0-9]{24}$/i.test(value);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  let body: { type?: string; topic?: string; data?: { id?: string | number } } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const queryId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  const bodyId = body.data?.id != null ? String(body.data.id) : null;
  const dataId = queryId || bodyId;
  const topic = body.type || body.topic || url.searchParams.get("type") || url.searchParams.get("topic") || "";

  const valid = verifyMercadoPagoSignature({
    signatureHeader: request.headers.get("x-signature"),
    requestId: request.headers.get("x-request-id"),
    dataId,
  });
  if (!valid) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  if (!dataId || (topic && topic !== "payment")) {
    return NextResponse.json({ ok: true });
  }

  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json({ error: "Base no configurada" }, { status: 500 });
  }

  const payment = await fetchMercadoPagoPayment(dataId);
  const orderId = payment.external_reference?.trim() ?? "";
  if (!isObjectId(orderId)) {
    return NextResponse.json({ ok: true });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status === OrderStatus.PAID) {
    return NextResponse.json({ ok: true });
  }

  const mpStatus = payment.status ?? "unknown";
  const paymentId = payment.id != null ? String(payment.id) : dataId;
  let status: OrderStatus = order.status;
  if (mpStatus === "approved") status = OrderStatus.PAID;
  else if (mpStatus === "rejected" || mpStatus === "cancelled") status = OrderStatus.CANCELLED;

  await prisma.order.update({
    where: { id: order.id },
    data: { status, mpStatus, paymentId },
  });

  return NextResponse.json({ ok: true });
}
