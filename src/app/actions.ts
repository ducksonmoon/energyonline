"use server";

import { db } from "@/lib/db";

/** productId -> size -> current stock, for the cart drawer's live re-check. */
export async function getLiveCartStock(productIds: string[]): Promise<Record<string, Record<string, number>>> {
  if (productIds.length === 0) return {};
  const sizes = await db.productSize.findMany({
    where: { productId: { in: productIds } },
    select: { productId: true, size: true, stock: true },
  });
  const result: Record<string, Record<string, number>> = {};
  for (const s of sizes) {
    (result[s.productId] ??= {})[s.size] = s.stock;
  }
  return result;
}
