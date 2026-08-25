"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryIcon } from "@/components/storefront/CategoryIcon";
import { ICON_OPTIONS } from "@/lib/icons";
import { createCategory, updateCategory, deleteCategory } from "@/app/admin/(dashboard)/categories/actions";

type CategoryRow = { id: string; key: string; label: string; iconKey: string; sortOrder: number };

export function CategoriesManager({ categories }: { categories: CategoryRow[] }) {
  const [rows, setRows] = useState(categories);
  const [pending, startTransition] = useTransition();
  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState(ICON_OPTIONS[0].key);

  function patchRow(id: string, patch: Partial<CategoryRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function saveRow(row: CategoryRow) {
    startTransition(async () => {
      const res = await updateCategory(row.id, { label: row.label, iconKey: row.iconKey, sortOrder: row.sortOrder });
      if (res?.error) toast.error(res.error);
      else toast.success("دسته‌بندی به‌روزرسانی شد");
    });
  }

  function removeRow(id: string) {
    if (!confirm("این دسته‌بندی حذف بشه؟")) return;
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (res?.error) toast.error(res.error);
      else {
        setRows((prev) => prev.filter((r) => r.id !== id));
        toast.success("دسته‌بندی حذف شد");
      }
    });
  }

  function addCategory() {
    if (!newKey.trim() || !newLabel.trim()) {
      toast.error("کلید و عنوان رو وارد کن");
      return;
    }
    startTransition(async () => {
      const res = await createCategory({
        key: newKey.trim(),
        label: newLabel.trim(),
        iconKey: newIcon,
        sortOrder: rows.length,
      });
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("دسته‌بندی اضافه شد");
        setNewKey("");
        setNewLabel("");
        window.location.reload();
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Mobile: a card per category — icon/title/key/order/actions don't fit a 5-col table on a narrow screen. */}
      <div className="space-y-3 sm:hidden">
        {rows.map((row) => (
          <div key={row.id} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Select
                items={ICON_OPTIONS.map((o) => ({ value: o.key, label: o.label }))}
                value={row.iconKey}
                onValueChange={(v) => patchRow(row.id, { iconKey: String(v) })}
              >
                <SelectTrigger className="w-14 shrink-0">
                  <CategoryIcon iconKey={row.iconKey} size={18} />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((o) => (
                    <SelectItem key={o.key} value={o.key}>
                      <span className="flex items-center gap-2">
                        <CategoryIcon iconKey={o.key} size={16} /> {o.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={row.label}
                onChange={(e) => patchRow(row.id, { label: e.target.value })}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>کلید: {row.key}</span>
              <label className="flex items-center gap-1.5">
                ترتیب:
                <Input
                  type="number"
                  value={row.sortOrder}
                  onChange={(e) => patchRow(row.id, { sortOrder: Number(e.target.value) })}
                  className="w-16"
                />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => saveRow(row)} disabled={pending} className="flex-1">
                ذخیره
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => removeRow(row.id)} disabled={pending}>
                حذف
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
              <TableHead className="w-10">آیکون</TableHead>
              <TableHead>عنوان</TableHead>
              <TableHead>کلید</TableHead>
              <TableHead className="w-20">ترتیب</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Select
                    items={ICON_OPTIONS.map((o) => ({ value: o.key, label: o.label }))}
                    value={row.iconKey}
                    onValueChange={(v) => patchRow(row.id, { iconKey: String(v) })}
                  >
                    <SelectTrigger className="w-16">
                      <CategoryIcon iconKey={row.iconKey} size={18} />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((o) => (
                        <SelectItem key={o.key} value={o.key}>
                          <span className="flex items-center gap-2">
                            <CategoryIcon iconKey={o.key} size={16} /> {o.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    value={row.label}
                    onChange={(e) => patchRow(row.id, { label: e.target.value })}
                    className="w-36"
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">{row.key}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={row.sortOrder}
                    onChange={(e) => patchRow(row.id, { sortOrder: Number(e.target.value) })}
                    className="w-16"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button type="button" size="sm" variant="outline" onClick={() => saveRow(row)} disabled={pending}>
                      ذخیره
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeRow(row.id)} disabled={pending}>
                      حذف
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="font-medium text-sm">افزودن دسته‌بندی جدید</div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">کلید (انگلیسی)</div>
            <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="accessories" className="w-40" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">عنوان فارسی</div>
            <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="اکسسوری" className="w-40" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">آیکون</div>
            <Select
              items={ICON_OPTIONS.map((o) => ({ value: o.key, label: o.label }))}
              value={newIcon}
              onValueChange={(v) => setNewIcon(String(v))}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((o) => (
                  <SelectItem key={o.key} value={o.key}>
                    <span className="flex items-center gap-2">
                      <CategoryIcon iconKey={o.key} size={16} /> {o.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" onClick={addCategory} disabled={pending}>
            + افزودن
          </Button>
        </div>
      </div>
    </div>
  );
}
