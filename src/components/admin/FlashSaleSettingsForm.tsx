"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateFlashSaleSettings } from "@/app/admin/(dashboard)/special-offer/actions";
import type { StoreSettings } from "@/generated/prisma";

function toLocalInputValue(date: Date | null) {
  if (!date) return "";
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
}

export function FlashSaleSettingsForm({ settings }: { settings: StoreSettings }) {
  const [enabled, setEnabled] = useState(settings.flashSaleEnabled);
  const [endsAt, setEndsAt] = useState(toLocalInputValue(settings.flashSaleEndsAt));
  const [title, setTitle] = useState(settings.flashSaleTitle);
  const [subtitle, setSubtitle] = useState(settings.flashSaleSubtitle);
  const [bannerText, setBannerText] = useState(settings.flashSaleBannerText);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    if (enabled && !endsAt) {
      toast.error("برای فعال‌سازی، تاریخ و ساعت پایان رو مشخص کن");
      return;
    }
    startTransition(async () => {
      await updateFlashSaleSettings({
        flashSaleEnabled: enabled,
        flashSaleEndsAt: endsAt ? new Date(endsAt) : null,
        flashSaleTitle: title,
        flashSaleSubtitle: subtitle,
        flashSaleBannerText: bannerText,
      });
      toast.success("تنظیمات روز تخفیف ویژه ذخیره شد");
    });
  }

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center gap-2">
        <Switch id="flashSaleEnabled" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="flashSaleEnabled">فعال بودن روز تخفیف ویژه</Label>
      </div>

      <div className="space-y-2 max-w-xs">
        <Label htmlFor="flashSaleEndsAt">پایان کمپین</Label>
        <Input
          id="flashSaleEndsAt"
          type="datetime-local"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="flashSaleBannerText">متن بنر بالای سایت</Label>
        <Input id="flashSaleBannerText" value={bannerText} onChange={(e) => setBannerText(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="flashSaleTitle">عنوان بزرگ در بخش ویژه</Label>
          <Input id="flashSaleTitle" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="flashSaleSubtitle">توضیح کوتاه</Label>
          <Input id="flashSaleSubtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </div>
      </div>

      <Button type="button" onClick={handleSave} disabled={pending}>
        {pending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
      </Button>
    </div>
  );
}
