"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { objectStorageEnabled, uploadObject, deleteObject, keyFromPublicUrl } from "@/lib/storage";
import { processProductImage } from "@/lib/image";

const sizeArraySchema = z.array(z.object({ size: z.string().min(1), stock: z.coerce.number().int().min(0) }));

const baseSchema = z.object({
  name: z.string().min(1, "نام محصول را وارد کنید"),
  categoryId: z.string().min(1, "دسته‌بندی را انتخاب کنید"),
  // Optional: some inventory (a plain brand tee, an unlabeled surplus item)
  // has nothing worth writing beyond the name and photos.
  description: z.string(),
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

// Uploaded product photos go to object storage (see src/lib/storage.ts) —
// the app server's local disk isn't reliable for this: Next.js's static
// file serving doesn't pick up files written after the server process
// started, so anything saved to public/uploads/ during normal operation
// (as opposed to at build time) 404s until the next deploy restarts it.
// Local disk is kept only as a fallback for local dev when no bucket is
// configured, so `npm run dev` keeps working without real credentials.
async function saveUploadedImages(productId: string, files: File[]): Promise<string[]> {
  const real = files.filter((f) => f && f.size > 0);
  if (real.length === 0) return [];

  // Uploads run in parallel, not one-at-a-time: each one is a full network
  // round trip to object storage, so a sequential loop made adding a few
  // photos take the sum of every upload's latency instead of the slowest
  // one — easily enough to feel "really slow" or even trip nginx's
  // proxy_read_timeout on a handful of images. Promise.all preserves the
  // input order in its results regardless of which upload finishes first,
  // so image 1 stays the main photo either way.
  if (objectStorageEnabled) {
    return Promise.all(
      real.map(async (file) => {
        const rawBuffer = Buffer.from(await file.arrayBuffer());
        const { buffer, contentType, ext } = await processProductImage(rawBuffer, file.type);
        const filename = `${randomUUID()}${ext}`;
        return uploadObject(`products/${productId}/${filename}`, buffer, contentType);
      })
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads", "products", productId);
  await mkdir(dir, { recursive: true });
  return Promise.all(
    real.map(async (file) => {
      const rawBuffer = Buffer.from(await file.arrayBuffer());
      const { buffer, ext } = await processProductImage(rawBuffer, file.type);
      const filename = `${randomUUID()}${ext}`;
      await writeFile(path.join(dir, filename), buffer);
      return `/uploads/products/${productId}/${filename}`;
    })
  );
}

async function deleteUploadedImage(url: string): Promise<void> {
  const key = keyFromPublicUrl(url);
  if (key) {
    await deleteObject(key).catch(() => {});
    return;
  }
  await unlink(path.join(process.cwd(), "public", url)).catch(() => {});
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

  // Upload images before touching the database: a product id is needed for
  // the storage key, so it's generated here rather than left to Prisma's
  // default, and uploading first means a storage failure (e.g. a
  // misconfigured bucket) never leaves behind a product record with no
  // photos and no way for the admin to know why.
  const productId = randomUUID();
  let urls: string[];
  try {
    urls = await saveUploadedImages(productId, files);
  } catch (err) {
    console.error("Product image upload failed:", err);
    return { error: "آپلود تصویر با خطا مواجه شد. دوباره امتحان کن — اگر باز هم نشد، محصول رو بدون تصویر ذخیره کن و بعداً از صفحه ویرایش عکس اضافه کن." };
  }

  try {
    await db.product.create({
      data: {
        id: productId,
        name: parsed.data.name,
        categoryId: parsed.data.categoryId,
        description: parsed.data.description,
        basePrice: parsed.data.basePrice,
        discountPrice: parseOptionalPrice(formData, "discountPrice"),
        flashPrice: parseOptionalPrice(formData, "flashPrice"),
        isNew: formData.get("isNew") === "on",
        featuredInHero: formData.get("featuredInHero") === "on",
        sizes: { create: sizes },
        images: urls.length > 0 ? { create: urls.map((url, i) => ({ url, sortOrder: i })) } : undefined,
      },
    });
  } catch (err) {
    console.error("Product create failed:", err);
    return { error: "ذخیره محصول با خطا مواجه شد. دوباره امتحان کن." };
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

  // Upload before any DB write, same reasoning as createProduct: a storage
  // failure here should never leave the product half-updated (price/sizes
  // changed but the new photo silently missing).
  let urls: string[];
  try {
    urls = await saveUploadedImages(productId, files);
  } catch (err) {
    console.error("Product image upload failed:", err);
    return { error: "آپلود تصویر با خطا مواجه شد. دوباره امتحان کن — بقیه تغییرات هنوز ذخیره نشده." };
  }

  try {
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
        featuredInHero: formData.get("featuredInHero") === "on",
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
          await deleteUploadedImage(img.url);
        }
      }
    }

    if (urls.length > 0) {
      const existingCount = await db.productImage.count({ where: { productId } });
      await db.productImage.createMany({
        data: urls.map((url, i) => ({ productId, url, sortOrder: existingCount + i })),
      });
    }
  } catch (err) {
    console.error("Product update failed:", err);
    return { error: "ذخیره تغییرات با خطا مواجه شد. دوباره امتحان کن." };
  }

  revalidatePath("/");
  revalidatePath(`/product/${productId}`);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  redirect("/admin/products");
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  const images = await db.productImage.findMany({ where: { productId } });
  await db.product.delete({ where: { id: productId } });
  for (const img of images) {
    await deleteUploadedImage(img.url);
  }
  revalidatePath("/");
  revalidatePath(`/product/${productId}`);
  revalidatePath("/admin/products");
}
