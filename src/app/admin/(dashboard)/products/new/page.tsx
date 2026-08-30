import { ProductForm, type ProductInitialValues } from "@/components/admin/ProductForm";
import { getCategories, getProductById } from "@/lib/queries";
import { createProduct } from "@/app/admin/(dashboard)/products/actions";

export default async function NewProductPage({ searchParams }: PageProps<"/admin/products/new">) {
  const { from } = await searchParams;
  const [categories, sourceProduct] = await Promise.all([
    getCategories(),
    typeof from === "string" ? getProductById(from) : null,
  ]);

  // "کپی از محصول" — name, category, description and price repeat across a
  // batch of otherwise-identical stock (same tee, several units), so a
  // duplicate carries those over. Never sizes/stock (a new batch's real
  // counts) or photos (would otherwise share the original's storage files).
  const initialValues: ProductInitialValues | undefined = sourceProduct
    ? {
        name: sourceProduct.name,
        categoryId: sourceProduct.categoryId,
        description: sourceProduct.description,
        basePrice: sourceProduct.basePrice,
        discountPrice: sourceProduct.discountPrice,
        flashPrice: sourceProduct.flashPrice,
        isNew: sourceProduct.isNew,
        featuredInHero: false,
        sizes: sourceProduct.sizes.map((s) => s.size),
      }
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">محصول جدید</h1>
        <p className="text-sm text-muted-foreground">
          {sourceProduct ? `کپی از «${sourceProduct.name}» — عکس و موجودی رو خودت وارد کن` : "یک محصول تازه به فروشگاه اضافه کن"}
        </p>
      </div>
      <ProductForm categories={categories} action={createProduct} initialValues={initialValues} submitLabel="ایجاد محصول" />
    </div>
  );
}
