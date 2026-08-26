import {
  Shirt,
  SportShoe,
  BadgePercent,
  Handbag,
  Backpack,
  Gem,
  Watch,
  Glasses,
  SprayCan,
  Baby,
  Gift,
  ShoppingBag,
  Tag,
  type LucideIcon,
} from "lucide-react";

export type IconOption = { key: string; label: string };

/** Categories with a strong literal match get a real Lucide icon. */
export const LUCIDE_ICONS: Record<string, LucideIcon> = {
  offers: BadgePercent,
  tshirt: Shirt,
  shoes: SportShoe,
  bag: Handbag,
  backpack: Backpack,
  accessories: Gem,
  watch: Watch,
  glasses: Glasses,
  perfume: SprayCan,
  kids: Baby,
  gift: Gift,
  shopping: ShoppingBag,
  tag: Tag,
};

/**
 * Garment types Lucide has no literal icon for get a small hand-drawn
 * outline (same stroke style as the Lucide set: round caps/joins, no fill)
 * so new categories aren't forced into a mismatched or wrong icon.
 */
export const CUSTOM_ICON_PATHS: Record<string, string> = {
  jacket: "M9 4L7 5L4 9L4 12L7 10L7 20L17 20L17 10L20 12L20 9L17 5L15 4L12 6.5Z M12 7V19",
  hoodie: "M8 6Q12 2 16 6L18 8L21 10L21 13L18 11L18 21L6 21L6 11L3 13L3 10L6 8Z M9 15H15",
  pants: "M7 3H17L17.5 21H13.5L12 11L10.5 21H6.5Z M7 6.5H17",
  socks: "M9 3H15V12L20 15Q21 17 19 18L9 18V3Z M9 7H15",
  // Button-up dress shirt (پیراهن) — collar + sleeves + center placket line,
  // kept distinct from the plain Lucide "Shirt" icon already used for tshirt.
  shirt: "M8 4L10 3H14L16 4L16 6L19 8L19 11L16 9.5V20H8V9.5L5 11V8L8 6Z M12 6V19",
};

/** Curated palette shown in the admin category editor, with Persian labels. */
export const ICON_OPTIONS: IconOption[] = [
  { key: "jacket", label: "کاپشن" },
  { key: "shirt", label: "پیراهن" },
  { key: "tshirt", label: "تیشرت" },
  { key: "hoodie", label: "هودی" },
  { key: "pants", label: "شلوار" },
  { key: "shoes", label: "کفش" },
  { key: "socks", label: "جوراب" },
  { key: "bag", label: "کیف دستی" },
  { key: "backpack", label: "کوله‌پشتی" },
  { key: "accessories", label: "جواهرات" },
  { key: "watch", label: "ساعت" },
  { key: "glasses", label: "عینک" },
  { key: "perfume", label: "عطر و اسپری" },
  { key: "kids", label: "نوزاد و کودک" },
  { key: "gift", label: "کادو" },
  { key: "shopping", label: "خرید" },
  { key: "tag", label: "عمومی" },
];

/** Neutral fallback for any iconKey that isn't in either registry above. */
export const FALLBACK_ICON_KEY = "tag";
