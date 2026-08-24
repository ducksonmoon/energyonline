"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ProductVM } from "@/lib/productViewModel";
import { ProductDetailContent } from "@/components/storefront/ProductDetailContent";

export function ProductDetailPanel({ product, onClose }: { product: ProductVM | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {product && <PanelContent key={product.id} product={product} onClose={onClose} />}
    </AnimatePresence>
  );
}

function PanelContent({ product, onClose }: { product: ProductVM; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(20,19,17,.55)]"
      />
      <motion.div
        initial={{ x: "102%" }}
        animate={{ x: 0 }}
        exit={{ x: "102%" }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 right-0 bottom-0 w-[min(460px,94vw)] lg:w-[min(940px,92vw)] bg-[var(--bg)] overflow-y-auto"
        style={{ boxShadow: "-20px 0 60px rgba(0,0,0,.25)" }}
      >
        <div className="flex justify-between items-center px-[18px] lg:px-8 py-4 border-b border-[var(--line)] sticky top-0 bg-[var(--bg)] z-[2]">
          <div className="text-[13px] text-[var(--ink-soft)]">{product.catLabel}</div>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-[var(--ink)] p-1.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <ProductDetailContent product={product} onAdded={onClose} />
      </motion.div>
    </div>
  );
}
