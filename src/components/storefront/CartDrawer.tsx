"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useCartStore } from "@/store/cart";
import { cartTotal } from "@/lib/cart";
import { formatToman, toFa } from "@/lib/format";
import { getLiveCartStock } from "@/app/actions";

export function CartDrawer({
  open,
  onOpenChange,
  salesPaused,
  salesPausedMessage,
  instagramHandle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesPaused: boolean;
  salesPausedMessage: string;
  instagramHandle: string;
}) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const setQty = useCartStore((s) => s.setQty);
  const [liveStock, setLiveStock] = useState<Record<string, Record<string, number>> | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const productIds = Array.from(new Set(items.map((i) => i.productId)));
    getLiveCartStock(productIds).then((stock) => {
      if (cancelled) return;
      setLiveStock(stock);
      // Self-heal: someone may have bought the last unit in-store since
      // these lines were added (this cart never reserves stock — a real
      // purchase only happens when staff confirms over Instagram DM), so
      // clamp any line down to what's actually left rather than letting
      // it overstate availability at handoff. A line that's now fully out
      // of stock is left as-is and shown as unavailable below instead of
      // being silently removed.
      for (const item of items) {
        const available = stock[item.productId]?.[item.size] ?? 0;
        if (available > 0 && available < item.qty) {
          setQty(item.id, available, available);
        }
      }
    });
    return () => {
      cancelled = true;
    };
    // Re-checking only needs the items present when the drawer opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function isAvailable(item: (typeof items)[number]) {
    if (!liveStock) return true;
    const stock = liveStock[item.productId]?.[item.size];
    return (stock ?? 0) > 0;
  }

  const availableItems = items.filter(isAvailable);
  const total = cartTotal(availableItems);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Both cart triggers (TopBar's icon, the floating MiniCart pill) sit
          on the physical left in this RTL layout, so the drawer opens from
          the same side instead of the component's LTR-oriented default. */}
      <SheetContent side="left" className="energy-root bg-[var(--bg)] text-[var(--ink)]" dir="rtl">
        <SheetHeader>
          <SheetTitle className="text-[var(--ink)]" style={{ fontFamily: "var(--font-lalezar)" }}>
            سبد خرید
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-3">
          {items.length === 0 && (
            <p className="text-sm text-[var(--ink-soft)] py-8 text-center">سبد خرید شما خالی است.</p>
          )}
          {items.map((item) => {
            const available = isAvailable(item);
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 border-b border-[var(--line)] pb-3"
                style={{ opacity: available ? 1 : 0.5 }}
              >
                <div className="w-14 h-16 rounded-md bg-[var(--bg-alt)] overflow-hidden relative flex-none">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{item.name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--ink-soft)]">
                    <span>سایز {item.size}</span>
                    {item.qty > 1 && (
                      <span className="rounded-full bg-[var(--bg-alt)] px-1.5 py-[1px] text-[11px] font-bold text-[var(--ink)]">
                        ×{toFa(item.qty)}
                      </span>
                    )}
                  </div>
                  {available ? (
                    <div className="text-xs font-semibold mt-0.5">{formatToman(item.price * item.qty)}</div>
                  ) : (
                    <div className="text-xs font-semibold mt-0.5 text-[var(--brand-red)]">دیگر موجود نیست</div>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-[var(--ink-soft)] hover:text-[var(--brand-red)] cursor-pointer p-1.5"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {availableItems.length > 0 && (
          <SheetFooter>
            <div className="flex items-center justify-between text-sm font-bold mb-2">
              <span>جمع کل</span>
              <span>{formatToman(total)}</span>
            </div>

            {salesPaused ? (
              <div className="rounded-md border border-[var(--line)] bg-[var(--bg-alt)] p-4 text-center">
                <div className="w-9 h-9 mx-auto mb-2.5 rounded-full bg-[var(--bg)] flex items-center justify-center">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--ink-soft)"
                    strokeWidth="1.6"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v4l2.5 2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-xs text-[var(--ink)] leading-7 whitespace-pre-line">{salesPausedMessage}</p>
                {instagramHandle && (
                  <a
                    href={`https://instagram.com/${instagramHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-[var(--bg)] hover:opacity-90 py-2.5 text-sm font-bold"
                  >
                    پیام در اینستاگرام <span dir="ltr">@{instagramHandle}</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      style={{ transform: "scaleX(-1)" }}
                    >
                      <path d="M5 12h13M13 6l6 6-6 6" />
                    </svg>
                  </a>
                )}
              </div>
            ) : (
              <>
                <p className="text-xs text-[var(--ink-soft)] leading-6 mb-2">
                  برای نهایی کردن سفارش، از دایرکت اینستاگرام پیام بده — موجودی نهایی همون‌جا هماهنگ می‌شه.
                </p>
                <a
                  href={`https://instagram.com/${instagramHandle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center rounded-full bg-[var(--ink)] text-[var(--bg)] hover:opacity-90 py-2.5 text-sm font-bold"
                >
                  پیام در اینستاگرام {instagramHandle && <span dir="ltr">@{instagramHandle}</span>}
                </a>
              </>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
