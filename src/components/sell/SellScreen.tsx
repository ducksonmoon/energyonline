"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toFa } from "@/lib/format";
import { sellItem, undoSale } from "@/app/admin/(dashboard)/sell/actions";
import type { SellProduct, SaleLogEntry } from "@/lib/sellViewModel";
import { SellProductCard } from "@/components/sell/SellProductCard";

export function SellScreen({
  categories,
  products,
  initialLog,
  initialTodayCount,
}: {
  categories: { key: string; label: string }[];
  products: SellProduct[];
  initialLog: SaleLogEntry[];
  initialTodayCount: number;
}) {
  const [category, setCategory] = useState("all");
  const [items, setItems] = useState(products);
  const [log, setLog] = useState(initialLog);
  const [todayCount, setTodayCount] = useState(initialTodayCount);

  function bumpStock(productId: string, size: string, delta: number) {
    setItems((prev) =>
      prev.map((p) =>
        p.id !== productId
          ? p
          : { ...p, sizes: p.sizes.map((s) => (s.size === size ? { ...s, stock: Math.max(0, s.stock + delta) } : s)) }
      )
    );
  }

  async function handleUndo(entry: SaleLogEntry) {
    setLog((prev) => prev.filter((l) => l.id !== entry.id));
    if (entry.isToday) setTodayCount((c) => Math.max(0, c - 1));
    bumpStock(entry.productId, entry.size, 1);

    const res = await undoSale(entry.id);
    if (!res.ok) toast.error(res.error);
    else toast.success("فروش برگردانده شد");
  }

  async function handleSell(product: SellProduct, size: string) {
    const sizeRow = product.sizes.find((s) => s.size === size);
    if (!sizeRow || sizeRow.stock <= 0) return;

    bumpStock(product.id, size, -1);

    const res = await sellItem(product.id, size);
    if (!res.ok) {
      bumpStock(product.id, size, 1);
      toast.error(res.error);
      return;
    }

    const entry: SaleLogEntry = {
      id: res.sale.id,
      productId: res.sale.productId,
      productName: res.sale.productName,
      size: res.sale.size,
      time: res.sale.time,
      isToday: true,
    };
    setLog((prev) => [entry, ...prev].slice(0, 8));
    setTodayCount((c) => c + 1);
    toast.success(`ثبت شد: ${entry.productName} · سایز ${entry.size}`, {
      action: { label: "برگردون", onClick: () => handleUndo(entry) },
    });
  }

  const filtered = category === "all" ? items : items.filter((p) => p.categoryKey === category);
  const catDefs = [{ key: "all", label: "همه" }, ...categories];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">ثبت فروش</h1>
          <p className="text-sm text-muted-foreground">با تپ روی سایز، فروش رو سریع ثبت کن</p>
        </div>
        <Card className="sm:self-start sm:shrink-0">
          <CardHeader className="pb-2">
            <CardDescription>فروش امروز</CardDescription>
            <CardTitle className="text-3xl">{toFa(todayCount)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {catDefs.map((c) => (
          <Button
            key={c.key}
            type="button"
            size="sm"
            variant={category === c.key ? "default" : "outline"}
            onClick={() => setCategory(c.key)}
            className="shrink-0"
          >
            {c.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <SellProductCard key={p.id} product={p} onSell={(size) => handleSell(p, size)} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-10 text-center text-sm text-muted-foreground">محصولی در این دسته نیست.</div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>فروش‌های اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {log.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                <span>
                  <span className="font-medium">{r.productName}</span>
                  <span className="text-muted-foreground"> · سایز {r.size} · {r.time}</span>
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleUndo(r)}>
                  برگردون
                </Button>
              </li>
            ))}
            {log.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">هنوز فروشی ثبت نشده.</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
