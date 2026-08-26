"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { MouseEvent } from "react";
import { useHmsCountdown } from "@/lib/useHmsCountdown";
import { RevealOnScroll } from "@/components/storefront/RevealOnScroll";
import { toFa } from "@/lib/format";
import type { ProductVM } from "@/lib/productViewModel";

export function FlashSaleSection({
  endsAt,
  title,
  subtitle,
  products,
  onOpen,
}: {
  endsAt: Date | null;
  title: string;
  subtitle: string;
  products: ProductVM[];
  onOpen: (id: string) => void;
}) {
  const { text, expired } = useHmsCountdown(endsAt);

  if (!endsAt || expired || products.length === 0) return null;

  return (
    <div
      id="flash"
      className="relative overflow-hidden px-5 py-12 sm:py-16"
      style={{
        background: "var(--ink)",
        backgroundImage:
          "radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--brand-red) 55%, transparent), transparent 55%)",
      }}
    >
      <RevealOnScroll className="mx-auto max-w-[1280px]">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-4">
          <div className="flex flex-wrap items-baseline gap-3.5">
            <div
              className="rounded text-[clamp(30px,6.5vw,52px)] font-black leading-none text-[var(--accent)] [animation:flashPulse_2.4s_ease-in-out_infinite]"
            >
              {title}
            </div>
            <div className="text-sm text-[rgba(246,242,236,.65)]">{subtitle}</div>
          </div>
          <div className="flex items-center gap-2 rounded border border-[rgba(246,242,236,.16)] bg-[rgba(246,242,236,.08)] px-4 py-2.5">
            <span className="text-xs text-[rgba(246,242,236,.6)]">پایان:</span>
            <span className="text-lg font-extrabold tracking-wide text-[var(--accent)]" dir="ltr">
              {text}
            </span>
          </div>
        </div>
      </RevealOnScroll>

      <div className="mx-auto mt-7 grid max-w-[1280px] grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: (i * 70) / 1000 }}
            className="overflow-hidden rounded-md bg-[var(--bg)]"
          >
            <Link
              href={`/product/${p.id}`}
              onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                onOpen(p.id);
              }}
              className="cursor-pointer block text-right"
            >
              <div
                className={`relative flex aspect-[4/5] items-center justify-center overflow-hidden text-[var(--ink-soft)] ${p.image ? "bg-white" : "bg-[var(--bg-alt)]"}`}
              >
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 45vw, 260px"
                    quality={90}
                    className="object-contain"
                  />
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="opacity-50">
                    <path d="M9 4h6l1 2h3a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h3z" />
                    <path d="M9 4a3 3 0 006 0" />
                  </svg>
                )}
                <div className="absolute top-2 left-2 rounded-full bg-[var(--brand-red)] px-2 py-1 text-[11px] font-extrabold text-[var(--accent)]">
                  ٪{toFa(p.discountPct)}
                </div>
              </div>
              <div className="p-2.5 sm:p-3">
                <div className="mb-1 text-[10.5px] text-[var(--ink-soft)]">{p.catLabel}</div>
                <div className="mb-1.5 text-[13.5px] font-bold">{p.name}</div>
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <div className="text-[13.5px] font-extrabold text-[var(--brand-red)]">{p.priceFa}</div>
                  <div className="text-[11px] text-[var(--ink-soft)] line-through">{p.originalPriceFa}</div>
                </div>
                <div className="mt-1 text-[11px] font-semibold" style={{ color: p.stockColor }}>
                  {p.stockLabel}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
