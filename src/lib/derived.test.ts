import { describe, it, expect } from "vitest";
import {
  totalStock,
  stockInfo,
  isOffer,
  isFlashPrice,
  discountPct,
  effectivePrice,
  isFlashSaleActive,
} from "./derived";

describe("totalStock", () => {
  it("sums stock across sizes", () => {
    expect(totalStock([{ stock: 2 }, { stock: 3 }, { stock: 0 }])).toBe(5);
  });
  it("returns 0 for no sizes", () => {
    expect(totalStock([])).toBe(0);
  });
});

describe("stockInfo", () => {
  it("flags zero stock as out of stock", () => {
    expect(stockInfo(0).label).toBe("ناموجود");
  });
  it("flags low stock (<=3) with the accent color", () => {
    expect(stockInfo(2).color).toBe("var(--accent)");
  });
  it("uses a different color once stock is plentiful", () => {
    expect(stockInfo(10).color).not.toBe("var(--accent)");
  });
});

describe("effectivePrice / isOffer / discountPct", () => {
  it("uses the regular discount when flash is inactive", () => {
    const p = { basePrice: 1000, discountPrice: 800, flashPrice: null as number | null };
    expect(effectivePrice(p, false)).toBe(800);
    expect(isOffer(p, false)).toBe(true);
    expect(discountPct(p, false)).toBe(20);
  });

  it("ignores a discount that isn't actually lower than the base price", () => {
    const p = { basePrice: 1000, discountPrice: 1000, flashPrice: null };
    expect(isOffer(p, false)).toBe(false);
    expect(effectivePrice(p, false)).toBe(1000);
  });

  it("prefers the flash price over the regular discount while flash is active", () => {
    const p = { basePrice: 1000, discountPrice: 800, flashPrice: 500 };
    expect(effectivePrice(p, true)).toBe(500);
    expect(isFlashPrice(p, true)).toBe(true);
    expect(discountPct(p, true)).toBe(50);
  });

  it("falls back to the regular discount when the flash price isn't lower than base", () => {
    const p = { basePrice: 1000, discountPrice: 800, flashPrice: 1200 };
    expect(effectivePrice(p, true)).toBe(800);
    expect(isFlashPrice(p, true)).toBe(false);
  });

  it("ignores the flash price when flash isn't active", () => {
    const p = { basePrice: 1000, discountPrice: 800, flashPrice: 100 };
    expect(effectivePrice(p, false)).toBe(800);
  });
});

describe("isFlashSaleActive", () => {
  it("is false when disabled", () => {
    expect(isFlashSaleActive({ flashSaleEnabled: false, flashSaleEndsAt: new Date(Date.now() + 10_000) })).toBe(
      false
    );
  });
  it("is false once the end time has passed", () => {
    expect(isFlashSaleActive({ flashSaleEnabled: true, flashSaleEndsAt: new Date(Date.now() - 10_000) })).toBe(
      false
    );
  });
  it("is true when enabled and still before the end time", () => {
    expect(isFlashSaleActive({ flashSaleEnabled: true, flashSaleEndsAt: new Date(Date.now() + 10_000) })).toBe(true);
  });
  it("is false with no end time set", () => {
    expect(isFlashSaleActive({ flashSaleEnabled: true, flashSaleEndsAt: null })).toBe(false);
  });
});
