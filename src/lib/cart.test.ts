import { describe, it, expect } from "vitest";
import { addCartItem, setCartItemQty, cartItemCount, cartTotal, mergeLegacyCartItems, type CartItem } from "./cart";

const INPUT = { productId: "p1", name: "تیشرت", size: "M", price: 1000, image: null };

function ids() {
  let n = 0;
  return () => `id-${n++}`;
}

describe("addCartItem", () => {
  it("creates a new line the first time a product+size is added", () => {
    const { items, result } = addCartItem([], INPUT, 5, ids());
    expect(result).toBe("added");
    expect(items).toEqual([{ ...INPUT, id: "id-0", qty: 1 }]);
  });

  it("bug regression: repeated adds of the same product+size increase qty instead of appending duplicate rows, and stop at the stock ceiling", () => {
    const newId = ids();
    let items: CartItem[] = [];
    const results: string[] = [];
    // Simulate a customer mashing "add to cart" 10 times against a stock of 3.
    for (let i = 0; i < 10; i++) {
      const res = addCartItem(items, INPUT, 3, newId);
      items = res.items;
      results.push(res.result);
    }
    expect(items).toHaveLength(1); // never more than one row for this product+size
    expect(items[0].qty).toBe(3); // capped at stock, not 10
    expect(results).toEqual([
      "added",
      "increased",
      "increased",
      "max-reached",
      "max-reached",
      "max-reached",
      "max-reached",
      "max-reached",
      "max-reached",
      "max-reached",
    ]);
  });

  it("keeps different sizes of the same product as separate lines", () => {
    const newId = ids();
    let items: CartItem[] = [];
    items = addCartItem(items, INPUT, 5, newId).items;
    items = addCartItem(items, { ...INPUT, size: "L" }, 5, newId).items;
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.size)).toEqual(["M", "L"]);
  });

  it("keeps the same size of different products as separate lines", () => {
    const newId = ids();
    let items: CartItem[] = [];
    items = addCartItem(items, INPUT, 5, newId).items;
    items = addCartItem(items, { ...INPUT, productId: "p2" }, 5, newId).items;
    expect(items).toHaveLength(2);
  });

  it("refuses to add an out-of-stock item (maxQty 0) without touching the cart", () => {
    const { items, result } = addCartItem([], INPUT, 0, ids());
    expect(result).toBe("max-reached");
    expect(items).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const original: CartItem[] = [];
    addCartItem(original, INPUT, 5, ids());
    expect(original).toEqual([]);
  });
});

describe("setCartItemQty", () => {
  const base: CartItem[] = [{ ...INPUT, id: "a", qty: 2 }];

  it("sets qty within range", () => {
    expect(setCartItemQty(base, "a", 4, 5)[0].qty).toBe(4);
  });

  it("clamps qty above maxQty down to maxQty", () => {
    expect(setCartItemQty(base, "a", 99, 5)[0].qty).toBe(5);
  });

  it("removes the line when set to 0", () => {
    expect(setCartItemQty(base, "a", 0, 5)).toEqual([]);
  });

  it("removes the line for a negative qty", () => {
    expect(setCartItemQty(base, "a", -3, 5)).toEqual([]);
  });
});

describe("cartItemCount / cartTotal", () => {
  const items: CartItem[] = [
    { ...INPUT, id: "a", qty: 3 },
    { ...INPUT, id: "b", size: "L", qty: 2 },
  ];

  it("sums quantities across lines, not row count", () => {
    expect(cartItemCount(items)).toBe(5);
  });

  it("sums price * qty across lines", () => {
    expect(cartTotal(items)).toBe(1000 * 3 + 1000 * 2);
  });
});

describe("mergeLegacyCartItems", () => {
  it("collapses pre-fix duplicate rows (no qty field) for the same product+size into one qty-summed line", () => {
    const legacy = [
      { id: "x1", productId: "p1", name: "تیشرت", size: "M", price: 1000, image: null },
      { id: "x2", productId: "p1", name: "تیشرت", size: "M", price: 1000, image: null },
      { id: "x3", productId: "p1", name: "تیشرت", size: "M", price: 1000, image: null },
    ];
    const merged = mergeLegacyCartItems(legacy, ids());
    expect(merged).toHaveLength(1);
    expect(merged[0].qty).toBe(3);
  });

  it("keeps distinct product+size rows separate", () => {
    const legacy = [
      { id: "x1", productId: "p1", name: "تیشرت", size: "M", price: 1000, image: null },
      { id: "x2", productId: "p1", name: "تیشرت", size: "L", price: 1000, image: null },
    ];
    expect(mergeLegacyCartItems(legacy, ids())).toHaveLength(2);
  });

  it("ignores malformed entries instead of throwing", () => {
    expect(mergeLegacyCartItems([null, {}, { productId: "p1" }], ids())).toEqual([]);
  });
});
