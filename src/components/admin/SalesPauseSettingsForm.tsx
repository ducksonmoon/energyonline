"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { updateSalesPauseSettings } from "@/app/admin/(dashboard)/settings/actions";

export function SalesPauseSettingsForm({
  salesPaused,
  salesPausedMessage,
}: {
  salesPaused: boolean;
  salesPausedMessage: string;
}) {
  const [paused, setPaused] = useState(salesPaused);
  const [message, setMessage] = useState(salesPausedMessage);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateSalesPauseSettings(paused, message);
      toast.success("تنظیمات ذخیره شد");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Switch id="salesPaused" checked={paused} onCheckedChange={setPaused} />
        <Label htmlFor="salesPaused">فروش از طریق سایت متوقف باشد</Label>
      </div>
      <p className="text-sm text-muted-foreground">
        وقتی فعاله، مشتری می‌تونه مثل همیشه محصولات رو ببینه و به سبد اضافه کنه، ولی جای دکمه «تکمیل سفارش» این پیام
        نشون داده می‌شه:
      </p>
      <div className="space-y-2 max-w-md">
        <Label htmlFor="salesPausedMessage">پیام نمایش داده شده به مشتری</Label>
        <Textarea
          id="salesPausedMessage"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />
      </div>
      <Button onClick={handleSave} disabled={pending}>
        {pending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
      </Button>
    </div>
  );
}
