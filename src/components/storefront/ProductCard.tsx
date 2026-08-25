"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { MouseEvent } from "react";
import type { ProductVM } from "@/lib/productViewModel";
import { toFa } from "@/lib/format";

export function ProductCard({
  product,
  loaded,
  delay,
  onOpen,
}: {
  product: ProductVM;
  loaded: boolean;
  delay: number;
  onOpen: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: delay / 1000 }}
    >
      <Link
        href={`/product/${product.id}`}
        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
          if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          onOpen();
        }}
        className="cursor-pointer text-right w-full block"
      >
        <div className="relative aspect-[4/5] rounded-md bg-[var(--bg-alt)] flex items-center justify-center text-[var(--ink-soft)] overflow-hidden">
          {loaded ? (
            <>
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 45vw, 220px"
                  className="object-contain"
                />
              ) : (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="opacity-50">
                  <path d="M9 4h6l1 2h3a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h3z" />
                  <path d="M9 4a3 3 0 006 0" />
                </svg>
              )}
              {product.isNew && (
                <div className="absolute top-2.5 right-2.5 bg-[var(--ink)] text-[var(--bg)] text-[10px] tracking-wide font-bold px-2.5 py-1 rounded-full">
                  تازه رسیده
                </div>
              )}
              {product.isOffer && (
                <div className="absolute top-2.5 left-2.5 bg-[var(--brand-red)] text-[var(--accent)] text-[10px] tracking-wide font-extrabold px-2.5 py-1 rounded-full">
                  ٪{toFa(product.discountPct)} تخفیف
                </div>
              )}
            </>
          ) : (
            <div
              className="absolute inset-0 [animation:shimmer_1.5s_ease-in-out_infinite]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--line) 25%, rgba(20,19,17,.08) 37%, var(--line) 63%)",
                backgroundSize: "400% 100%",
              }}
            />
          )}
        </div>
        <div className="pt-3 px-0.5">
          <div className="text-[11px] text-[var(--ink-soft)] mb-1">{product.catLabel}</div>
          <div className="text-[15px] font-bold mb-1.5">{product.name}</div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-bold" style={{ color: product.isOffer ? "var(--brand-red)" : "var(--ink)" }}>
              {product.priceFa}
            </div>
            <div className="text-[11px] font-semibold" style={{ color: product.stockColor }}>
              {product.stockLabel}
            </div>
          </div>
          {product.isOffer && (
            <div className="text-xs text-[var(--ink-soft)] line-through mt-0.5">{product.originalPriceFa}</div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
