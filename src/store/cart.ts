"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addCartItem,
  setCartItemQty,
  mergeLegacyCartItems,
  type CartItem,
  type AddCartItemInput,
  type AddCartItemResult,
} from "@/lib/cart";

export type { CartItem };

type CartState = {
  items: CartItem[];
  /** `maxQty` is the caller's current known stock for this product+size. */
  addItem: (item: AddCartItemInput, maxQty: number) => AddCartItemResult;
  setQty: (id: string, qty: number, maxQty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, maxQty) => {
        const { items, result } = addCartItem(get().items, item, maxQty, () => crypto.randomUUID());
        set({ items });
        return result;
      },
      setQty: (id, qty, maxQty) => set((state) => ({ items: setCartItemQty(state.items, id, qty, maxQty) })),
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "energy-cart",
      partialize: (state) => ({ items: state.items }),
      version: 1,
      migrate: (persisted) => {
        const raw = (persisted as { items?: unknown[] } | undefined)?.items ?? [];
        return { items: mergeLegacyCartItems(raw, () => crypto.randomUUID()) };
      },
    }
  )
);
