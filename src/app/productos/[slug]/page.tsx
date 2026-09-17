import Image from "next/image";
import Link from "next/link";
import { MapPin, RefreshCw, Truck } from "lucide-react";
import PawIcon from "@/components/paw-icon";
import ProductDetailActions from "@/components/product-detail-actions";
import ProductInfoTabs from "@/components/product-info-tabs";
import RelatedProducts from "@/components/related-products";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { resolveProductGroupSlug } from "@/lib/product-group-slug";
import { formatArs, formatPricePerKg } from "@/lib/products";
import {
  getGroupListingIfExists,
  getProductBySlug,
  getProducts,
  listAllProductPageSlugs,
} from "@/lib/products-build";
import { resolveGroupSlugRedirect } from "@/lib/group-slug-redirect";
import ProductGroupDetailView from "@/components/product-group-detail-view";
import { notFound, permanentRedirect, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await listAllProductPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const canonicalGroupSlug = await resolveGroupSlugRedirect(slug);
  if (canonicalGroupSlug !== slug) {
    permanentRedirect(`/productos/${encodeURIComponent(canonicalGroupSlug)}`);
  }
  const extraZoomOutProductSlugs = new Set(["sieger-pouch-perro"]);
  const zoomInProductSlugs = new Set(["upper-castrado-x1-5"]);

  const products = await getProducts();
  const group = await getGroupListingIfExists(slug);
  if (group) {
    const exclude = new Set(group.variants.map((v) => v.slug));
    const relatedProducts = products
      .filter((p) => !exclude.has(p.slug))
      .sort((a, b) => {
        const aMatch = a.categoryId === group.categoryId ? 1 : 0;
        const bMatch = b.categoryId === group.categoryId ? 1 : 0;
        return bMatch - aMatch;
      })
      .slice(0, 8);
    return <ProductGroupDetailView group={group} relatedProducts={relatedProducts} />;
  }

  const product = await getProductBySlug(slug);
  const redirectGroup = product ? resolveProductGroupSlug(product) : undefined;
  if (redirectGroup) {
    redirect(`/productos/${redirectGroup}`);
  }

  if (!product) {
    notFound();
  }

  const relatedProducts = products
    .filter((item) => item.slug !== product.slug)
    .sort((a, b) => {
      const aMatch = a.categoryId === product.categoryId ? 1 : 0;
      const bMatch = b.categoryId === product.categoryId ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, 8);

  const perKg = formatPricePerKg(product.price, [product.name, ...product.sizes]);

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
            <li className="font-semibold text-[#1a1a2e]">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-4 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white p-4">
              <div className="relative flex min-h-64 items-center justify-center sm:min-h-80 md:min-h-[420px]">
                {product.imageSrc ? (
                  <Image
                    src={product.imageSrc}
                    alt={product.name}
                    width={720}
                    height={720}
                    className={
                      extraZoomOutProductSlugs.has(product.slug)
                        ? "max-h-[420px] w-auto max-w-full object-contain p-10"
                        : zoomInProductSlugs.has(product.slug)
                          ? "max-h-[420px] w-auto max-w-full object-contain p-2"
                          : "max-h-[420px] w-auto max-w-full object-contain p-6"
                    }
                    priority
                  />
                ) : (
                  <PawIcon className="h-20 w-20 text-[#029f9c] md:h-24 md:w-24" />
                )}
              </div>
            </div>

            {product.imageSrc ? (
              <div className="grid max-w-md grid-cols-4 gap-3">
                <div className="relative flex h-24 items-center justify-center overflow-hidden rounded-xl border-2 border-[#029f9c] bg-white">
                  <Image
                    src={product.imageSrc}
                    alt={`Miniatura de ${product.name}`}
                    width={120}
                    height={120}
                    className="max-h-[88px] w-auto object-contain p-1"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase">
              {product.brand ? (
                <span className="rounded-full bg-[#e6f7f6] px-2.5 py-1 text-[#017d7a]">{product.brand}</span>
              ) : null}
              <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[#64748b]">{product.category}</span>
              <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[#64748b]">Stock: {product.stock}</span>
            </div>

            <h1 className="mb-2 text-2xl font-extrabold leading-tight text-[#1a1a2e] md:text-3xl">{product.name}</h1>
            <p className="mb-6 text-[15px] leading-7 text-[#64748b]">{product.shortDescription}</p>

            <div className="mb-6 rounded-2xl bg-[#f8fafb] p-4">
              <p className="text-3xl font-extrabold text-[#1a1a2e]">{formatArs(product.price)}</p>
              <p className="mt-1 text-sm text-[#64748b]">{formatArs(product.cashPrice)} efectivo o transferencia</p>
              {perKg ? <p className="mt-1 text-xs font-medium text-[#017d7a]">{perKg}</p> : null}
              <p className="mt-3 text-xs leading-relaxed text-[#64748b]">
                Pago con tarjeta: incluye el 10% sobre el precio común ({formatArs(product.precioLista)}).
              </p>
            </div>

            <ProductDetailActions
              slug={product.slug}
              name={product.name}
              price={product.price}
              colors={product.colors}
              sizes={product.sizes}
              imageSrc={product.imageSrc}
            />

            <div className="mt-6 grid gap-3 text-sm text-[#334155] sm:grid-cols-3">
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
              <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafb] p-3">
                <RefreshCw className="mb-1 h-4 w-4 text-[#029f9c]" />
                <p className="font-semibold">Cambios</p>
                <p className="mt-1 text-xs text-[#64748b]">Tenés 30 días para cambios.</p>
              </div>
            </div>
          </div>
        </div>

        <ProductInfoTabs
          description={product.description}
          bullets={[
            "Materiales resistentes y fáciles de limpiar.",
            "Diseño pensado para confort diario.",
            "Excelente relación precio/calidad.",
            "Producto recomendado por clientes frecuentes.",
          ]}
          specs={[
            { label: "Marca", value: product.brand || "—" },
            { label: "Categoría", value: product.category },
            { label: "Stock", value: `${product.stock} unidades` },
            { label: "Tamaños", value: product.sizes.length ? product.sizes.join(", ") : "No aplica" },
            { label: "Colores", value: product.colors.length ? product.colors.join(", ") : "No aplica" },
          ]}
        />

        <RelatedProducts products={relatedProducts} />
      </section>

      <SiteFooter />
    </main>
  );
}
