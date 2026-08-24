"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

const categorySchema = z.object({
  key: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "کلید باید فقط شامل حروف انگلیسی کوچک، عدد و خط تیره باشد"),
  label: z.string().min(1),
  iconKey: z.string().min(1),
  sortOrder: z.number().int().min(0),
});

export type CategoryActionResult = { error?: string } | undefined;

export async function createCategory(input: z.infer<typeof categorySchema>): Promise<CategoryActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر" };

  const existing = await db.category.findUnique({ where: { key: parsed.data.key } });
  if (existing) return { error: "این کلید قبلاً استفاده شده" };

  await db.category.create({ data: parsed.data });
  revalidatePath("/");
  revalidatePath("/admin/categories");
  return undefined;
}

export async function updateCategory(
  id: string,
  input: { label: string; iconKey: string; sortOrder: number }
): Promise<CategoryActionResult> {
  await requireAdmin();
  await db.category.update({ where: { id }, data: input });
  revalidatePath("/");
  revalidatePath("/admin/categories");
  return undefined;
}

export async function deleteCategory(id: string): Promise<CategoryActionResult> {
  await requireAdmin();
  const productCount = await db.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return { error: "این دسته‌بندی محصول داره، اول محصولاتش رو جابه‌جا یا حذف کن" };
  }
  await db.category.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/categories");
  return undefined;
}
