"use client";

import { ProductCard } from "@/components/storefront/ProductCard";
import type { ProductVM } from "@/lib/productViewModel";

export function ProductGrid({
  products,
  loaded,
  gridDensity,
  onOpen,
}: {
  products: ProductVM[];
  loaded: boolean;
  gridDensity: string;
  onOpen: (id: string) => void;
}) {
  const cols =
    gridDensity === "compact"
      ? "grid-cols-2 min-[420px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  const gap = gridDensity === "compact" ? "gap-2.5 sm:gap-3" : "gap-3.5 sm:gap-5";

  return (
    <div className={`max-w-[1100px] mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-12 sm:pb-[70px] grid ${cols} ${gap}`}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} loaded={loaded} delay={(i % 4) * 70} onOpen={() => onOpen(p.id)} />
      ))}
      {products.length === 0 && (
        <div className="col-span-full text-center py-16 text-[var(--ink-soft)] text-sm">
          محصولی در این دسته پیدا نشد.
        </div>
      )}
    </div>
  );
}
