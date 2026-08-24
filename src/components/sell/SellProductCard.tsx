"use client";

import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toFa } from "@/lib/format";
import type { SellProduct } from "@/lib/sellViewModel";

export function SellProductCard({
  product,
  onSell,
}: {
  product: SellProduct;
  onSell: (size: string) => void;
}) {
  const total = product.sizes.reduce((sum, s) => sum + s.stock, 0);

  return (
    <Card className={total === 0 ? "opacity-60" : undefined}>
      <div className="relative aspect-[4/3] bg-muted">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill sizes="240px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M9 4h6l1 2h3a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h3z" />
              <path d="M9 4a3 3 0 006 0" />
            </svg>
          </div>
        )}
        {total === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-xs font-semibold">
            ناموجود
          </div>
        )}
      </div>
      <CardHeader className="pb-1">
        <CardDescription>{product.catLabel}</CardDescription>
        <CardTitle className="text-[15px]">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1.5">
        {product.sizes.map((s) => {
          const disabled = s.stock <= 0;
          return (
            <Button
              key={s.size}
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => onSell(s.size)}
              className="h-auto min-w-[48px] flex-col gap-0.5 py-1.5 px-2 active:translate-y-0 active:scale-95"
            >
              <span className="text-xs font-bold">{s.size}</span>
              <span className={s.stock > 0 && s.stock <= 2 ? "text-[10px] font-semibold text-primary" : "text-[10px] text-muted-foreground"}>
                {toFa(s.stock)}
              </span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
