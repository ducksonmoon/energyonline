"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4" dir="rtl">
      <form action={action} className="w-full max-w-sm space-y-5 rounded-xl border bg-card p-7 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-lalezar)" }}>
            پنل مدیریت انرژی
          </h1>
          <p className="text-sm text-muted-foreground">برای ادامه وارد شوید</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">نام کاربری</Label>
          <Input id="username" name="username" required autoFocus autoComplete="username" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">رمز عبور</Label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "در حال ورود..." : "ورود"}
        </Button>
      </form>
    </div>
  );
}
