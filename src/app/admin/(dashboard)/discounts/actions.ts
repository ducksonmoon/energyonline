"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

export async function setProductDiscount(productId: string, discountPrice: number | null) {
  await requireAdmin();
  await db.product.update({ where: { id: productId }, data: { discountPrice } });
  revalidatePath("/");
  revalidatePath("/admin/discounts");
  revalidatePath("/admin/products");
}

export async function bulkApplyDiscountPercent(productIds: string[], percent: number) {
  await requireAdmin();
  if (productIds.length === 0 || percent <= 0 || percent >= 100) return;
  const products = await db.product.findMany({ where: { id: { in: productIds } } });
  await Promise.all(
    products.map((p) =>
      db.product.update({
        where: { id: p.id },
        data: { discountPrice: Math.round(p.basePrice * (1 - percent / 100)) },
      })
    )
  );
  revalidatePath("/");
  revalidatePath("/admin/discounts");
  revalidatePath("/admin/products");
}

export async function bulkClearDiscount(productIds: string[]) {
  await requireAdmin();
  if (productIds.length === 0) return;
  await db.product.updateMany({ where: { id: { in: productIds } }, data: { discountPrice: null } });
  revalidatePath("/");
  revalidatePath("/admin/discounts");
  revalidatePath("/admin/products");
}

export async function updateCountdownSettings(discountEndsAt: Date | null, showCountdown: boolean) {
  await requireAdmin();
  await db.storeSettings.upsert({
    where: { id: 1 },
    update: { discountEndsAt, showCountdown },
    create: { id: 1, discountEndsAt, showCountdown },
  });
  revalidatePath("/");
  revalidatePath("/admin/discounts");
}
