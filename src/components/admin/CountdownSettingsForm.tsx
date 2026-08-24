"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateCountdownSettings } from "@/app/admin/(dashboard)/discounts/actions";

function toLocalInputValue(date: Date | null) {
  if (!date) return "";
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
}

export function CountdownSettingsForm({
  discountEndsAt,
  showCountdown,
}: {
  discountEndsAt: Date | null;
  showCountdown: boolean;
}) {
  const [value, setValue] = useState(toLocalInputValue(discountEndsAt));
  const [enabled, setEnabled] = useState(showCountdown);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateCountdownSettings(value ? new Date(value) : null, enabled);
      toast.success("تنظیمات شمارش معکوس ذخیره شد");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Switch id="showCountdown" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="showCountdown">نمایش شمارش معکوس در سایت</Label>
      </div>
      <div className="space-y-2 max-w-xs">
        <Label htmlFor="discountEndsAt">پایان تخفیف‌های فعلی</Label>
        <Input
          id="discountEndsAt"
          type="datetime-local"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <Button onClick={handleSave} disabled={pending}>
        {pending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
      </Button>
    </div>
  );
}
