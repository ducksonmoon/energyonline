"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/storefront/TopBar";
import { FlashSaleBanner } from "@/components/storefront/FlashSaleBanner";
import { FlashSaleSection } from "@/components/storefront/FlashSaleSection";
import { Hero, type HeroProduct } from "@/components/storefront/Hero";
import { TrustStrip } from "@/components/storefront/TrustStrip";
import { AvailabilityBanner } from "@/components/storefront/AvailabilityBanner";
import { CategoryNav, type NavCategory } from "@/components/storefront/CategoryNav";
import { SearchBar } from "@/components/storefront/SearchBar";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { ProductDetailPanel } from "@/components/storefront/ProductDetailPanel";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { FaqSection } from "@/components/storefront/FaqSection";
import { InstagramCta } from "@/components/storefront/InstagramCta";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { toProductVM } from "@/lib/productViewModel";
import { effectivePrice } from "@/lib/derived";
import { formatToman } from "@/lib/format";
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

  // A filter pill for a category (or "تخفیف‌ها") with nothing behind it just
  // clicks through to an empty grid — with only a couple of products live,
  // that was most of the nav. Only show pills that currently have at least
  // one product.
  const navCategories: NavCategory[] = useMemo(() => {
    const hasOffers = productsVM.some((p) => p.isOffer);
    const nonEmptyCategories = categories.filter((c) => products.some((p) => p.category.key === c.key));
    return [
      { key: "all", label: "همه" },
      ...(hasOffers ? [{ key: "offers", label: "تخفیف‌ها" }] : []),
      ...nonEmptyCategories.map((c) => ({ key: c.key, label: c.label })),
    ];
  }, [categories, products, productsVM]);

  // A real preview of what's actually buyable, not a decorative graphic —
  // admin-picked products first (featuredInHero), filled out with the
  // regular catalog order when fewer than 2 are picked.
  const heroProducts: HeroProduct[] = useMemo(() => {
    const featured = products.filter((p) => p.featuredInHero);
    const rest = products.filter((p) => !p.featuredInHero);
    return [...featured, ...rest].slice(0, 2).map((p) => ({
      name: p.name,
      image: p.images[0]?.url ?? null,
      priceFa: formatToman(effectivePrice(p, flashActive)),
    }));
  }, [products, flashActive]);

  const selectedProduct = selectedProductId ? productsVM.find((p) => p.id === selectedProductId) ?? null : null;

  return (
    <div
      className="energy-root relative overflow-x-hidden min-h-screen bg-[var(--bg)] text-[var(--ink)]"
      style={{ ["--accent" as string]: settings.accentColor }}
    >
      {flashActive && <FlashSaleBanner endsAt={settings.flashSaleEndsAt} bannerText={settings.flashSaleBannerText} />}
      <TopBar onCartClick={() => setCartOpen(true)} instagramHandle={settings.instagramHandle} />

      <Hero heroProducts={heroProducts} />
      <TrustStrip />
      {flashActive && (
        <FlashSaleSection
          endsAt={settings.flashSaleEndsAt}
          title={settings.flashSaleTitle}
          subtitle={settings.flashSaleSubtitle}
          products={flashProducts}
          onOpen={setSelectedProductId}
        />
      )}
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
        emptyMessage={search.trim() ? "نتیجه‌ای یافت نشد." : "محصولی در این دسته موجود نیست."}
      />
      <FaqSection />
      <InstagramCta instagramHandle={settings.instagramHandle} />
      <SiteFooter
        address={settings.address}
        mapUrl={settings.mapUrl}
        mapLat={settings.mapLat}
        mapLng={settings.mapLng}
        phone={settings.phone}
        phoneTurkey={settings.phoneTurkey}
        hoursWeekday={settings.hoursWeekday}
        hoursThursday={settings.hoursThursday}
        hoursFriday={settings.hoursFriday}
        instagramHandle={settings.instagramHandle}
        telegramHandle={settings.telegramHandle}
      />

      <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProductId(null)} />
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
