export type CartItem = {
  id: string;
  productId: string;
  name: string;
  size: string;
  price: number;
  image: string | null;
  qty: number;
};

export type AddCartItemInput = Omit<CartItem, "id" | "qty">;
export type AddCartItemResult = "added" | "increased" | "max-reached";

/**
 * Adds one unit of a product+size to the cart, merging into the existing
 * line for that product+size instead of appending a new row each time.
 * `maxQty` (the caller-supplied stock ceiling) is enforced here, not just
 * in the UI: without it, repeated clicks had no cap at all and could push
 * a cart line's effective quantity past what's actually in stock.
 */
export function addCartItem(
  items: CartItem[],
  input: AddCartItemInput,
  maxQty: number,
  newId: () => string
): { items: CartItem[]; result: AddCartItemResult } {
  if (maxQty <= 0) return { items, result: "max-reached" };

  const existing = items.find((i) => i.productId === input.productId && i.size === input.size);
  if (!existing) {
    return { items: [...items, { ...input, id: newId(), qty: 1 }], result: "added" };
  }
  if (existing.qty >= maxQty) {
    return { items, result: "max-reached" };
  }
  return {
    items: items.map((i) => (i.id === existing.id ? { ...i, qty: i.qty + 1 } : i)),
    result: "increased",
  };
}

/** Sets a line's quantity, clamped to [0, maxQty]; 0 removes the line. */
export function setCartItemQty(items: CartItem[], id: string, qty: number, maxQty: number): CartItem[] {
  const clamped = Math.max(0, Math.min(qty, maxQty));
  if (clamped === 0) return items.filter((i) => i.id !== id);
  return items.map((i) => (i.id === id ? { ...i, qty: clamped } : i));
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.qty, 0);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

/**
 * Pre-fix carts (persisted in a customer's browser) may still hold one
 * duplicate row per click, each with no `qty` field. Collapses rows that
 * share a product+size into a single qty-summed line so an existing
 * customer's cart self-heals on their next visit instead of carrying the
 * bug's duplicate rows forward forever.
 */
export function mergeLegacyCartItems(raw: unknown[], newId: () => string): CartItem[] {
  const merged = new Map<string, CartItem>();
  for (const entry of raw) {
    const it = entry as Partial<CartItem> | null;
    if (!it || typeof it.productId !== "string" || typeof it.size !== "string") continue;
    const key = `${it.productId}::${it.size}`;
    const qty = typeof it.qty === "number" && it.qty > 0 ? it.qty : 1;
    const existing = merged.get(key);
    if (existing) {
      existing.qty += qty;
      continue;
    }
    merged.set(key, {
      id: typeof it.id === "string" ? it.id : newId(),
      productId: it.productId,
      name: typeof it.name === "string" ? it.name : "",
      size: it.size,
      price: typeof it.price === "number" ? it.price : 0,
      image: typeof it.image === "string" ? it.image : null,
      qty,
    });
  }
  return Array.from(merged.values());
}
