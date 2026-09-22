import { createHmac, timingSafeEqual } from "node:crypto";

const MP_API = "https://api.mercadopago.com";

export function mercadopagoAccessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!token) throw new Error("Falta MERCADOPAGO_ACCESS_TOKEN");
  return token;
}

export function mercadopagoWebhookSecret() {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();
  if (!secret) throw new Error("Falta MERCADOPAGO_WEBHOOK_SECRET");
  return secret;
}

export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (!raw) throw new Error("Falta NEXT_PUBLIC_SITE_URL");
  return raw;
}

type PreferenceItem = {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

type CreatePreferenceInput = {
  orderId: string;
  items: PreferenceItem[];
  payer: { email: string; name: string; phone: string };
};

type PreferenceResponse = {
  id?: string;
  init_point?: string;
  message?: string;
  error?: string;
  cause?: Array<{ description?: string }>;
};

export async function createCheckoutPreference(input: CreatePreferenceInput) {
  const base = siteUrl();
  const resultUrl = `${base}/checkout/resultado?pedido=${encodeURIComponent(input.orderId)}`;
  const body = {
    items: input.items.map((item) => ({
      id: item.id,
      title: item.title.slice(0, 256),
      quantity: item.quantity,
      currency_id: "ARS",
      unit_price: item.unitPrice,
    })),
    payer: {
      email: input.payer.email,
      name: input.payer.name,
      phone: { number: input.payer.phone.replace(/\D/g, "").slice(0, 20) },
    },
    external_reference: input.orderId,
    notification_url: `${base}/api/mercadopago/webhook`,
    back_urls: {
      success: resultUrl,
      failure: resultUrl,
      pending: resultUrl,
    },
    auto_return: "approved",
    statement_descriptor: "DON PACO",
  };

  const response = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${mercadopagoAccessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = (await response.json()) as PreferenceResponse;
  if (!response.ok || !data.id || !data.init_point) {
    const detail = data.cause?.map((cause) => cause.description).filter(Boolean).join(" ") || data.message || data.error;
    throw new Error(detail || "Mercado Pago no pudo crear el pago");
  }

  return { preferenceId: data.id, initPoint: data.init_point };
}

export type MercadoPagoPayment = {
  id?: number | string;
  status?: string;
  external_reference?: string;
};

export async function fetchMercadoPagoPayment(paymentId: string): Promise<MercadoPagoPayment> {
  const response = await fetch(`${MP_API}/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${mercadopagoAccessToken()}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("No se pudo consultar el pago en Mercado Pago");
  }
  return (await response.json()) as MercadoPagoPayment;
}

function signatureDataId(value: string) {
  return /^[0-9]+$/.test(value) ? value : value.toLowerCase();
}

export function verifyMercadoPagoSignature(input: {
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string | null;
}) {
  if (!input.signatureHeader || !input.requestId || !input.dataId) return false;

  let ts = "";
  let hash = "";
  for (const part of input.signatureHeader.split(",")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key === "ts") ts = value;
    if (key === "v1") hash = value;
  }
  if (!ts || !hash) return false;

  const manifest = `id:${signatureDataId(input.dataId)};request-id:${input.requestId};ts:${ts};`;
  const expected = createHmac("sha256", mercadopagoWebhookSecret()).update(manifest).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(hash, "utf8");
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
