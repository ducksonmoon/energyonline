"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { toast } from "sonner";
import type { ProductVM } from "@/lib/productViewModel";
import { toFa } from "@/lib/format";
import { useCartStore } from "@/store/cart";

const SIZE_GUIDE_ROWS = [
  ["S", "۹۲", "۷۴", "۶۶"],
  ["M", "۹۸", "۸۰", "۶۸"],
  ["L", "۱۰۴", "۸۶", "۷۰"],
  ["XL", "۱۱۰", "۹۲", "۷۲"],
];

export function ProductDetailContent({ product, onAdded }: { product: ProductVM; onAdded?: () => void }) {
  // With only one purchasable size, requiring a click before the CTA
  // activates just reads as broken — the chip looks the same either way
  // until you notice the button text changed. Auto-select it instead.
  const [selectedSize, setSelectedSize] = useState<string | null>(() => {
    const inStock = product.sizes.filter((s) => s.stock > 0);
    return inStock.length === 1 ? inStock[0].size : null;
  });
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const addItem = useCartStore((s) => s.addItem);

  const hasSizeGuide = !["shoes", "socks"].includes(product.categoryKey);

  function handleAdd() {
    if (!selectedSize) return;
    const stock = product.sizes.find((s) => s.size === selectedSize)?.stock ?? 0;
    const result = addItem(
      { productId: product.id, name: product.name, size: selectedSize, price: product.price, image: product.image },
      stock
    );
    if (result === "max-reached") {
      toast.error(`فقط ${toFa(stock)} عدد از این سایز موجوده — همه‌شون همین الان تو سبد شماست`);
      return;
    }
    toast.success("به سبد اضافه شد", { description: `${product.name} — سایز ${selectedSize}` });
    onAdded?.();
  }

  return (
    <div className="p-5 lg:px-8 lg:py-7 lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start">
      <div className="lg:sticky lg:top-[76px]">
        <div
          className="aspect-[4/5] rounded-lg flex items-center justify-center relative mb-3 overflow-hidden"
          style={{
            background: product.images[galleryIndex] ? "#fff" : "linear-gradient(155deg, var(--bg-alt), #ddd4c4)",
          }}
        >
          {product.images[galleryIndex] ? (
            <Image
              src={product.images[galleryIndex]}
              alt={product.name}
              fill
              sizes="(max-width: 1023px) 94vw, 440px"
              quality={90}
              className="object-contain"
              priority
            />
          ) : (
            <svg
              width="52"
              height="52"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.1"
              className="text-[var(--ink-soft)]"
            >
              <path d="M9 4h6l1 2h3a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h3z" />
              <path d="M9 4a3 3 0 006 0" />
            </svg>
          )}
          {product.isNew && (
            <div className="absolute top-3 right-3 bg-[var(--ink)] text-[var(--bg)] text-[11px] font-bold px-2.5 py-1.5 rounded-full">
              دراپ جدید
            </div>
          )}
        </div>

        {product.images.length > 1 && (
          <div className="flex gap-2 mb-5 lg:mb-0">
            {product.images.map((img, i) => (
              <button
                key={img + i}
                onClick={() => setGalleryIndex(i)}
                className="relative w-11 h-[54px] rounded-[5px] cursor-pointer overflow-hidden bg-white"
                style={{
                  border: i === galleryIndex ? "2px solid var(--accent)" : "1px solid var(--line)",
                }}
              >
                <Image src={img} alt="" fill sizes="44px" quality={90} className="object-contain" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="text-[22px] font-extrabold mb-1.5">{product.name}</div>
        <div className="flex items-baseline gap-2.5 mb-3.5">
          <div className="text-lg font-bold" style={{ color: product.isOffer ? "var(--brand-red)" : "var(--ink)" }}>
            {product.priceFa}
          </div>
          {product.isOffer && (
            <>
              <div className="text-sm text-[var(--ink-soft)] line-through">{product.originalPriceFa}</div>
              <div className="text-[11px] font-extrabold bg-[var(--brand-red)] text-[var(--accent)] px-2 py-[3px] rounded-2xl">
                ٪{toFa(product.discountPct)}
              </div>
            </>
          )}
        </div>
        <div
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-3 py-1.5 rounded-2xl mb-5"
          style={{ color: product.stockColor, background: product.stockBg }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {product.stockLabelLong}
        </div>

        <div className="text-sm leading-[1.9] text-[var(--ink-soft)] mb-6">{product.description}</div>

        <div className="flex items-center justify-between mb-2.5">
          <div className="text-[13px] font-semibold">سایز</div>
          {hasSizeGuide && (
            <button
              onClick={() => setSizeGuideOpen((v) => !v)}
              className="bg-transparent border-none text-[var(--ink-soft)] text-xs underline cursor-pointer"
            >
              راهنمای سایز
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap mb-2">
          {product.sizes.map((s) => {
            const isSel = selectedSize === s.size;
            const disabled = s.stock === 0;
            return (
              <button
                key={s.size}
                disabled={disabled}
                onClick={() => !disabled && setSelectedSize(s.size)}
                className="w-[46px] h-[46px] rounded-full flex items-center justify-center text-[13px] font-bold transition-all"
                style={{
                  border: isSel ? "2px solid var(--ink)" : "1px solid var(--line)",
                  background: isSel ? "var(--ink)" : "transparent",
                  color: isSel ? "var(--bg)" : disabled ? "var(--ink-soft)" : "var(--ink)",
                  opacity: disabled ? 0.35 : 1,
                  cursor: disabled ? "not-allowed" : "pointer",
                  textDecoration: disabled ? "line-through" : "none",
                }}
              >
                {s.size}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {sizeGuideOpen && hasSizeGuide && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="bg-[var(--bg-alt)] rounded-lg p-3.5 mb-4 text-xs overflow-hidden"
            >
              <div className="grid grid-cols-4 gap-1.5 font-bold mb-2 text-[var(--ink-soft)]">
                <span>سایز</span>
                <span>قفسه سینه</span>
                <span>کمر</span>
                <span>قد</span>
              </div>
              {SIZE_GUIDE_ROWS.map((row) => (
                <div key={row[0]} className="grid grid-cols-4 gap-1.5 py-1">
                  {row.map((cell, i) => (
                    <span key={i}>{cell}</span>
                  ))}
                </div>
              ))}
              <div className="text-[var(--ink-soft)] mt-1.5">اندازه‌ها به سانتی‌متر است.</div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleAdd}
          disabled={!selectedSize}
          className="w-full rounded-[30px] py-4 font-bold text-[15px] border-none transition-all"
          style={{
            cursor: selectedSize ? "pointer" : "not-allowed",
            background: selectedSize ? "var(--ink)" : "var(--line)",
            color: selectedSize ? "var(--bg)" : "var(--ink-soft)",
          }}
        >
          {selectedSize ? "افزودن به سبد" : "ابتدا سایز خود را انتخاب کنید"}
        </button>
        <div className="text-center text-[11px] text-[var(--ink-soft)] mt-2.5">فقط موجودی فروشگاه، تعداد محدود</div>
      </div>
    </div>
  );
}
