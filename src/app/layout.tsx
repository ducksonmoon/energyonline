import type { Metadata } from "next";
import { Vazirmatn, Lalezar } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@/components/Analytics";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
});

const lalezar = Lalezar({
  variable: "--font-lalezar",
  subsets: ["arabic"],
  weight: "400",
});

const SITE_NAME = "انرژی | فروشگاه پوشاک ساری";
const SITE_DESCRIPTION = "موجودی واقعی فروشگاه انرژی — تعداد مشخص، بدون تکرار. وقتی تموم شد، تموم شد.";

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: { default: SITE_NAME, template: "%s | انرژی" },
  description: SITE_DESCRIPTION,
  keywords: ["فروشگاه پوشاک ساری", "خرید لباس ساری", "انرژی", "پوشاک مردانه", "هودی", "کاپشن", "تیشرت"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "انرژی",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${lalezar.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}
