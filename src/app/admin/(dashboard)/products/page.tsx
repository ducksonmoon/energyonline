import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { getProductsWithRelations } from "@/lib/queries";
import { totalStock, isOffer } from "@/lib/derived";
import { formatToman, toFa } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await getProductsWithRelations();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">محصولات</h1>
          <p className="text-sm text-muted-foreground">مدیریت محصولات، سایزها و موجودی</p>
        </div>
        <Link href="/admin/products/new" className={buttonVariants()}>
          + محصول جدید
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border bg-card py-8 text-center text-muted-foreground">هنوز محصولی اضافه نشده.</div>
      ) : (
        <>
          {/* Mobile: a card per product — a 6-column table doesn't fit a narrow screen. */}
          <div className="space-y-3 sm:hidden">
            {products.map((p) => {
              const stock = totalStock(p.sizes);
              const offer = isOffer(p);
              const hasFlash = p.flashPrice != null && p.flashPrice < p.basePrice;
              return (
                <div key={p.id} className="rounded-xl border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category.label}</p>
                    </div>
                    {hasFlash ? (
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-destructive font-medium">{formatToman(p.flashPrice!)}</span>
                        <span className="text-xs text-muted-foreground line-through">{formatToman(p.basePrice)}</span>
                      </div>
                    ) : offer ? (
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-destructive font-medium">{formatToman(p.discountPrice!)}</span>
                        <span className="text-xs text-muted-foreground line-through">{formatToman(p.basePrice)}</span>
                      </div>
                    ) : (
                      <span className="shrink-0 font-medium">{formatToman(p.basePrice)}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline">موجودی: {toFa(stock)}</Badge>
                    {p.isNew && <Badge variant="secondary">تازه رسیده</Badge>}
                    {hasFlash && <Badge variant="destructive">روز ویژه</Badge>}
                    {offer && !hasFlash && <Badge>تخفیف</Badge>}
                    {stock === 0 && <Badge variant="destructive">ناموجود</Badge>}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}
                    >
                      ویرایش
                    </Link>
                    <DeleteProductButton productId={p.id} productName={p.name} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop/tablet: full table */}
          <div className="hidden rounded-xl border bg-card sm:block">
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
                      <TableCell>
                        <div className="flex gap-1.5 flex-wrap">
                          {p.isNew && <Badge variant="secondary">تازه رسیده</Badge>}
                          {hasFlash && <Badge variant="destructive">روز ویژه</Badge>}
                          {offer && !hasFlash && <Badge>تخفیف</Badge>}
                          {stock === 0 && <Badge variant="destructive">ناموجود</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/products/${p.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                            ویرایش
                          </Link>
                          <DeleteProductButton productId={p.id} productName={p.name} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
