import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, getStoreSettings } from "@/lib/queries";
import { isFlashSaleActive, totalStock } from "@/lib/derived";
import { toProductVM } from "@/lib/productViewModel";
import { absoluteUrl } from "@/lib/site";
import { ProductDetailContent } from "@/components/storefront/ProductDetailContent";

// Same reasoning as the homepage — cached for up to a minute, invalidated
// instantly on real changes via revalidatePath in the product/sell/discount
// actions.
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/product/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return {};

  const description = product.description || `${product.name} — خرید از فروشگاه انرژی`;
  const socialTitle = `${product.name} | انرژی`;
  const image = product.images[0]?.url;

  return {
    title: product.name,
    description,
    alternates: { canonical: absoluteUrl(`/product/${id}`) },
    openGraph: {
      title: socialTitle,
      description,
      url: absoluteUrl(`/product/${id}`),
      type: "website",
      images: image ? [{ url: absoluteUrl(image) }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: image ? [absoluteUrl(image)] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[id]">) {
  const { id } = await params;
  const [product, settings] = await Promise.all([getProductById(id), getStoreSettings()]);
  if (!product) notFound();

  const flashActive = isFlashSaleActive(settings);
  const vm = toProductVM(product, flashActive);
  const stock = totalStock(product.sizes);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category.label,
    image: product.images.map((i) => absoluteUrl(i.url)),
    offers: {
      "@type": "Offer",
      priceCurrency: "IRR",
      price: vm.price * 10, // stored/displayed in Toman; schema.org offers expect the ISO currency (Rial)
      availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/product/${id}`),
    },
  };

  return (
    <div
      className="energy-root relative min-h-screen bg-[var(--bg)] text-[var(--ink)]"
      style={{ ["--accent" as string]: settings.accentColor }}
    >
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--line)]">
        <Link href="/" className="flex items-center">
          <Image src="/brand/energie-logo-dark.png" alt="انرژی" width={1984} height={321} className="h-9 w-auto" />
        </Link>
        <Link href="/" className="text-xs text-[var(--ink-soft)] underline underline-offset-2">
          بازگشت به فروشگاه
        </Link>
      </div>

      <div className="max-w-[940px] mx-auto">
        <ProductDetailContent product={vm} />
      </div>
    </div>
  );
}
