import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCategories, getProductById } from "@/lib/queries";
import { updateProduct } from "@/app/admin/(dashboard)/products/actions";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const [categories, product] = await Promise.all([getCategories(), getProductById(id)]);

  if (!product) notFound();

  const boundUpdate = updateProduct.bind(null, product.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ویرایش محصول</h1>
        <p className="text-sm text-muted-foreground">{product.name}</p>
      </div>
      <ProductForm categories={categories} action={boundUpdate} product={product} submitLabel="ذخیره تغییرات" />
    </div>
  );
}
