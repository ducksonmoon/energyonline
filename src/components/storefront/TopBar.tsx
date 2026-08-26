"use client";

import { motion } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { cartItemCount } from "@/lib/cart";

export function TopBar({ onCartClick }: { onCartClick: () => void }) {
  const cartCount = useCartStore((s) => cartItemCount(s.items));

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-md">
      <div className="flex items-center gap-1.5">
        <span
          className="text-xl font-bold tracking-wide -skew-x-[8deg] inline-block"
          style={{ fontFamily: "var(--font-lalezar)" }}
        >
          انرژی
        </span>
        <svg width="18" height="13" viewBox="0 0 20 14">
          <ellipse cx="10" cy="7" rx="9" ry="6.5" fill="var(--brand-red)" />
          <path
            d="M13 2.5L6 7l7 4.5"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={onCartClick}
        className="flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3.5 py-2 cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 6h15l-1.5 9h-12z" />
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="18" cy="20" r="1.4" />
          <path d="M3 3h2l1 3" />
        </svg>
        <span className="text-sm font-semibold">{cartCount}</span>
      </motion.button>
    </div>
  );
}
