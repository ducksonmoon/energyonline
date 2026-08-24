"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const sizeArraySchema = z.array(z.object({ size: z.string().min(1), stock: z.coerce.number().int().min(0) }));

const baseSchema = z.object({
  name: z.string().min(1, "نام محصول را وارد کنید"),
  categoryId: z.string().min(1, "دسته‌بندی را انتخاب کنید"),
  description: z.string().min(1, "توضیحات را وارد کنید"),
  basePrice: z.coerce.number().int().min(0, "قیمت نامعتبر است"),
  sizes: z.string().min(1),
});

export type ProductFormState = { error: string } | undefined;

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

function parseSizes(raw: string) {
  return sizeArraySchema.parse(JSON.parse(raw));
}

function parseOptionalPrice(formData: FormData, field: string): number | null {
  const raw = formData.get(field);
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : null;
}

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function validateImageFiles(files: File[]): string | null {
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES[file.type]) {
      return "فقط فایل تصویر (jpg، png، webp یا gif) مجاز است";
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return "حجم هر تصویر باید کمتر از ۵ مگابایت باشد";
    }
  }
  return null;
}

async function saveUploadedImages(productId: string, files: File[]): Promise<string[]> {
  const real = files.filter((f) => f && f.size > 0);
  if (real.length === 0) return [];

  const dir = path.join(process.cwd(), "public", "uploads", "products", productId);
  await mkdir(dir, { recursive: true });
  const urls: string[] = [];
  for (const file of real) {
    const ext = ALLOWED_IMAGE_TYPES[file.type];
    const filename = `${randomUUID()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);
    urls.push(`/uploads/products/${productId}/${filename}`);
  }
  return urls;
}

export async function createProduct(_prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const parsed = baseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "خطا در اطلاعات فرم" };

  let sizes;
  try {
    sizes = parseSizes(parsed.data.sizes);
  } catch {
    return { error: "سایزها نامعتبر است" };
  }
  if (sizes.length === 0) return { error: "حداقل یک سایز اضافه کنید" };

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const imageError = validateImageFiles(files);
  if (imageError) return { error: imageError };

  const product = await db.product.create({
    data: {
      name: parsed.data.name,
      categoryId: parsed.data.categoryId,
      description: parsed.data.description,
      basePrice: parsed.data.basePrice,
      discountPrice: parseOptionalPrice(formData, "discountPrice"),
      flashPrice: parseOptionalPrice(formData, "flashPrice"),
      isNew: formData.get("isNew") === "on",
      sizes: { create: sizes },
    },
  });

  const urls = await saveUploadedImages(product.id, files);
  if (urls.length > 0) {
    await db.productImage.createMany({ data: urls.map((url, i) => ({ productId: product.id, url, sortOrder: i })) });
  }

  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const parsed = baseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "خطا در اطلاعات فرم" };

  let sizes;
  try {
    sizes = parseSizes(parsed.data.sizes);
  } catch {
    return { error: "سایزها نامعتبر است" };
  }
  if (sizes.length === 0) return { error: "حداقل یک سایز اضافه کنید" };

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const imageError = validateImageFiles(files);
  if (imageError) return { error: imageError };

  await db.product.update({
    where: { id: productId },
    data: {
      name: parsed.data.name,
      categoryId: parsed.data.categoryId,
      description: parsed.data.description,
      basePrice: parsed.data.basePrice,
      discountPrice: parseOptionalPrice(formData, "discountPrice"),
      flashPrice: parseOptionalPrice(formData, "flashPrice"),
      isNew: formData.get("isNew") === "on",
    },
  });

  await db.productSize.deleteMany({ where: { productId } });
  await db.productSize.createMany({ data: sizes.map((s) => ({ ...s, productId })) });

  const removeImageIdsRaw = formData.get("removeImageIds");
  if (typeof removeImageIdsRaw === "string" && removeImageIdsRaw) {
    const ids: string[] = JSON.parse(removeImageIdsRaw);
    if (ids.length > 0) {
      const images = await db.productImage.findMany({ where: { id: { in: ids }, productId } });
      await db.productImage.deleteMany({ where: { id: { in: ids } } });
      for (const img of images) {
        await unlink(path.join(process.cwd(), "public", img.url)).catch(() => {});
      }
    }
  }

  const urls = await saveUploadedImages(productId, files);
  if (urls.length > 0) {
    const existingCount = await db.productImage.count({ where: { productId } });
    await db.productImage.createMany({
      data: urls.map((url, i) => ({ productId, url, sortOrder: existingCount + i })),
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  redirect("/admin/products");
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  const images = await db.productImage.findMany({ where: { productId } });
  await db.product.delete({ where: { id: productId } });
  for (const img of images) {
    await unlink(path.join(process.cwd(), "public", img.url)).catch(() => {});
  }
  revalidatePath("/");
  revalidatePath("/admin/products");
}
