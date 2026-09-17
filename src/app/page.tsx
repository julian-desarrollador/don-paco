import HomeClient from "./home-client";
import { getSiteSettings } from "@/lib/site-settings";
import { isCategoryId } from "@/lib/category-tree";
import { buildListingEntries } from "@/lib/products-build";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const params = await searchParams;
  const initialListing = await buildListingEntries();
  const site = getSiteSettings();
  const initialCategory = params.categoria && isCategoryId(params.categoria) ? params.categoria : "Todas";
  const initialQuery = params.q?.trim() ?? "";
  return (
    <HomeClient
      initialListing={initialListing}
      site={site}
      initialCategory={initialCategory}
      initialQuery={initialQuery}
    />
  );
}
