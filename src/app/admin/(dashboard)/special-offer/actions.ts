"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

export async function updateFlashSaleSettings(data: {
  flashSaleEnabled: boolean;
  flashSaleEndsAt: Date | null;
  flashSaleTitle: string;
  flashSaleSubtitle: string;
  flashSaleBannerText: string;
}) {
  await requireAdmin();
  await db.storeSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
  revalidatePath("/");
  revalidatePath("/admin/special-offer");
}

export async function setProductFlashPrice(productId: string, flashPrice: number | null) {
  await requireAdmin();
  await db.product.update({ where: { id: productId }, data: { flashPrice } });
  revalidatePath("/");
  revalidatePath("/admin/special-offer");
  revalidatePath("/admin/products");
}

export async function bulkApplyFlashPercent(productIds: string[], percent: number) {
  await requireAdmin();
  if (productIds.length === 0 || percent <= 0 || percent >= 100) return;
  const products = await db.product.findMany({ where: { id: { in: productIds } } });
  await Promise.all(
    products.map((p) =>
      db.product.update({
        where: { id: p.id },
        data: { flashPrice: Math.round(p.basePrice * (1 - percent / 100)) },
      })
    )
  );
  revalidatePath("/");
  revalidatePath("/admin/special-offer");
  revalidatePath("/admin/products");
}

export async function bulkClearFlashPrice(productIds: string[]) {
  await requireAdmin();
  if (productIds.length === 0) return;
  await db.product.updateMany({ where: { id: { in: productIds } }, data: { flashPrice: null } });
  revalidatePath("/");
  revalidatePath("/admin/special-offer");
  revalidatePath("/admin/products");
}
