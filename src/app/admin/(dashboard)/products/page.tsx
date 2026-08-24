import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { getProductsWithRelations } from "@/lib/queries";
import { totalStock, isOffer } from "@/lib/derived";
import { formatToman, toFa } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await getProductsWithRelations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">محصولات</h1>
          <p className="text-sm text-muted-foreground">مدیریت محصولات، سایزها و موجودی</p>
        </div>
        <Link href="/admin/products/new" className={buttonVariants()}>
          + محصول جدید
        </Link>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام</TableHead>
              <TableHead>دسته‌بندی</TableHead>
              <TableHead>قیمت</TableHead>
              <TableHead>موجودی</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const stock = totalStock(p.sizes);
              const offer = isOffer(p);
              const hasFlash = p.flashPrice != null && p.flashPrice < p.basePrice;
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium max-w-[220px] truncate">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.category.label}</TableCell>
                  <TableCell>
                    {hasFlash ? (
                      <div className="flex flex-col">
                        <span className="text-destructive font-medium">{formatToman(p.flashPrice!)}</span>
                        <span className="text-xs text-muted-foreground line-through">{formatToman(p.basePrice)}</span>
                      </div>
                    ) : offer ? (
                      <div className="flex flex-col">
                        <span className="text-destructive font-medium">{formatToman(p.discountPrice!)}</span>
                        <span className="text-xs text-muted-foreground line-through">{formatToman(p.basePrice)}</span>
                      </div>
                    ) : (
                      formatToman(p.basePrice)
                    )}
                  </TableCell>
                  <TableCell>{toFa(stock)}</TableCell>
                  <TableCell className="flex gap-1.5 flex-wrap">
                    {p.isNew && <Badge variant="secondary">تازه رسیده</Badge>}
                    {hasFlash && <Badge variant="destructive">روز ویژه</Badge>}
                    {offer && !hasFlash && <Badge>تخفیف</Badge>}
                    {stock === 0 && <Badge variant="destructive">ناموجود</Badge>}
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Link href={`/admin/products/${p.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                      ویرایش
                    </Link>
                    <DeleteProductButton productId={p.id} productName={p.name} />
                  </TableCell>
                </TableRow>
              );
            })}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  هنوز محصولی اضافه نشده.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
