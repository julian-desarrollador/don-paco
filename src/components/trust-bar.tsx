import { CreditCard, Headphones, MapPin, Truck } from "lucide-react";

const ITEMS = [
  { icon: Truck, title: "Envíos a todo el país", text: "Recibí en 24/72 hs" },
  { icon: MapPin, title: "Retiro en local", text: "Roca 473, Gral. Fernández Oro" },
  { icon: CreditCard, title: "Medios de pago", text: "Tarjeta, MP y transferencia" },
  { icon: Headphones, title: "Atención personalizada", text: "Te ayudamos a elegir" },
];

export default function TrustBar() {
  return (
    <section className="border-b border-[#e2e8f0] bg-white" aria-label="Beneficios de comprar en Don Paco">
      <ul className="no-scrollbar mx-auto flex max-w-[1440px] gap-3 overflow-x-auto px-4 py-4 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-6">
        {ITEMS.map((item) => (
          <li
            key={item.title}
            className="flex min-w-[220px] items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafb] px-4 py-3 md:min-w-0"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e6f7f6] text-[#017d7a]">
              <item.icon className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <p className="text-sm font-bold text-[#1a1a2e]">{item.title}</p>
              <p className="text-xs text-[#64748b]">{item.text}</p>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
