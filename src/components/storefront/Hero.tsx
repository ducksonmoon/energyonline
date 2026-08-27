import Image from "next/image";

export type HeroProduct = { name: string; image: string | null };

export function Hero({ heroProducts }: { heroProducts: HeroProduct[] }) {
  return (
    <div className="relative px-5 pt-8 pb-2 sm:pt-11 sm:pb-8 max-w-[1280px] mx-auto lg:flex lg:items-center lg:gap-12 xl:gap-20">
      <div
        className="pointer-events-none absolute -top-10 right-0 w-[60vw] max-w-[420px] h-[280px] rounded-full opacity-[0.12] blur-[70px]"
        style={{ background: "var(--brand-red)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-[50vw] max-w-[320px] h-[220px] rounded-full opacity-[0.14] blur-[70px]"
        style={{ background: "var(--accent)" }}
      />
      <div className="relative flex flex-col items-center text-center gap-2.5 lg:flex-1 lg:items-start lg:text-right">
        <div className="text-[10.5px] sm:text-[11px] tracking-[.14em] font-bold text-[var(--brand-red)]">
          جدیدترین انتخاب‌ها
        </div>
        <div className="text-[clamp(22px,4vw,34px)] font-extrabold leading-[1.35] max-w-[480px] [animation:heroWordIn_.8s_cubic-bezier(.16,1,.3,1)_both]">
          منتخب لباس‌های اورجینال از ترکیه.
        </div>
        <div className="text-[13px] sm:text-sm leading-[1.8] text-[var(--ink-soft)] max-w-[420px]">
          بهترین محصولات را با مناسب‌ترین قیمت برای شما فراهم می‌کنیم؛ تمام محصولات اورجینال و خریداری‌شده از ترکیه،
          هم‌اکنون در فروشگاه موجود هستند. برای سفارش‌های خاص نیز کافی‌ست به ما اطلاع دهید تا محصول موردنظرتان را
          مستقیماً برایتان تهیه کنیم.
        </div>
        <a
          href="#grid"
          className="mt-1.5 inline-flex items-center gap-2 rounded-[3px] bg-[var(--ink)] text-[var(--bg)] font-bold text-sm px-5 py-3 sm:px-[22px] sm:py-3.5 transition-transform active:scale-95 hover:scale-105"
        >
          مشاهده محصولات
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            style={{ transform: "scaleX(-1)" }}
          >
            <path d="M5 12h13M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>

      {/* A real preview of what's actually in the store right now, instead of
          the brand mark (already doing its job in the top bar) blown up large
          on an empty gradient. */}
      {heroProducts.length > 0 && (
        <div className="mt-5 lg:mt-0 mx-auto w-full max-w-[340px] lg:flex-1 lg:max-w-none flex gap-3 h-[210px] lg:h-[320px]">
          {heroProducts.map((p) => (
            <div
              key={p.name}
              className={`relative flex-1 rounded-[10px] overflow-hidden flex items-center justify-center text-[var(--ink-soft)] ${p.image ? "bg-white" : "bg-[var(--bg-alt)]"}`}
            >
              {p.image ? (
                <Image src={p.image} alt={p.name} fill sizes="(max-width: 1023px) 45vw, 320px" className="object-contain p-3" />
              ) : (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="opacity-50">
                  <path d="M9 4h6l1 2h3a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h3z" />
                  <path d="M9 4a3 3 0 006 0" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
