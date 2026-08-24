import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { getCategories } from "@/lib/queries";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">دسته‌بندی‌ها</h1>
        <p className="text-sm text-muted-foreground">مدیریت دسته‌بندی‌های محصولات و آیکون‌ها</p>
      </div>
      <CategoriesManager categories={categories} />
    </div>
  );
}
