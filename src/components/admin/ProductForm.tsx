"use client";

import { useActionState, useEffect, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriceInput } from "@/components/admin/PriceInput";
import type { ProductFormState } from "@/app/admin/(dashboard)/products/actions";
import type { ProductWithRelations } from "@/lib/queries";

type SizeRow = { size: string; stock: number };

function SectionHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div>
      <h3 className="text-sm font-bold">{title}</h3>
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    // Revoke every staged preview URL on unmount so they don't leak.
    return () => newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function syncFileInput(files: File[]) {
    if (!fileInputRef.current) return;
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    fileInputRef.current.files = dt.files;
  }

  function handleFilesSelected(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewImages(files);
    setNewImagePreviews(files.map((f) => URL.createObjectURL(f)));
  }

  function removeNewImage(index: number) {
    URL.revokeObjectURL(newImagePreviews[index]);
    const files = newImages.filter((_, i) => i !== index);
    setNewImages(files);
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
    syncFileInput(files);
  }

  return (
    <form action={formAction} className="space-y-8 max-w-2xl">
      <input type="hidden" name="sizes" value={JSON.stringify(cleanSizes)} readOnly />
      <input type="hidden" name="removeImageIds" value={JSON.stringify(removedImageIds)} readOnly />

      <div className="space-y-4">
        <SectionHeading title="اطلاعات محصول" />
        <div className="space-y-2">
          <Label htmlFor="name">نام محصول</Label>
          <Input id="name" name="name" defaultValue={product?.name} required disabled={pending} />
        </div>

        <div className="space-y-2">
          <Label>دسته‌بندی</Label>
          <Select
            name="categoryId"
            items={categories.map((c) => ({ value: c.id, label: c.label }))}
            value={categoryId}
            onValueChange={(v) => setCategoryId(String(v))}
            disabled={pending}
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
          <Textarea id="description" name="description" defaultValue={product?.description} required rows={4} disabled={pending} />
        </div>

        <div className="flex items-center gap-2">
          <Switch id="isNew" name="isNew" defaultChecked={product?.isNew} disabled={pending} />
          <Label htmlFor="isNew">نشان «تازه رسیده»</Label>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <SectionHeading title="قیمت‌گذاری" hint="مبلغ‌ها به تومان" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="basePrice">قیمت پایه</Label>
            <PriceInput id="basePrice" name="basePrice" defaultValue={product?.basePrice} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discountPrice">قیمت با تخفیف</Label>
            <PriceInput
              id="discountPrice"
              name="discountPrice"
              defaultValue={product?.discountPrice ?? undefined}
              placeholder="بدون تخفیف"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="flashPrice">قیمت روز تخفیف ویژه</Label>
          <PriceInput
            id="flashPrice"
            name="flashPrice"
            defaultValue={product?.flashPrice ?? undefined}
            placeholder="خارج از روز ویژه"
          />
          <p className="text-xs text-muted-foreground">
            وقتی کمپین «روز تخفیف ویژه» فعاله، این قیمت جای قیمت با تخفیف عادی رو می‌گیره
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <SectionHeading title="سایزها و موجودی" />
        <div className="space-y-2">
          {sizes.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="سایز (مثلا M)"
                value={s.size}
                onChange={(e) => updateSize(i, { size: e.target.value })}
                className="w-32"
                disabled={pending}
              />
              <Input
                type="number"
                min={0}
                placeholder="موجودی"
                value={s.stock}
                onChange={(e) => updateSize(i, { stock: Number(e.target.value) })}
                className="w-28"
                disabled={pending}
              />
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeSize(i)} disabled={pending}>
                ✕
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addSize} disabled={pending}>
          + افزودن سایز
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <SectionHeading title="تصاویر" hint="اولین تصویر به عنوان تصویر اصلی نمایش داده می‌شه" />

        {remainingImages.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {remainingImages.map((img) => (
              <div key={img.id} className="relative w-24 h-28 rounded-md overflow-hidden border">
                <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setRemovedImageIds((prev) => [...prev, img.id])}
                  disabled={pending}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs leading-none cursor-pointer disabled:cursor-not-allowed"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {newImagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {newImagePreviews.map((url, i) => (
              <div key={url} className="relative w-24 h-28 rounded-md overflow-hidden border border-dashed">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob: preview, next/image can't optimize these */}
                <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                  جدید
                </span>
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  disabled={pending}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs leading-none cursor-pointer disabled:cursor-not-allowed"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="images">افزودن تصویر جدید</Label>
          <Input
            ref={fileInputRef}
            id="images"
            name="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesSelected}
            disabled={pending}
          />
        </div>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending && (
          <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
          </svg>
        )}
        {pending ? "در حال ذخیره..." : submitLabel}
      </Button>
    </form>
  );
}
