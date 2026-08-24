import { StorefrontApp } from "@/components/storefront/StorefrontApp";
import { getStorefrontData } from "@/lib/queries";
import { isFlashSaleActive } from "@/lib/derived";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { settings, categories, products } = await getStorefrontData();
  const flashActive = isFlashSaleActive(settings);

  return (
    <StorefrontApp settings={settings} categories={categories} products={products} flashActive={flashActive} />
  );
}
