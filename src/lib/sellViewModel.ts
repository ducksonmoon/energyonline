import type { ProductWithRelations } from "@/lib/queries";
import type { Prisma } from "@/generated/prisma";

export type SellProduct = {
  id: string;
  name: string;
  categoryKey: string;
  catLabel: string;
  image: string | null;
  sizes: { size: string; stock: number }[];
};

export function toSellProduct(p: ProductWithRelations): SellProduct {
  return {
    id: p.id,
    name: p.name,
    categoryKey: p.category.key,
    catLabel: p.category.label,
    image: p.images[0]?.url ?? null,
    sizes: p.sizes.map((s) => ({ size: s.size, stock: s.stock })),
  };
}

export type SaleLogEntry = {
  id: string;
  productId: string;
  productName: string;
  size: string;
  time: string;
  isToday: boolean;
};

type SaleWithProduct = Prisma.SaleGetPayload<{ include: { product: true } }>;

export function toSaleLogEntry(s: SaleWithProduct): SaleLogEntry {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return {
    id: s.id,
    productId: s.productId,
    productName: s.product.name,
    size: s.size,
    time: s.createdAt.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
    isToday: s.createdAt >= startOfToday,
  };
}
