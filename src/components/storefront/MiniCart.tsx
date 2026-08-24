"use client";

import { motion } from "framer-motion";
import { useCartStore } from "@/store/cart";

export function MiniCart({ onClick }: { onClick: () => void }) {
  const count = useCartStore((s) => s.items.length);

  return (
    <button
      onClick={onClick}
      className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-[30px] px-[18px] py-3 cursor-pointer bg-[var(--ink)] text-[var(--bg)]"
      style={{ boxShadow: "0 10px 30px rgba(0,0,0,.25)" }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 6h15l-1.5 9h-12z" />
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
        <path d="M3 3h2l1 3" />
      </svg>
      <motion.span
        key={count}
        initial={{ scale: 1.3, rotate: -4 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="font-bold text-sm"
      >
        سبد ({count})
      </motion.span>
    </button>
  );
}
