import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getProductsWithRelations } from "@/lib/queries";
import { totalStock, isOffer } from "@/lib/derived";
import { toFa } from "@/lib/format";

export default async function AdminOverviewPage() {
  const products = await getProductsWithRelations();

  const outOfStock = products.filter((p) => totalStock(p.sizes) === 0);
  const lowStock = products.filter((p) => {
    const t = totalStock(p.sizes);
    return t > 0 && t <= 3;
  });
  const activeDiscounts = products.filter((p) => isOffer(p));

  const stats = [
    { label: "تعداد محصولات", value: products.length },
    { label: "تخفیف‌های فعال", value: activeDiscounts.length },
    { label: "موجودی کم", value: lowStock.length },
    { label: "ناموجود", value: outOfStock.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">نمای کلی</h1>
        <p className="text-sm text-muted-foreground">وضعیت فعلی فروشگاه انرژی</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-3xl">{toFa(s.value)}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>موجودی کم یا رو به اتمام</CardTitle>
          <CardDescription>محصولاتی که موجودیشون ۳ عدد یا کمتره</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <Link href={`/admin/products/${p.id}`} className="hover:underline font-medium">
                  {p.name}
                </Link>
                <span className="text-muted-foreground">{toFa(totalStock(p.sizes))} عدد</span>
              </li>
            ))}
            {lowStock.length === 0 && (
              <li className="py-6 text-sm text-muted-foreground text-center">موردی نیست</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
