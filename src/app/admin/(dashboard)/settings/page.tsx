import { SettingsForm } from "@/components/admin/SettingsForm";
import { getStoreSettings } from "@/lib/queries";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">تنظیمات فروشگاه</h1>
        <p className="text-sm text-muted-foreground">ظاهر سایت، آدرس، ساعات کاری و شبکه‌های اجتماعی</p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
