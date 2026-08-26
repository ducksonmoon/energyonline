import { toFa } from "@/lib/format";

export type StockInfo = {
  label: string;
  long: string;
  color: string;
  bg: string;
};

export function totalStock(sizes: { stock: number }[]): number {
  return sizes.reduce((sum, s) => sum + s.stock, 0);
}

export function stockInfo(total: number): StockInfo {
  if (total === 0) {
    return { label: "ناموجود", long: "ناموجود", color: "#a8483c", bg: "rgba(168,72,60,.1)" };
  }
  if (total <= 3) {
    const label = `${toFa(total)} عدد موجود`;
    // A fixed amber, not the store's customizable --accent: that color is
    // picked freely by the admin (often a bright gold) and used here as text
    // on its own pale tint, which reads as near-invisible regardless of the
    // shade chosen. A fixed tone keeps this legible no matter the theme.
    return {
      label,
      long: label,
      color: "#9c6b12",
      bg: "rgba(196,148,20,.16)",
    };
  }
  const label = `${toFa(total)} عدد موجود`;
  return { label, long: label, color: "#5b7a5f", bg: "rgba(91,122,95,.12)" };
}

export type PriceInput = { basePrice: number; discountPrice: number | null; flashPrice?: number | null };

/** The special-offer-day price takes priority over the regular discount while the campaign is running. */
function activeDiscountPrice(product: PriceInput, flashActive: boolean): number | null {
  if (flashActive && product.flashPrice != null && product.flashPrice < product.basePrice) {
    return product.flashPrice;
  }
  if (product.discountPrice != null && product.discountPrice < product.basePrice) {
    return product.discountPrice;
  }
  return null;
}

export function isOffer(product: PriceInput, flashActive = false): boolean {
  return activeDiscountPrice(product, flashActive) != null;
}

export function isFlashPrice(product: PriceInput, flashActive: boolean): boolean {
  return flashActive && product.flashPrice != null && product.flashPrice < product.basePrice;
}

export function discountPct(product: PriceInput, flashActive = false): number {
  const price = activeDiscountPrice(product, flashActive);
  if (price == null) return 0;
  return Math.round((1 - price / product.basePrice) * 100);
}

export function effectivePrice(product: PriceInput, flashActive = false): number {
  return activeDiscountPrice(product, flashActive) ?? product.basePrice;
}

export function isFlashSaleActive(settings: { flashSaleEnabled: boolean; flashSaleEndsAt: Date | null }): boolean {
  return settings.flashSaleEnabled && !!settings.flashSaleEndsAt && settings.flashSaleEndsAt.getTime() > Date.now();
}
