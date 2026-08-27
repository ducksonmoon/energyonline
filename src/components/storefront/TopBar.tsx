"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { cartItemCount } from "@/lib/cart";

export function TopBar({
  onCartClick,
  instagramHandle,
}: {
  onCartClick: () => void;
  instagramHandle: string;
}) {
  const cartCount = useCartStore((s) => cartItemCount(s.items));

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-md">
      <Image
        src="/brand/energie-logo-dark.png"
        alt="انرژی"
        width={1984}
        height={321}
        priority
        className="h-9 w-auto"
      />
      <div className="flex items-center gap-2">
        <a
          href={`https://instagram.com/${instagramHandle}`}
          target="_blank"
          rel="noreferrer"
          aria-label="اینستاگرام"
          className="flex items-center justify-center w-9 h-9 rounded-full border border-[var(--line)]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
            <circle cx="12" cy="12" r="4.1" />
            <circle cx="17.1" cy="6.9" r="1.15" fill="currentColor" stroke="none" />
          </svg>
        </a>
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
    </div>
  );
}
