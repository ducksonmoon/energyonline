import { StorefrontApp } from "@/components/storefront/StorefrontApp";
import { getStorefrontData } from "@/lib/queries";
import { isFlashSaleActive } from "@/lib/derived";
import { absoluteUrl } from "@/lib/site";

// Cached for up to a minute so a traffic spike hits this render once, not
// once per visitor — admin actions (sales, stock/price edits) already call
// revalidatePath("/") on every change, so real updates still show instantly.
// This is just the staleness ceiling for anything that slips through.
export const revalidate = 60;

export default async function Home() {
  const { settings, categories, products } = await getStorefrontData();
  const flashActive = isFlashSaleActive(settings);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: "انرژی",
    url: absoluteUrl("/"),
    telephone: settings.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: "ساری",
      addressCountry: "IR",
    },
    sameAs: [`https://instagram.com/${settings.instagramHandle}`, `https://t.me/${settings.telegramHandle}`],
  };

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StorefrontApp settings={settings} categories={categories} products={products} flashActive={flashActive} />
    </>
  );
}
