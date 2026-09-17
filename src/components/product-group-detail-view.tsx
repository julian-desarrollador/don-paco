import Image from "next/image";
import Link from "next/link";
import { MapPin, Truck } from "lucide-react";
import GroupVariantLines from "@/components/group-variant-lines";
import PawIcon from "@/components/paw-icon";
import ProductInfoTabs from "@/components/product-info-tabs";
import RelatedProducts from "@/components/related-products";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { categoryBadgeLabel } from "@/lib/category-tree";
import { formatArs } from "@/lib/products";
import type { ListingEntry, Product } from "@/lib/product-types";

type GroupModel = Extract<ListingEntry, { type: "group" }>;

type ProductGroupDetailViewProps = {
  group: GroupModel;
  relatedProducts: Product[];
};

export default function ProductGroupDetailView({ group, relatedProducts }: ProductGroupDetailViewProps) {
  const categoryLabel = categoryBadgeLabel(group.categoryId);
  const zoomOutGroupSlugs = new Set(["sieger-gato-kitten"]);
  const zoomInGroupSlugs = new Set(["agility-adulto", "agility-cordero", "agility-adulto-raza-peq"]);
  const imageFitClass = zoomOutGroupSlugs.has(group.groupSlug)
    ? "object-contain p-7"
    : zoomInGroupSlugs.has(group.groupSlug)
      ? "object-contain p-3"
      : "object-contain p-5";
  const brand = group.variants[0]?.brand;

  return (
    <main className="min-h-screen bg-[#f8fafb] text-[#1a1a2e]">
      <SiteHeader />

      <section className="mx-auto w-full max-w-[1440px] px-4 py-8 md:px-6">
        <nav className="mb-6 text-sm text-[#64748b]">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-[#029f9c]">
                Inicio
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/" className="hover:text-[#029f9c]">
                Productos
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-[#1a1a2e]">{group.displayName}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="relative mb-4 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
              <div className="relative aspect-[4/5] w-full sm:aspect-[5/6] md:min-h-[360px]">
                {group.imageSrc ? (
                  <Image
                    src={group.imageSrc}
                    alt={group.displayName}
                    fill
                    className={imageFitClass}
                    priority
                    sizes="(max-width: 1024px) 100vw, 640px"
                  />
                ) : (
                  <div className="flex h-80 items-center justify-center bg-[#f8fafb]">
                    <PawIcon className="h-20 w-20 text-[#029f9c]" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase">
              {brand ? <span className="rounded-full bg-[#e6f7f6] px-2.5 py-1 text-[#017d7a]">{brand}</span> : null}
              <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[#64748b]">{categoryLabel}</span>
              <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[#64748b]">Varias presentaciones</span>
            </div>

            <h1 className="mb-2 text-2xl font-extrabold leading-tight text-[#1a1a2e] md:text-3xl">{group.displayName}</h1>
            <p className="mb-4 text-[15px] leading-7 text-[#64748b]">
              {group.groupDescription?.trim() ? (
                <span className="whitespace-pre-wrap">{group.groupDescription.trim()}</span>
              ) : (
                <>
                  Elegí el formato (presentación). Con tarjeta de crédito se incluye 10% sobre el precio común de cada
                  variante.
                </>
              )}
            </p>

            <div className="mb-6 rounded-2xl bg-[#f8fafb] p-4">
              <p className="text-3xl font-extrabold text-[#1a1a2e]">Desde {formatArs(group.fromPrice)}</p>
              <p className="mt-1 text-sm text-[#64748b]">Desde {formatArs(group.fromCashPrice)} efectivo o transferencia</p>
            </div>

            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#029f9c]">Formatos</h2>
            <GroupVariantLines variants={group.variants} />

            <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafb] p-3">
                <Truck className="mb-1 h-4 w-4 text-[#029f9c]" />
                <p className="font-semibold">Envíos a todo el país</p>
                <p className="mt-1 text-xs text-[#64748b]">Recibí tu pedido en 24/72 hs.</p>
              </div>
              <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafb] p-3">
                <MapPin className="mb-1 h-4 w-4 text-[#029f9c]" />
                <p className="font-semibold">Retiro en local</p>
                <p className="mt-1 text-xs text-[#64748b]">Roca 473, Gral. Fernández Oro</p>
              </div>
            </div>
          </div>
        </div>

        <ProductInfoTabs
          description={
            group.groupDescription?.trim() ||
            "Elegí la presentación que mejor se adapte a tu mascota. Los precios varían según el formato."
          }
          specs={[
            { label: "Marca", value: brand || "—" },
            { label: "Categoría", value: categoryLabel },
            { label: "Presentaciones", value: String(group.variants.length) },
            { label: "Desde", value: formatArs(group.fromPrice) },
          ]}
        />

        <RelatedProducts products={relatedProducts} />
      </section>

      <SiteFooter />
    </main>
  );
}
