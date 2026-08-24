"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProductFormState } from "@/app/admin/(dashboard)/products/actions";
import type { ProductWithRelations } from "@/lib/queries";

type SizeRow = { size: string; stock: number };

export function ProductForm({
  categories,
  action,
  product,
  submitLabel,
}: {
  categories: { id: string; label: string }[];
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  product?: ProductWithRelations;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, undefined);
  const [sizes, setSizes] = useState<SizeRow[]>(
    product?.sizes.map((s) => ({ size: s.size, stock: s.stock })) ?? [{ size: "", stock: 0 }]
  );
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");

  const remainingImages = product?.images.filter((img) => !removedImageIds.includes(img.id)) ?? [];
  const cleanSizes = sizes.filter((s) => s.size.trim() !== "");

  function updateSize(index: number, patch: Partial<SizeRow>) {
    setSizes((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }
  function addSize() {
    setSizes((prev) => [...prev, { size: "", stock: 0 }]);
  }
  function removeSize(index: number) {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      <input type="hidden" name="sizes" value={JSON.stringify(cleanSizes)} readOnly />
      <input type="hidden" name="removeImageIds" value={JSON.stringify(removedImageIds)} readOnly />

      <div className="space-y-2">
        <Label htmlFor="name">نام محصول</Label>
        <Input id="name" name="name" defaultValue={product?.name} required />
      </div>

      <div className="space-y-2">
        <Label>دسته‌بندی</Label>
        <Select
          name="categoryId"
          items={categories.map((c) => ({ value: c.id, label: c.label }))}
          value={categoryId}
          onValueChange={(v) => setCategoryId(String(v))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="انتخاب دسته‌بندی" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">توضیحات</Label>
        <Textarea id="description" name="description" defaultValue={product?.description} required rows={4} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="basePrice">قیمت پایه (تومان)</Label>
          <Input id="basePrice" name="basePrice" type="number" min={0} defaultValue={product?.basePrice} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountPrice">قیمت با تخفیف (اختیاری)</Label>
          <Input
            id="discountPrice"
            name="discountPrice"
            type="number"
            min={0}
            defaultValue={product?.discountPrice ?? undefined}
            placeholder="بدون تخفیف"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="flashPrice">قیمت روز تخفیف ویژه (اختیاری)</Label>
        <Input
          id="flashPrice"
          name="flashPrice"
          type="number"
          min={0}
          defaultValue={product?.flashPrice ?? undefined}
          placeholder="خارج از روز ویژه"
        />
        <p className="text-xs text-muted-foreground">
          وقتی کمپین «روز تخفیف ویژه» فعاله، این قیمت جای قیمت با تخفیف عادی رو می‌گیره
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Switch id="isNew" name="isNew" defaultChecked={product?.isNew} />
        <Label htmlFor="isNew">نشان «تازه رسیده»</Label>
      </div>

      <div className="space-y-3">
        <Label>سایزها و موجودی</Label>
        <div className="space-y-2">
          {sizes.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="سایز (مثلا M)"
                value={s.size}
                onChange={(e) => updateSize(i, { size: e.target.value })}
                className="w-32"
              />
              <Input
                type="number"
                min={0}
                placeholder="موجودی"
                value={s.stock}
                onChange={(e) => updateSize(i, { stock: Number(e.target.value) })}
                className="w-28"
              />
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeSize(i)}>
                ✕
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addSize}>
          + افزودن سایز
        </Button>
      </div>

      {remainingImages.length > 0 && (
        <div className="space-y-2">
          <Label>تصاویر فعلی</Label>
          <div className="flex flex-wrap gap-3">
            {remainingImages.map((img) => (
              <div key={img.id} className="relative w-24 h-28 rounded-md overflow-hidden border">
                <Image src={img.url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setRemovedImageIds((prev) => [...prev, img.id])}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs leading-none cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="images">افزودن تصویر جدید</Label>
        <Input id="images" name="images" type="file" accept="image/*" multiple />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "در حال ذخیره..." : submitLabel}
      </Button>
    </form>
  );
}
