"use client";

import { ProductCard } from "@/components/storefront/ProductCard";
import type { ProductVM } from "@/lib/productViewModel";

export function ProductGrid({
  products,
  loaded,
  gridDensity,
  onOpen,
  emptyMessage = "محصولی در این دسته پیدا نشد.",
}: {
  products: ProductVM[];
  loaded: boolean;
  gridDensity: string;
  onOpen: (id: string) => void;
  emptyMessage?: string;
}) {
  // Products are the actual thing being sold — capped one column lower than
  // before at every breakpoint so each photo reads as the focus of the page
  // instead of a small tile in a dense grid.
  const cols =
    gridDensity === "compact"
      ? "grid-cols-2 min-[420px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  const gap = gridDensity === "compact" ? "gap-2.5 sm:gap-3" : "gap-3.5 sm:gap-5";

  // A fixed-column grid always reserves every column's width even when there
  // aren't enough products to fill a row, which reads as a big dead strip of
  // empty space next to a couple of cards rather than "not many results yet".
  // Below a full row at any breakpoint, switch to a centered flex-wrap of
  // fixed-width cards instead, so a small catalog reads as intentionally
  // small rather than broken.
  const isSparse = products.length > 0 && products.length <= 3;

  return (
    <div
      className={
        isSparse
          ? `max-w-[1280px] mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-12 sm:pb-[70px] flex flex-wrap justify-center ${gap}`
          : `max-w-[1280px] mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-12 sm:pb-[70px] grid ${cols} ${gap}`
      }
    >
      {products.map((p, i) =>
        isSparse ? (
          <div key={p.id} className="w-[155px] sm:w-[200px] lg:w-[260px]">
            <ProductCard product={p} loaded={loaded} delay={(i % 4) * 70} onOpen={() => onOpen(p.id)} />
          </div>
        ) : (
          <ProductCard key={p.id} product={p} loaded={loaded} delay={(i % 4) * 70} onOpen={() => onOpen(p.id)} />
        )
      )}
      {products.length === 0 && (
        <div className="col-span-full text-center py-16 text-[var(--ink-soft)] text-sm">{emptyMessage}</div>
      )}
    </div>
  );
}
