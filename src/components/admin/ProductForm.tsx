"use client";

import { useActionState, useEffect, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriceInput } from "@/components/admin/PriceInput";
import { ImagePlusIcon, Loader2Icon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const totalImageCount = remainingImages.length + newImages.length;

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
    // A native file input's FileList is replaced (not merged) every time the
    // user opens the picker again, so we merge onto our own running list and
    // sync it back to the input rather than trusting e.target.files directly.
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;
    const merged = [...newImages, ...picked];
    setNewImages(merged);
    setNewImagePreviews((prev) => [...prev, ...picked.map((f) => URL.createObjectURL(f))]);
    syncFileInput(merged);
  }

  function removeNewImage(index: number) {
    URL.revokeObjectURL(newImagePreviews[index]);
    const files = newImages.filter((_, i) => i !== index);
    setNewImages(files);
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
    syncFileInput(files);
  }

  return (
    <form action={formAction} className="max-w-5xl space-y-6">
      <input type="hidden" name="sizes" value={JSON.stringify(cleanSizes)} readOnly />
      <input type="hidden" name="removeImageIds" value={JSON.stringify(removedImageIds)} readOnly />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات محصول</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                <Label htmlFor="isNew" className="cursor-pointer">
                  نشان «تازه رسیده»
                </Label>
                <Switch id="isNew" name="isNew" defaultChecked={product?.isNew} disabled={pending} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>قیمت‌گذاری</CardTitle>
              <CardDescription>مبلغ‌ها به تومان</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>سایزها و موجودی</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sizes.length > 0 && (
                <div className="hidden grid-cols-[1fr_1fr_auto] gap-2 px-1 text-xs text-muted-foreground sm:grid">
                  <span>سایز</span>
                  <span>موجودی</span>
                  <span className="w-7" />
                </div>
              )}
              <div className="space-y-2">
                {sizes.map((s, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 rounded-lg border p-2 sm:border-0 sm:p-0">
                    <Input
                      placeholder="مثلا M"
                      aria-label="سایز"
                      value={s.size}
                      onChange={(e) => updateSize(i, { size: e.target.value })}
                      disabled={pending}
                    />
                    <Input
                      type="number"
                      min={0}
                      placeholder="موجودی"
                      aria-label="موجودی"
                      value={s.stock}
                      onChange={(e) => updateSize(i, { stock: Number(e.target.value) })}
                      disabled={pending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSize(i)}
                      disabled={pending}
                      aria-label="حذف سایز"
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addSize} disabled={pending}>
                <PlusIcon />
                افزودن سایز
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تصاویر</CardTitle>
              <CardDescription>اولین تصویر به عنوان تصویر اصلی نمایش داده می‌شه</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {totalImageCount > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {remainingImages.map((img) => (
                    <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg border">
                      <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setRemovedImageIds((prev) => [...prev, img.id])}
                        disabled={pending}
                        aria-label="حذف تصویر"
                        className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white cursor-pointer disabled:cursor-not-allowed"
                      >
                        <XIcon className="size-3.5" />
                      </button>
                    </div>
                  ))}
                  {newImagePreviews.map((url, i) => (
                    <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-dashed">
                      {/* eslint-disable-next-line @next/next/no-img-element -- local blob: preview, next/image can't optimize these */}
                      <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                        جدید
                      </span>
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        disabled={pending}
                        aria-label="حذف تصویر"
                        className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white cursor-pointer disabled:cursor-not-allowed"
                      >
                        <XIcon className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label
                htmlFor="images"
                className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:bg-muted/50 has-disabled:pointer-events-none has-disabled:opacity-50"
              >
                <ImagePlusIcon className="size-6 text-muted-foreground" />
                <span className="text-sm font-medium">افزودن تصویر</span>
                <span className="text-xs text-muted-foreground">می‌تونی چند تصویر با هم انتخاب کنی</span>
              </label>
              <input
                ref={fileInputRef}
                id="images"
                name="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesSelected}
                disabled={pending}
                className="sr-only"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t pt-6 sm:flex-row sm:items-center">
        {state?.error && <p className="text-sm text-destructive sm:me-auto">{state.error}</p>}
        <Link
          href="/admin/products"
          aria-disabled={pending}
          className={cn(buttonVariants({ variant: "outline" }), "sm:w-auto", pending && "pointer-events-none opacity-50")}
        >
          انصراف
        </Link>
        <Button type="submit" disabled={pending} className="sm:w-auto">
          {pending && <Loader2Icon className="animate-spin" />}
          {pending ? "در حال ذخیره..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
