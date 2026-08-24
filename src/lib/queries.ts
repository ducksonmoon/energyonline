import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma";

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { category: true; sizes: true; images: true };
}>;

export async function getStoreSettings() {
  const settings = await db.storeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return settings;
}

export async function getCategories() {
  return db.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getAdminUsers() {
  return db.adminUser.findMany({ select: { id: true, username: true }, orderBy: { username: "asc" } });
}

export async function getProductsWithRelations(): Promise<ProductWithRelations[]> {
  return db.product.findMany({
    include: {
      category: true,
      sizes: { orderBy: { size: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getProductById(id: string): Promise<ProductWithRelations | null> {
  return db.product.findUnique({
    where: { id },
    include: {
      category: true,
      sizes: { orderBy: { size: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getStorefrontData() {
  const [settings, categories, products] = await Promise.all([
    getStoreSettings(),
    getCategories(),
    getProductsWithRelations(),
  ]);
  return { settings, categories, products };
}

export async function getRecentSales(limit = 8) {
  return db.sale.findMany({
    include: { product: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getTodaySalesCount() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return db.sale.count({ where: { createdAt: { gte: startOfToday } } });
}

export async function getSalesReport() {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayAgg, weekAgg, monthAgg, byProductRaw, byStaffRaw, recentSales] = await Promise.all([
    db.sale.aggregate({ where: { createdAt: { gte: startOfToday } }, _count: true, _sum: { price: true } }),
    db.sale.aggregate({ where: { createdAt: { gte: sevenDaysAgo } }, _count: true, _sum: { price: true } }),
    db.sale.aggregate({ where: { createdAt: { gte: startOfMonth } }, _count: true, _sum: { price: true } }),
    db.sale.groupBy({ by: ["productId"], _count: true, _sum: { price: true } }),
    db.sale.groupBy({ by: ["soldBy"], _count: true, _sum: { price: true } }),
    db.sale.findMany({ include: { product: true }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const products = await db.product.findMany({
    where: { id: { in: byProductRaw.map((p) => p.productId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(products.map((p) => [p.id, p.name]));

  const topProducts = byProductRaw
    .map((p) => ({
      productId: p.productId,
      name: nameById.get(p.productId) ?? "—",
      count: p._count,
      revenue: p._sum.price ?? 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const byStaff = byStaffRaw
    .map((s) => ({ username: s.soldBy, count: s._count, revenue: s._sum.price ?? 0 }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    today: { count: todayAgg._count, revenue: todayAgg._sum.price ?? 0 },
    week: { count: weekAgg._count, revenue: weekAgg._sum.price ?? 0 },
    month: { count: monthAgg._count, revenue: monthAgg._sum.price ?? 0 },
    topProducts,
    byStaff,
    recentSales: recentSales.map((s) => ({
      id: s.id,
      productName: s.product.name,
      size: s.size,
      price: s.price,
      soldBy: s.soldBy,
      createdAt: s.createdAt,
    })),
  };
}

export async function getSellScreenData() {
  const [settings, categories, products, recentSales, todaySalesCount] = await Promise.all([
    getStoreSettings(),
    getCategories(),
    getProductsWithRelations(),
    getRecentSales(),
    getTodaySalesCount(),
  ]);
  return { settings, categories, products, recentSales, todaySalesCount };
}
