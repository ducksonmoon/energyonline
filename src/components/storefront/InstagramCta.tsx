export function InstagramCta({ instagramHandle }: { instagramHandle: string }) {
  return (
    <div className="px-5 py-[64px] text-center">
      <h3
        className="text-[24px] sm:text-[28px] font-normal leading-[1.4] text-[var(--ink)] max-w-[520px] mx-auto mb-3.5"
        style={{ fontFamily: "var(--font-lalezar)" }}
      >
        سفارش از ترکیه رو از دایرکت هماهنگ می‌کنیم
      </h3>
      <p className="text-sm leading-[1.9] text-[var(--ink-soft)] max-w-[440px] mx-auto mb-7">
        چیزی که تو فروشگاه نیست ولی می‌تونیم از ترکیه بیاریم رو از دایرکت اینستاگرام هماهنگ می‌کنیم. استوری‌ها رو هم
        دنبال کن؛ موجودی‌های تازه و چیزایی که تازه رسیده همون‌جا گفته می‌شه.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={`https://instagram.com/${instagramHandle}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2.5 min-h-[48px] px-6 rounded-full border border-[var(--ink)] text-[var(--ink)] font-bold text-[14.5px] transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
            <circle cx="12" cy="12" r="4.1" />
            <circle cx="17.1" cy="6.9" r="1.15" fill="currentColor" stroke="none" />
          </svg>
          پیام در اینستاگرام
        </a>
        {instagramHandle && (
          <span
            dir="ltr"
            className="inline-flex items-center h-10 px-4 rounded-full bg-[var(--bg-alt)] text-[13px] text-[var(--ink-soft)]"
          >
            @{instagramHandle}
          </span>
        )}
      </div>
    </div>
  );
}
