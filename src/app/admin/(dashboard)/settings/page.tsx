import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { SalesPauseSettingsForm } from "@/components/admin/SalesPauseSettingsForm";
import { getStoreSettings } from "@/lib/queries";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">تنظیمات فروشگاه</h1>
        <p className="text-sm text-muted-foreground">ظاهر سایت، آدرس، ساعات کاری و شبکه‌های اجتماعی</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>توقف موقت فروش</CardTitle>
          <CardDescription>برای وقتی که موقتاً نمی‌تونی سفارش‌های سایت رو جواب بدی</CardDescription>
        </CardHeader>
        <CardContent>
          <SalesPauseSettingsForm salesPaused={settings.salesPaused} salesPausedMessage={settings.salesPausedMessage} />
        </CardContent>
      </Card>

      <SettingsForm settings={settings} />
    </div>
  );
}
