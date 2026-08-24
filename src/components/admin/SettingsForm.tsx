"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateStoreSettings, type SettingsFormState } from "@/app/admin/(dashboard)/settings/actions";
import type { StoreSettings } from "@/generated/prisma";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, formAction, pending] = useActionState<SettingsFormState, FormData>(updateStoreSettings, undefined);
  const [accentColor, setAccentColor] = useState(settings.accentColor);
  const [gridDensity, setGridDensity] = useState(settings.gridDensity);

  useEffect(() => {
    if (state?.success) toast.success("تنظیمات ذخیره شد");
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6 max-w-xl">
      <div className="grid grid-cols-2 gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="accentColor">رنگ تاکیدی</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="h-8 w-10 rounded-md border cursor-pointer"
            />
            <Input
              name="accentColor"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-28"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>تراکم شبکه محصولات</Label>
          <Select
            name="gridDensity"
            items={[
              { value: "comfortable", label: "راحت" },
              { value: "compact", label: "فشرده" },
            ]}
            value={gridDensity}
            onValueChange={(v) => setGridDensity(String(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comfortable">راحت</SelectItem>
              <SelectItem value="compact">فشرده</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">آدرس فروشگاه</Label>
        <Input id="address" name="address" defaultValue={settings.address} required />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hoursWeekday">ساعت کاری (شنبه تا چهارشنبه)</Label>
          <Input id="hoursWeekday" name="hoursWeekday" defaultValue={settings.hoursWeekday} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hoursThursday">ساعت کاری پنج‌شنبه</Label>
          <Input id="hoursThursday" name="hoursThursday" defaultValue={settings.hoursThursday} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hoursFriday">ساعت کاری جمعه</Label>
          <Input id="hoursFriday" name="hoursFriday" defaultValue={settings.hoursFriday} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="instagramHandle">آیدی اینستاگرام</Label>
          <Input id="instagramHandle" name="instagramHandle" defaultValue={settings.instagramHandle} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telegramHandle">آیدی تلگرام</Label>
          <Input id="telegramHandle" name="telegramHandle" defaultValue={settings.telegramHandle} required />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
      </Button>
    </form>
  );
}
