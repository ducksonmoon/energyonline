"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "نمای کلی" },
  { href: "/admin/sell", label: "ثبت فروش" },
  { href: "/admin/reports", label: "گزارش فروش" },
  { href: "/admin/products", label: "محصولات" },
  { href: "/admin/discounts", label: "تخفیف‌ها" },
  { href: "/admin/special-offer", label: "روز تخفیف ویژه" },
  { href: "/admin/categories", label: "دسته‌بندی‌ها" },
  { href: "/admin/employees", label: "کارکنان" },
  { href: "/admin/settings", label: "تنظیمات" },
];

export function AdminSidebar({
  username,
  logoutAction,
}: {
  username: string;
  logoutAction: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-l bg-card p-4 flex flex-col">
      <div className="mb-6 px-2">
        <div className="font-bold text-lg" style={{ fontFamily: "var(--font-lalezar)" }}>
          انرژی
        </div>
        <div className="text-xs text-muted-foreground">پنل مدیریت</div>
      </div>
      <nav className="flex-1 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t pt-3 mt-3 space-y-2">
        <div className="text-xs text-muted-foreground px-2">{username}</div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm" className="w-full">
            خروج
          </Button>
        </form>
        <Link
          href="/"
          target="_blank"
          className="block text-xs text-muted-foreground px-2 underline underline-offset-2"
        >
          مشاهده فروشگاه ↗
        </Link>
      </div>
    </aside>
  );
}
