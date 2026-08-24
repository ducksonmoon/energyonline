import { formatToman } from "@/lib/format";
import { totalStock, stockInfo, isOffer, isFlashPrice, discountPct, effectivePrice } from "@/lib/derived";
import type { ProductWithRelations } from "@/lib/queries";

export function toProductVM(p: ProductWithRelations, flashActive = false) {
  const total = totalStock(p.sizes);
  const info = stockInfo(total);
  const offer = isOffer(p, flashActive);
  const flash = isFlashPrice(p, flashActive);
  const pct = discountPct(p, flashActive);
  const price = effectivePrice(p, flashActive);

  return {
    id: p.id,
    name: p.name,
    categoryKey: p.category.key,
    catLabel: p.category.label,
    isNew: p.isNew,
    isOffer: offer,
    isFlash: flash,
    discountPct: pct,
    price,
    priceFa: formatToman(price),
    originalPriceFa: offer ? formatToman(p.basePrice) : null,
    stockLabel: info.label,
    stockLabelLong: info.long,
    stockColor: info.color,
    stockBg: info.bg,
    totalStock: total,
    image: p.images[0]?.url ?? null,
    images: p.images.map((i) => i.url),
    description: p.description,
    sizes: p.sizes,
  };
}

export type ProductVM = ReturnType<typeof toProductVM>;
