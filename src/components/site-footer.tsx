import Link from "next/link";
import { PawPrint } from "lucide-react";
import NewsletterForm from "@/components/newsletter-form";

const footerColumns = [
  {
    title: "Tienda",
    links: [
      { label: "Alimento perro", href: "/?categoria=mascota-perro-alimento-seco" },
      { label: "Alimento gato", href: "/?categoria=mascota-gato-alimento-seco" },
      { label: "Accesorios", href: "/?categoria=general-accesorios-collares-correas" },
      { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { label: "Contacto", href: "#contacto" },
      { label: "Envíos", href: "/preguntas-frecuentes" },
      { label: "Cambios y devoluciones", href: "/preguntas-frecuentes" },
      { label: "Ayuda", href: "/preguntas-frecuentes" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre Don Paco", href: "/" },
      { label: "Nuestro local", href: "#contacto" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer id="contacto" className="mt-16 bg-[#1a1a2e] text-white">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
              <PawPrint className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">Don Paco</span>
          </div>
          <p className="mb-5 max-w-xs text-sm leading-7 text-white/70">
            El pet shop de Río Negro para consentir a tu mascota con productos de calidad y atención personalizada.
          </p>
          <p className="text-sm text-white/70">Roca 473, Gral. Fernández Oro — RN</p>
          <div className="mt-5 flex items-center gap-3">
            <a href="#" aria-label="Instagram" className="rounded-full border border-white/15 p-2 text-white/80 hover:bg-white/10 hover:text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3Zm0 7.8A3.1 3.1 0 1 1 12 8.9a3.1 3.1 0 0 1 0 6.2Zm6-7.9a1.1 1.1 0 1 1-2.1 0 1.1 1.1 0 0 1 2.1 0Z" />
                <path d="M12 2.2h4.1c3.2 0 5.7 2.5 5.7 5.7V16c0 3.2-2.5 5.7-5.7 5.7H7.9A5.7 5.7 0 0 1 2.2 16V7.9c0-3.2 2.5-5.7 5.7-5.7H12Zm0 1.6H7.9a4.1 4.1 0 0 0-4.1 4.1V16A4.1 4.1 0 0 0 7.9 20h8.2a4.1 4.1 0 0 0 4.1-4.1V7.9a4.1 4.1 0 0 0-4.1-4.1H12Z" />
              </svg>
            </a>
            <a href="#" aria-label="Facebook" className="rounded-full border border-white/15 p-2 text-white/80 hover:bg-white/10 hover:text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M13.6 8.5V7.1c0-.7.5-.9.8-.9h2.1V3h-2.9c-3.2 0-3.9 2.4-3.9 4v1.5H7.8v3.5h1.9V21h3.9v-9h2.6l.4-3.5h-3z" />
              </svg>
            </a>
          </div>
          <p className="mt-6 text-sm font-semibold">Novedades y ofertas</p>
          <NewsletterForm />
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">{column.title}</h3>
            <ul className="space-y-3 text-sm text-white/70">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-white/55">© 2026 Don Paco Pet Shop. Todos los derechos reservados.</p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide">
            {["Visa", "Mastercard", "Mercado Pago", "Transferencia"].map((method) => (
              <span key={method} className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-white/80">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
