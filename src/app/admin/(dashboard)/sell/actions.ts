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
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("محصول یافت نشد");

      const settings = await tx.storeSettings.findUnique({ where: { id: 1 } });
      const flashActive = settings ? isFlashSaleActive(settings) : false;
      const price = effectivePrice(product, flashActive);

      // Conditional decrement (only rows where stock is still > 0), not a
      // read-then-write: if two employees sell the last unit of the same
      // size at the same moment, only one UPDATE can match and win — the
      // other gets count 0 and the "not available" error below, instead of
      // both succeeding and taking stock negative.
      const { count } = await tx.productSize.updateMany({
        where: { productId, size, stock: { gt: 0 } },
        data: { stock: { decrement: 1 } },
      });
      if (count === 0) throw new Error("این سایز موجود نیست");

      const sizeRow = await tx.productSize.findUniqueOrThrow({
        where: { productId_size: { productId, size } },
      });
      const sale = await tx.sale.create({
        data: { productId, size, price, soldBy: session.username },
      });

      return { sale, productName: product.name, remainingStock: sizeRow.stock };
    });

    revalidatePath("/");
    revalidatePath(`/product/${productId}`);
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
    const productId = await db.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id: saleId } });
      if (!sale) throw new Error("این فروش یافت نشد");
      await tx.productSize.updateMany({
        where: { productId: sale.productId, size: sale.size },
        data: { stock: { increment: 1 } },
      });
      await tx.sale.delete({ where: { id: saleId } });
      return sale.productId;
    });

    revalidatePath("/");
    revalidatePath(`/product/${productId}`);
    revalidatePath("/admin/sell");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "برگرداندن فروش با خطا مواجه شد" };
  }
}
