import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const db = new PrismaClient({ adapter });

const categories = [
  { key: "jacket", label: "کاپشن", iconKey: "jacket", sortOrder: 0 },
  { key: "shirt", label: "پیراهن", iconKey: "shirt", sortOrder: 1 },
  { key: "tshirt", label: "تیشرت", iconKey: "tshirt", sortOrder: 2 },
  { key: "hoodie", label: "هودی", iconKey: "hoodie", sortOrder: 3 },
  { key: "pants", label: "شلوار", iconKey: "pants", sortOrder: 4 },
  { key: "shoes", label: "کفش", iconKey: "shoes", sortOrder: 5 },
  { key: "socks", label: "جوراب", iconKey: "socks", sortOrder: 6 },
];

const products = [
  {
    name: "کاپشن بمبر ولوسیتی",
    categoryKey: "jacket",
    basePrice: 2850000,
    discountPrice: null as number | null,
    isNew: true,
    description: "کاپشن بمبر با پارچه ضدباد و آستر داخلی گرم. مناسب فصل پاییز و زمستان.",
    sizes: [
      { size: "S", stock: 0 },
      { size: "M", stock: 2 },
      { size: "L", stock: 1 },
      { size: "XL", stock: 0 },
    ],
  },
  {
    name: "تیشرت اورسایز پالس",
    categoryKey: "tshirt",
    basePrice: 1100000,
    discountPrice: 890000,
    isNew: false,
    description: "تیشرت یقه گرد با برش اورسایز و پارچه پنبه سنگین. رنگ ثابت بعد از شست‌وشو.",
    sizes: [
      { size: "S", stock: 4 },
      { size: "M", stock: 3 },
      { size: "L", stock: 0 },
      { size: "XL", stock: 2 },
    ],
  },
  {
    name: "شلوار کارگو مومنتوم",
    categoryKey: "pants",
    basePrice: 1450000,
    discountPrice: null,
    isNew: false,
    description: "شلوار کارگو شش‌جیب با پارچه ضدآب سبک. مناسب استفاده روزمره.",
    sizes: [
      { size: "S", stock: 0 },
      { size: "M", stock: 1 },
      { size: "L", stock: 1 },
      { size: "XL", stock: 0 },
    ],
  },
  {
    name: "کفش اسنیکر بلید",
    categoryKey: "shoes",
    basePrice: 2200000,
    discountPrice: null,
    isNew: true,
    description: "کفش اسنیکر سبک با زیره ضربه‌گیر. مناسب پیاده‌روی روزانه.",
    sizes: [
      { size: "40", stock: 1 },
      { size: "41", stock: 0 },
      { size: "42", stock: 2 },
      { size: "43", stock: 0 },
    ],
  },
  {
    name: "هودی زیپ‌دار ایگنایت",
    categoryKey: "hoodie",
    basePrice: 1650000,
    discountPrice: null,
    isNew: false,
    description: "هودی زیپ‌دار با پارچه فرنچ‌تری داخل پرزدار. مناسب لایه‌بندی در هوای سرد.",
    sizes: [
      { size: "S", stock: 2 },
      { size: "M", stock: 5 },
      { size: "L", stock: 3 },
      { size: "XL", stock: 1 },
    ],
  },
  {
    name: "جوراب ساق‌بلند پک ۳تایی",
    categoryKey: "socks",
    basePrice: 480000,
    discountPrice: 390000,
    isNew: false,
    description: "پک سه‌تایی جوراب ساق‌بلند نخی. مناسب استفاده روزمره و ورزش.",
    sizes: [
      { size: "39-41", stock: 6 },
      { size: "42-44", stock: 2 },
    ],
  },
  {
    name: "شلوار جین راسته کرنت",
    categoryKey: "pants",
    basePrice: 1380000,
    discountPrice: null,
    isNew: false,
    description: "شلوار جین راسته با شست‌وشوی سنگی و پارچه دنیم ضخیم.",
    sizes: [
      { size: "S", stock: 1 },
      { size: "M", stock: 0 },
      { size: "L", stock: 2 },
      { size: "XL", stock: 1 },
    ],
  },
  {
    name: "کفش چرم اسپرت مونارک",
    categoryKey: "shoes",
    basePrice: 2750000,
    discountPrice: null,
    isNew: false,
    description: "کفش چرم اسپرت با بند و زیره لاستیکی. ترکیب راحتی و پوشیدنی روزمره.",
    sizes: [
      { size: "40", stock: 0 },
      { size: "41", stock: 1 },
      { size: "42", stock: 0 },
      { size: "43", stock: 1 },
    ],
  },
];

async function main() {
  const categoryIdByKey = new Map<string, string>();
  for (const c of categories) {
    const row = await db.category.upsert({
      where: { key: c.key },
      update: { label: c.label, iconKey: c.iconKey, sortOrder: c.sortOrder },
      create: c,
    });
    categoryIdByKey.set(c.key, row.id);
  }

  const existingCount = await db.product.count();
  if (existingCount === 0) {
    for (const [i, p] of products.entries()) {
      await db.product.create({
        data: {
          name: p.name,
          description: p.description,
          categoryId: categoryIdByKey.get(p.categoryKey)!,
          basePrice: p.basePrice,
          discountPrice: p.discountPrice,
          isNew: p.isNew,
          sortOrder: i,
          sizes: { create: p.sizes },
        },
      });
    }
  }

  const discountEndsAt = new Date(Date.now() + (2 * 24 + 14) * 3600 * 1000);
  await db.storeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      accentColor: "#f4c81a",
      gridDensity: "comfortable",
      showCountdown: true,
      discountEndsAt,
    },
  });

  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await db.adminUser.upsert({
    where: { username: adminUsername },
    update: {},
    create: { username: adminUsername, passwordHash },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
