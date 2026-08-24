"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { effectivePrice, isFlashSaleActive } from "@/lib/derived";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export type SellResult =
  | {
      ok: true;
      sale: { id: string; productId: string; productName: string; size: string; time: string };
      remainingStock: number;
    }
  | { ok: false; error: string };

export async function sellItem(productId: string, size: string): Promise<SellResult> {
  const session = await requireAdmin();

  try {
    const result = await db.$transaction(async (tx) => {
      const sizeRow = await tx.productSize.findUnique({
        where: { productId_size: { productId, size } },
      });
      if (!sizeRow || sizeRow.stock <= 0) {
        throw new Error("این سایز موجود نیست");
      }

      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("محصول یافت نشد");

      const settings = await tx.storeSettings.findUnique({ where: { id: 1 } });
      const flashActive = settings ? isFlashSaleActive(settings) : false;
      const price = effectivePrice(product, flashActive);

      await tx.productSize.update({ where: { id: sizeRow.id }, data: { stock: { decrement: 1 } } });
      const sale = await tx.sale.create({
        data: { productId, size, price, soldBy: session.username },
      });

      return { sale, productName: product.name, remainingStock: sizeRow.stock - 1 };
    });

    revalidatePath("/");
    revalidatePath("/admin/sell");
    revalidatePath("/admin");

    return {
      ok: true,
      sale: {
        id: result.sale.id,
        productId,
        productName: result.productName,
        size,
        time: result.sale.createdAt.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
      },
      remainingStock: result.remainingStock,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "ثبت فروش با خطا مواجه شد" };
  }
}

export async function undoSale(saleId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();

  try {
    await db.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id: saleId } });
      if (!sale) throw new Error("این فروش یافت نشد");
      await tx.productSize.updateMany({
        where: { productId: sale.productId, size: sale.size },
        data: { stock: { increment: 1 } },
      });
      await tx.sale.delete({ where: { id: saleId } });
    });

    revalidatePath("/");
    revalidatePath("/admin/sell");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "برگرداندن فروش با خطا مواجه شد" };
  }
}
