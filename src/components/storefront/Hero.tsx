export function Hero({ heroStockLine }: { heroStockLine: string }) {
  return (
    <div className="px-5 pt-8 pb-7 sm:pt-11 sm:pb-9 max-w-[640px] mx-auto text-center flex flex-col items-center gap-2.5">
      <div className="text-[10.5px] sm:text-[11px] tracking-[.14em] font-bold text-[var(--brand-red)]">
        همین الان، فقط همینا موجوده
      </div>
      <div className="text-[clamp(22px,5.5vw,32px)] font-extrabold leading-[1.35] [animation:heroWordIn_.8s_cubic-bezier(.16,1,.3,1)_both]">
        پوشاک اورجینال ترکیه، تعداد محدود
      </div>
      <div className="text-[13px] sm:text-sm leading-[1.8] text-[var(--ink-soft)] max-w-[420px]">
        هر تیکه فقط یه‌بار میاد. وقتی تموم شد، تموم شد.
      </div>
      <div className="text-[12px] sm:text-[12.5px] text-[var(--ink-soft)]">{heroStockLine}</div>
      <a
        href="#grid"
        className="mt-1.5 inline-flex items-center gap-2 rounded-[3px] bg-[var(--ink)] text-[var(--bg)] font-bold text-sm px-5 py-3 sm:px-[22px] sm:py-3.5 transition-transform active:scale-95 hover:scale-105"
      >
        دیدن موجودی
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
  );
}
