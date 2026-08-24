import { getSellScreenData } from "@/lib/queries";
import { toSellProduct, toSaleLogEntry } from "@/lib/sellViewModel";
import { SellScreen } from "@/components/sell/SellScreen";

export const dynamic = "force-dynamic";

export default async function SellPage() {
  const { categories, products, recentSales, todaySalesCount } = await getSellScreenData();

  return (
    <SellScreen
      categories={categories.map((c) => ({ key: c.key, label: c.label }))}
      products={products.map(toSellProduct)}
      initialLog={recentSales.map(toSaleLogEntry)}
      initialTodayCount={todaySalesCount}
    />
  );
}
