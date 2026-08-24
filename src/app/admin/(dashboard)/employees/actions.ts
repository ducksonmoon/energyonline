"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

const schema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "نام کاربری باید حداقل ۳ کاراکتر باشه")
    .regex(/^[a-zA-Z0-9_.-]+$/, "نام کاربری فقط می‌تونه حروف انگلیسی، عدد، نقطه، خط تیره یا زیرخط داشته باشه"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشه"),
});

export type EmployeeActionResult = { error?: string } | undefined;

export async function createEmployee(input: z.infer<typeof schema>): Promise<EmployeeActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر" };

  const existing = await db.adminUser.findUnique({ where: { username: parsed.data.username } });
  if (existing) return { error: "این نام کاربری قبلاً استفاده شده" };

  const passwordHash = await hashPassword(parsed.data.password);
  await db.adminUser.create({ data: { username: parsed.data.username, passwordHash } });

  revalidatePath("/admin/employees");
  return undefined;
}

export async function deleteEmployee(id: string): Promise<EmployeeActionResult> {
  const session = await requireAdmin();
  if (id === session.sub) return { error: "نمی‌تونی حساب خودت رو حذف کنی" };

  const total = await db.adminUser.count();
  if (total <= 1) return { error: "حداقل باید یک حساب مدیریت باقی بمونه" };

  await db.adminUser.delete({ where: { id } });
  revalidatePath("/admin/employees");
  return undefined;
}
