import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FlashSaleSettingsForm } from "@/components/admin/FlashSaleSettingsForm";
import { FlashProductTable } from "@/components/admin/FlashProductTable";
import { getProductsWithRelations, getStoreSettings } from "@/lib/queries";

export default async function AdminSpecialOfferPage() {
  const [products, settings] = await Promise.all([getProductsWithRelations(), getStoreSettings()]);

  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    catLabel: p.category.label,
    basePrice: p.basePrice,
    flashPrice: p.flashPrice,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">روز تخفیف ویژه</h1>
        <p className="text-sm text-muted-foreground">
          یک کمپین محدود با تخفیف‌های بزرگ (تا ۷۰٪) برای یه روز خاص — جدا از تخفیف‌های همیشگی سایت
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>فعال‌سازی کمپین</CardTitle>
          <CardDescription>
            وقتی فعال باشه، بنر بالای سایت و بخش ویژه زیر هیرو نمایش داده می‌شه و برای محصولات انتخاب‌شده قیمت روز
            ویژه جایگزین قیمت عادی می‌شه
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FlashSaleSettingsForm settings={settings} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>محصولات روز ویژه</CardTitle>
          <CardDescription>
            محصولاتی که قیمت روز-ویژه دارن، هم تو بخش ویژه و هم تو کارت محصول با همون تخفیف نشون داده می‌شن
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FlashProductTable products={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
