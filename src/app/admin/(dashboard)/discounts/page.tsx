import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CountdownSettingsForm } from "@/components/admin/CountdownSettingsForm";
import { DiscountTable } from "@/components/admin/DiscountTable";
import { getProductsWithRelations, getStoreSettings } from "@/lib/queries";

export default async function AdminDiscountsPage() {
  const [products, settings] = await Promise.all([getProductsWithRelations(), getStoreSettings()]);

  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    catLabel: p.category.label,
    basePrice: p.basePrice,
    discountPrice: p.discountPrice,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">تخفیف‌ها</h1>
        <p className="text-sm text-muted-foreground">مدیریت قیمت تخفیف‌دار محصولات و شمارش معکوس سایت</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>شمارش معکوس</CardTitle>
          <CardDescription>بنر «موجودی الان» در سایت این تاریخ رو نشون می‌ده</CardDescription>
        </CardHeader>
        <CardContent>
          <CountdownSettingsForm discountEndsAt={settings.discountEndsAt} showCountdown={settings.showCountdown} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>قیمت تخفیف‌دار محصولات</CardTitle>
          <CardDescription>برای هر محصول یک قیمت تخفیف‌خورده تنظیم کن، یا با انتخاب چندتایی یک درصد رو یکجا اعمال کن</CardDescription>
        </CardHeader>
        <CardContent>
          <DiscountTable products={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
