"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

const schema = z.object({
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "کد رنگ نامعتبر است"),
  gridDensity: z.enum(["comfortable", "compact"]),
  address: z.string().min(1),
  mapUrl: z.string().url("لینک نقشه معتبر نیست"),
  mapLat: z.coerce.number().min(-90).max(90, "عرض جغرافیایی نامعتبر است"),
  mapLng: z.coerce.number().min(-180).max(180, "طول جغرافیایی نامعتبر است"),
  phone: z.string().min(1),
  phoneTurkey: z.string().min(1),
  hoursWeekday: z.string().min(1),
  hoursThursday: z.string().min(1),
  hoursFriday: z.string().min(1),
  instagramHandle: z.string().min(1),
  telegramHandle: z.string().min(1),
});

export type SettingsFormState = { error?: string; success?: boolean } | undefined;

export async function updateStoreSettings(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "خطا در اطلاعات فرم" };

  await db.storeSettings.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateSalesPauseSettings(salesPaused: boolean, salesPausedMessage: string) {
  await requireAdmin();
  await db.storeSettings.upsert({
    where: { id: 1 },
    update: { salesPaused, salesPausedMessage },
    create: { id: 1, salesPaused, salesPausedMessage },
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
}
