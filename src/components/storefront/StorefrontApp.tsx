"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/storefront/TopBar";
import { FlashSaleBanner } from "@/components/storefront/FlashSaleBanner";
import { FlashSaleSection } from "@/components/storefront/FlashSaleSection";
import { Hero, type HeroTag } from "@/components/storefront/Hero";
import { CategoryShortcuts, type CategoryShortcut } from "@/components/storefront/CategoryShortcuts";
import { AvailabilityBanner } from "@/components/storefront/AvailabilityBanner";
import { CategoryNav, type NavCategory } from "@/components/storefront/CategoryNav";
import { SearchBar } from "@/components/storefront/SearchBar";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { ProductDetailPanel } from "@/components/storefront/ProductDetailPanel";
import { MiniCart } from "@/components/storefront/MiniCart";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { FaqSection } from "@/components/storefront/FaqSection";
import { InstagramCta } from "@/components/storefront/InstagramCta";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { toProductVM } from "@/lib/productViewModel";
import { totalStock, isOffer } from "@/lib/derived";
import { toFa } from "@/lib/format";
import type { ProductWithRelations } from "@/lib/queries";
import type { Category, StoreSettings } from "@/generated/prisma";

export function StorefrontApp({
  settings,
  categories,
  products,
  flashActive,
}: {
  settings: StoreSettings;
  categories: Category[];
  products: ProductWithRelations[];
  flashActive: boolean;
}) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 900);
    return () => clearTimeout(id);
  }, []);

  const productsVM = useMemo(() => products.map((p) => toProductVM(p, flashActive)), [products, flashActive]);

  const flashProducts = useMemo(() => productsVM.filter((p) => p.isFlash), [productsVM]);

  const filtered = useMemo(() => {
    let list = productsVM;
    if (category === "offers") list = list.filter((p) => p.isOffer);
    else if (category !== "all") list = list.filter((p) => p.categoryKey === category);

    const q = search.trim().toLowerCase();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.catLabel.toLowerCase().includes(q));

    return list;
  }, [productsVM, category, search]);

  const navCategories: NavCategory[] = useMemo(
    () => [
      { key: "all", label: "همه" },
      { key: "offers", label: "تخفیف‌ها" },
      ...categories.map((c) => ({ key: c.key, label: c.label })),
    ],
    [categories]
  );

  const categoryShortcuts: CategoryShortcut[] = useMemo(
    () => [
      { key: "offers", label: "تخفیف‌ها", iconKey: "offers", count: products.filter((p) => isOffer(p)).length },
      ...categories.map((c) => ({
        key: c.key,
        label: c.label,
        iconKey: c.iconKey,
        count: products.filter((p) => p.categoryId === c.id).length,
      })),
    ],
    [categories, products]
  );

  const heroTags: HeroTag[] = useMemo(() => {
    return products
      .map((p) => ({ p, total: totalStock(p.sizes) }))
      .filter((x) => x.total > 0)
      .sort((a, b) => a.total - b.total)
      .slice(0, 3)
      .map(({ p, total }) => ({ catLabel: p.category.label, stockFa: `${toFa(total)} عدد`, iconKey: p.category.key }));
  }, [products]);

  const heroStockLine = useMemo(() => {
    const inStock = products.filter((p) => totalStock(p.sizes) > 0).length;
    return `${toFa(inStock)} مدل از ${toFa(products.length)} تا الان موجوده`;
  }, [products]);

  const selectedProduct = selectedProductId ? productsVM.find((p) => p.id === selectedProductId) ?? null : null;

  return (
    <div
      className="energy-root relative overflow-x-hidden min-h-screen bg-[var(--bg)] text-[var(--ink)]"
      style={{ ["--accent" as string]: settings.accentColor }}
    >
      {flashActive && <FlashSaleBanner endsAt={settings.flashSaleEndsAt} bannerText={settings.flashSaleBannerText} />}
      <TopBar onCartClick={() => setCartOpen(true)} />

      <Hero heroStockLine={heroStockLine} heroTags={heroTags} />
      {flashActive && (
        <FlashSaleSection
          endsAt={settings.flashSaleEndsAt}
          title={settings.flashSaleTitle}
          subtitle={settings.flashSaleSubtitle}
          products={flashProducts}
          onOpen={setSelectedProductId}
        />
      )}
      <CategoryShortcuts shortcuts={categoryShortcuts} onSelect={setCategory} />
      <AvailabilityBanner
        showCountdown={settings.showCountdown}
        discountEndsAt={settings.discountEndsAt}
        flashActive={flashActive}
      />
      <SearchBar value={search} onChange={setSearch} />
      <CategoryNav categories={navCategories} active={category} onSelect={setCategory} />
      <ProductGrid
        products={filtered}
        loaded={loaded}
        gridDensity={settings.gridDensity}
        onOpen={setSelectedProductId}
        emptyMessage={search.trim() ? "چیزی با این نام پیدا نشد." : "محصولی در این دسته پیدا نشد."}
      />
      <FaqSection />
      <InstagramCta instagramHandle={settings.instagramHandle} />
      <SiteFooter
        address={settings.address}
        mapUrl={settings.mapUrl}
        phone={settings.phone}
        phoneTurkey={settings.phoneTurkey}
        hoursWeekday={settings.hoursWeekday}
        hoursThursday={settings.hoursThursday}
        hoursFriday={settings.hoursFriday}
        instagramHandle={settings.instagramHandle}
        telegramHandle={settings.telegramHandle}
      />

      <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProductId(null)} />
      <MiniCart onClick={() => setCartOpen(true)} />
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        salesPaused={settings.salesPaused}
        salesPausedMessage={settings.salesPausedMessage}
        instagramHandle={settings.instagramHandle}
      />
    </div>
  );
}
