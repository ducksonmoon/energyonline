import { ProductForm } from "@/components/admin/ProductForm";
import { getCategories } from "@/lib/queries";
import { createProduct } from "@/app/admin/(dashboard)/products/actions";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">محصول جدید</h1>
        <p className="text-sm text-muted-foreground">یک محصول تازه به فروشگاه اضافه کن</p>
      </div>
      <ProductForm categories={categories} action={createProduct} submitLabel="ایجاد محصول" />
    </div>
  );
}
