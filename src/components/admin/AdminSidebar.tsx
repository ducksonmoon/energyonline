"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { MenuIcon } from "lucide-react";

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

function Brand() {
  return (
    <div className="px-2">
      <div className="font-bold text-lg" style={{ fontFamily: "var(--font-lalezar)" }}>
        انرژی
      </div>
      <div className="text-xs text-muted-foreground">پنل مدیریت</div>
    </div>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 flex flex-col gap-1">
      {NAV.map((item) => {
        const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "rounded-md px-3 py-2.5 text-sm font-medium transition-colors md:py-2",
              active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ username, logoutAction }: { username: string; logoutAction: () => Promise<void> }) {
  return (
    <div className="border-t pt-3 mt-3 space-y-2">
      <div className="text-xs text-muted-foreground px-2">{username}</div>
      <form action={logoutAction}>
        <Button type="submit" variant="outline" size="sm" className="w-full">
          خروج
        </Button>
      </form>
      <Link href="/" target="_blank" className="block text-xs text-muted-foreground px-2 underline underline-offset-2">
        مشاهده فروشگاه ↗
      </Link>
    </div>
  );
}

export function AdminSidebar({
  username,
  logoutAction,
}: {
  username: string;
  logoutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: static sidebar, always visible */}
      <aside className="hidden md:flex w-60 shrink-0 border-l bg-card p-4 flex-col">
        <div className="mb-6">
          <Brand />
        </div>
        <NavLinks pathname={pathname} />
        <SidebarFooter username={username} logoutAction={logoutAction} />
      </aside>

      {/* Mobile: sticky top bar with a drawer for navigation */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b bg-card px-4 h-14 shrink-0">
        <Brand />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="outline" size="icon" aria-label="باز کردن منو" />}>
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col p-4">
            <SheetTitle className="sr-only">منوی پنل مدیریت</SheetTitle>
            <div className="mb-6 mt-6">
              <Brand />
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <SidebarFooter username={username} logoutAction={logoutAction} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
