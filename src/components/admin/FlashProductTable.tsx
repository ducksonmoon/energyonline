"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatToman, toFa } from "@/lib/format";
import {
  setProductFlashPrice,
  bulkApplyFlashPercent,
  bulkClearFlashPrice,
} from "@/app/admin/(dashboard)/special-offer/actions";

type Row = { id: string; name: string; catLabel: string; basePrice: number; flashPrice: number | null };

export function FlashProductTable({ products }: { products: Row[] }) {
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(products.map((p) => [p.id, p.flashPrice != null ? String(p.flashPrice) : ""]))
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [percent, setPercent] = useState("50");
  const [pending, startTransition] = useTransition();

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === products.length ? new Set() : new Set(products.map((p) => p.id))));
  }

  function saveRow(id: string) {
    const raw = drafts[id]?.trim();
    const value = raw ? Math.max(0, Math.trunc(Number(raw))) : null;
    startTransition(async () => {
      await setProductFlashPrice(id, value);
      toast.success("قیمت روز ویژه به‌روزرسانی شد");
    });
  }

  function applyBulk() {
    const pct = Number(percent);
    if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) {
      toast.error("درصد تخفیف باید بین ۱ تا ۹۹ باشد");
      return;
    }
    if (selected.size === 0) {
      toast.error("حداقل یک محصول انتخاب کن");
      return;
    }
    startTransition(async () => {
      const ids = Array.from(selected);
      await bulkApplyFlashPercent(ids, pct);
      setDrafts((prev) => {
        const next = { ...prev };
        for (const id of ids) {
          const p = products.find((x) => x.id === id);
          if (p) next[id] = String(Math.round(p.basePrice * (1 - pct / 100)));
        }
        return next;
      });
      toast.success(`٪${pct} تخفیف روز ویژه روی ${ids.length} محصول اعمال شد`);
    });
  }

  function clearBulk() {
    if (selected.size === 0) {
      toast.error("حداقل یک محصول انتخاب کن");
      return;
    }
    startTransition(async () => {
      const ids = Array.from(selected);
      await bulkClearFlashPrice(ids);
      setDrafts((prev) => {
        const next = { ...prev };
        for (const id of ids) next[id] = "";
        return next;
      });
      toast.success("قیمت روز ویژه محصولات انتخاب‌شده پاک شد");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-3">
        <div className="text-sm text-muted-foreground">{toFa(selected.size)} محصول انتخاب شده</div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={99}
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            className="w-20"
          />
          <span className="text-sm">٪ تخفیف روز ویژه</span>
        </div>
        <Button type="button" size="sm" onClick={applyBulk} disabled={pending}>
          اعمال به انتخاب‌شده‌ها
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={clearBulk} disabled={pending}>
          خارج کردن از روز ویژه
        </Button>
      </div>

      {/* Mobile: a card per product — the edit column is unreachable in a 6-col table on a narrow screen. */}
      <div className="space-y-3 sm:hidden">
        <label className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={selected.size === products.length && products.length > 0}
            onChange={toggleAll}
          />
          انتخاب همه
        </label>
        {products.map((p) => (
          <div key={p.id} className="rounded-xl border bg-card p-4 space-y-3">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggleSelected(p.id)}
                className="mt-1"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-medium truncate">{p.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {p.catLabel} · قیمت پایه {formatToman(p.basePrice)}
                </span>
              </span>
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                placeholder="خارج از روز ویژه"
                value={drafts[p.id] ?? ""}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))}
                className="flex-1"
              />
              <Button type="button" size="sm" variant="outline" onClick={() => saveRow(p.id)} disabled={pending}>
                ذخیره
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/tablet: full table */}
      <div className="hidden rounded-xl border bg-card sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <input
                  type="checkbox"
                  checked={selected.size === products.length && products.length > 0}
                  onChange={toggleAll}
                />
              </TableHead>
              <TableHead>نام</TableHead>
              <TableHead>دسته‌بندی</TableHead>
              <TableHead>قیمت پایه</TableHead>
              <TableHead>قیمت روز ویژه</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelected(p.id)} />
                </TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.catLabel}</TableCell>
                <TableCell>{formatToman(p.basePrice)}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    placeholder="خارج از روز ویژه"
                    value={drafts[p.id] ?? ""}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))}
                    className="w-32"
                  />
                </TableCell>
                <TableCell>
                  <Button type="button" size="sm" variant="outline" onClick={() => saveRow(p.id)} disabled={pending}>
                    ذخیره
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
