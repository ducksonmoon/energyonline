import type { Metadata } from "next";
import { Vazirmatn, Lalezar } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@/components/Analytics";
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

export const metadata: Metadata = {
  title: "انرژی | فروشگاه پوشاک ساری",
  description: "موجودی واقعی فروشگاه انرژی — تعداد مشخص، بدون تکرار. وقتی تموم شد، تموم شد.",
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
