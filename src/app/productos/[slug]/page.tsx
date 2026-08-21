import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import PawIcon from "@/components/paw-icon";
import ProductGroupDetailView from "@/components/product-group-detail-view";
import ProductDetailActions from "@/components/product-detail-actions";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { resolveProductGroupSlug } from "@/lib/product-group-slug";
import { formatArs } from "@/lib/products";
import { getDetailHrefForProductSlug } from "@/lib/product-routing";
import {
  getGroupListingIfExists,
  getProductBySlug,
  getProducts,
  listAllProductPageSlugs,
} from "@/lib/products-build";
import { resolveGroupSlugRedirect } from "@/lib/group-slug-redirect";

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
      .slice(0, 3);
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
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-white text-[#3f3f3f]">
      <SiteHeader />

      <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
        <nav className="mb-6 text-sm text-[#8a8a8a]">
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
            <li className="font-semibold text-[#666]">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-4 rounded-2xl border border-[#e6e6e6] bg-gradient-to-br from-[#f6f6f6] to-[#ececec] p-6">
              <div className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase">
                <span className="rounded-full bg-[#e4077d] px-2 py-1 text-white">2x1</span>
                <span className="rounded-full bg-[#029f9c] px-2 py-1 text-white">Envio gratis</span>
              </div>
              <div className="relative flex h-64 items-center justify-center rounded-xl bg-white/80 sm:h-80 md:h-[360px]">
                {product.imageSrc ? (
                  <Image
                    src={product.imageSrc}
                    alt={product.name}
                    width={720}
                    height={720}
                    className={
                      extraZoomOutProductSlugs.has(product.slug)
                        ? "max-h-full w-auto max-w-full object-contain p-10"
                        : zoomInProductSlugs.has(product.slug)
                          ? "max-h-full w-auto max-w-full object-contain p-2"
                          : "max-h-full w-auto max-w-full object-contain p-6"
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
                <div className="relative flex h-24 items-center justify-center rounded-lg border border-[#029f9c] bg-white">
                  <Image
                    src={product.imageSrc}
                    alt={`Miniatura de ${product.name}`}
                    width={120}
                    height={120}
                    className="max-h-[88px] w-auto object-contain p-1"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((thumb) => (
                  <button
                    key={thumb}
                    type="button"
                    className="flex h-24 items-center justify-center rounded-lg border border-[#e2e2e2] bg-[#f7f7f7] text-3xl transition-colors hover:border-[#029f9c]"
                  >
                    <PawIcon className="h-10 w-10 text-[#029f9c]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#e6e6e6] bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase">
              <span className="rounded-full bg-[#029f9c]/15 px-2.5 py-1 text-[#029f9c]">{product.category}</span>
              <span className="rounded-full bg-[#f0f0f0] px-2.5 py-1 text-[#777]">Stock: {product.stock}</span>
            </div>

            <h1 className="mb-2 text-2xl font-black uppercase leading-tight text-[#555] md:text-3xl">
              {product.name}
            </h1>
            <p className="mb-6 text-[15px] leading-7 text-[#707070]">{product.shortDescription}</p>

            <div className="mb-6 rounded-xl bg-[#f7f7f7] p-4">
              <p className="text-3xl font-black text-[#029f9c]">{formatArs(product.price)}</p>
              <p className="mt-1 text-sm text-[#7a7a7a]">
                {formatArs(product.cashPrice)} efectivo o transferencia
              </p>
              <p className="mt-3 text-xs leading-relaxed text-[#8a8a8a]">
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

            <div className="grid gap-3 text-sm text-[#666] sm:grid-cols-2">
              <div className="rounded-lg border border-[#e4e4e4] bg-[#fafafa] p-3">
                <p className="font-semibold text-[#555]">Envíos a todo el país</p>
                <p className="mt-1 text-xs text-[#7d7d7d]">Recibí tu pedido en 24/72 hs.</p>
              </div>
              <div className="rounded-lg border border-[#e4e4e4] bg-[#fafafa] p-3">
                <p className="font-semibold text-[#555]">Cambios garantizados</p>
                <p className="mt-1 text-xs text-[#7d7d7d]">Tenés 30 días para cambios.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_330px]">
          <section className="rounded-2xl border border-[#e6e6e6] bg-white p-6">
            <h2 className="mb-3 text-lg font-extrabold uppercase tracking-wide text-[#029f9c]">
              Descripción del producto
            </h2>
            <p className="mb-5 text-[15px] leading-7 text-[#666]">{product.description}</p>
            <ul className="grid gap-2 text-sm text-[#666] sm:grid-cols-2">
              <li>• Materiales resistentes y faciles de limpiar.</li>
              <li>• Diseño pensado para confort diario.</li>
              <li>• Excelente relación precio/calidad.</li>
              <li>• Producto recomendado por clientes frecuentes.</li>
            </ul>
          </section>

          <aside className="rounded-2xl border border-[#e6e6e6] bg-[#f9f9f9] p-6">
            <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-[#029f9c]">
              Ficha técnica
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-[#e5e5e5] pb-2">
                <dt className="text-[#8a8a8a]">Categoría</dt>
                <dd className="font-semibold text-[#555]">{product.category}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-[#e5e5e5] pb-2">
                <dt className="text-[#8a8a8a]">Stock</dt>
                <dd className="font-semibold text-[#555]">{product.stock} unidades</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-[#e5e5e5] pb-2">
                <dt className="text-[#8a8a8a]">Tamaños</dt>
                <dd className="font-semibold text-[#555]">
                  {product.sizes.length ? product.sizes.join(", ") : "No aplica"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[#8a8a8a]">Colores</dt>
                <dd className="text-right font-semibold text-[#555]">
                  {product.colors.length ? product.colors.join(", ") : "No aplica"}
                </dd>
              </div>
            </dl>
          </aside>
        </div>

        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-wide text-[#029f9c]">
              También te puede interesar
            </h2>
            <Link href="/" className="text-sm font-semibold text-[#e4077d] hover:underline">
              Ver todos
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {relatedProducts.map((item) => (
              <article
                key={item.slug}
                className="rounded-xl border border-[#e2e2e2] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative mb-3 flex h-40 items-center justify-center rounded-lg bg-gradient-to-br from-[#f5f5f5] to-[#ececec]">
                  {item.imageSrc ? (
                    <Image
                      src={item.imageSrc}
                      alt={item.name}
                      width={200}
                      height={200}
                      className="max-h-[140px] w-auto object-contain p-2"
                    />
                  ) : (
                    <PawIcon className="h-14 w-14 text-[#029f9c]" />
                  )}
                </div>
                <h3 className="mb-2 text-base font-extrabold uppercase leading-tight text-[#777]">
                  <Link href={`/productos/${getDetailHrefForProductSlug(item.slug, item.groupSlug)}`} className="hover:text-[#029f9c]">
                    {item.name}
                  </Link>
                </h3>
                <p className="text-xl font-black text-[#029f9c]">{formatArs(item.price)}</p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <SiteFooter />
    </main>
  );
}
