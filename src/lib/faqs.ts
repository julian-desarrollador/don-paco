export type FaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
};

export const faqItems: FaqItem[] = [
  {
    id: "envio-coordinacion",
    category: "Envios",
    question: "¿Cómo se coordina el envío?",
    answer:
      "Luego de confirmar la compra te contactamos por WhatsApp para coordinar día, franja horaria y datos finales de entrega.",
    keywords: ["entrega", "coordinar", "whatsapp", "pedido"],
  },
  {
    id: "envio-mar-del-plata",
    category: "Envios",
    question: "¿Hacen envíos a Río Negro?",
    answer:
      "Sí, realizamos envíos en Río Negro y otras zonas. El costo y la coordinación se confirman al finalizar la compra.",
    keywords: ["rio negro", "envios", "entrega", "costo de envio"],
  },
  {
    id: "tiempos-entrega",
    category: "Envios",
    question: "¿Cuál es el tiempo de entrega?",
    answer:
      "Depende de la zona y disponibilidad del producto. Normalmente coordinamos entregas dentro de las 24 a 72 horas hábiles.",
    keywords: ["demora", "plazo", "horas", "dias"],
  },
  {
    id: "medios-pago",
    category: "Pagos",
    question: "¿Qué medios de pago aceptan?",
    answer:
      "Aceptamos transferencias y pagos online. También podés consultar promociones vigentes al momento de confirmar tu compra.",
    keywords: ["tarjeta", "transferencia", "mercadopago", "pago"],
  },
  {
    id: "comprobante",
    category: "Pagos",
    question: "¿Recibo comprobante de compra?",
    answer:
      "Sí. Al finalizar la operación se genera comprobante y además te enviamos confirmación por el canal de contacto indicado.",
    keywords: ["factura", "ticket", "comprobante", "confirmacion"],
  },
  {
    id: "modificar-pedido",
    category: "Pedidos",
    question: "¿Puedo modificar mi pedido después de pagar?",
    answer:
      "Sí, mientras no haya sido despachado. Escribinos por WhatsApp cuanto antes y te ayudamos con el cambio.",
    keywords: ["editar", "cambiar", "pedido", "despacho"],
  },
  {
    id: "cancelar-pedido",
    category: "Pedidos",
    question: "¿Puedo cancelar una compra?",
    answer:
      "Si el pedido todavía no salió a reparto, podés solicitar cancelación. Cada caso se revisa para resolverlo lo más rápido posible.",
    keywords: ["devolucion", "cancelacion", "reembolso"],
  },
  {
    id: "stock",
    category: "Productos",
    question: "¿El stock de la web está actualizado?",
    answer:
      "Sí, se actualiza de forma periódica. Si un producto se agota justo al comprar, te ofrecemos alternativa o reintegro.",
    keywords: ["disponible", "agotado", "inventario"],
  },
  {
    id: "talles-medidas",
    category: "Productos",
    question: "¿Cómo elijo talle o tamaño correcto?",
    answer:
      "En cada producto detallamos medidas o variantes. Si tenés dudas, te asesoramos antes de comprar para evitar errores.",
    keywords: ["talle", "tamano", "medidas", "asesoramiento"],
  },
  {
    id: "cambios-devoluciones",
    category: "Cambios y devoluciones",
    question: "¿Hacen cambios o devoluciones?",
    answer:
      "Sí. Si el producto llega con falla o no coincide con lo pedido, coordinamos cambio o devolución según condición del artículo.",
    keywords: ["garantia", "falla", "devolver", "cambio"],
  },
  {
    id: "cuenta-obligatoria",
    category: "Cuenta",
    question: "¿Necesito crear una cuenta para comprar?",
    answer:
      "No es obligatorio. Podés completar el checkout con tus datos y finalizar la compra sin registro previo.",
    keywords: ["registro", "usuario", "crear cuenta"],
  },
  {
    id: "contacto-soporte",
    category: "Soporte",
    question: "¿Cómo me contacto con soporte?",
    answer:
      "Podés escribirnos por WhatsApp o desde la sección de contacto. Respondemos de lunes a sábado en horario comercial.",
    keywords: ["ayuda", "soporte", "contacto", "whatsapp"],
  },
];
