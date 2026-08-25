export function InstagramCta({ instagramHandle }: { instagramHandle: string }) {
  return (
    <div className="px-5 py-[52px]">
      <div
        className="max-w-[720px] mx-auto grid grid-cols-1 sm:grid-cols-[1fr_168px] rounded-[14px] overflow-hidden bg-[var(--bg)]"
        style={{ boxShadow: "0 0 0 1px var(--line), 0 14px 32px -16px rgba(20,19,17,.28)" }}
      >
        <div className="flex flex-col gap-3.5 p-6 sm:p-8 sm:pb-6.5">
          <h3 className="text-[20px] sm:text-[24px] lg:text-[27px] font-bold leading-[1.4] text-[var(--ink)]">
            سفارش از ترکیه رو از دایرکت هماهنگ می‌کنیم
          </h3>
          <p className="text-sm sm:text-[15px] leading-[1.95] text-[var(--ink-soft)] max-w-[56ch]">
            چیزی که تو فروشگاه نیست ولی می‌تونیم از ترکیه بیاریم رو از دایرکت اینستاگرام هماهنگ می‌کنیم. استوری‌ها رو
            هم دنبال کن؛ موجودی‌های تازه و چیزایی که تازه رسیده همون‌جا گفته می‌شه.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-1">
            <a
              href={`https://instagram.com/${instagramHandle}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 min-h-[48px] pr-5 pl-[18px] rounded-[8px] border border-[var(--brand-red)] text-[var(--brand-red)] font-bold text-[15.5px] transition-colors hover:bg-[color-mix(in_srgb,var(--brand-red)_10%,transparent)]"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
                <circle cx="12" cy="12" r="4.1" />
                <circle cx="17.1" cy="6.9" r="1.15" fill="currentColor" stroke="none" />
              </svg>
              پیام در اینستاگرام
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                style={{ transform: "scaleX(-1)" }}
              >
                <path d="M5 12h13M13 6l6 6-6 6" />
              </svg>
            </a>
            {instagramHandle && (
              <span
                dir="ltr"
                className="inline-flex items-center h-8 px-3 rounded-[8px] bg-[var(--bg-alt)] text-[13.5px] text-[var(--ink-soft)]"
                style={{ boxShadow: "inset 0 0 0 1px var(--line)" }}
              >
                @{instagramHandle}
              </span>
            )}
          </div>
        </div>

        <div
          className="hidden sm:grid place-items-center"
          style={{
            background: "color-mix(in srgb, var(--brand-red) 12%, var(--bg))",
            boxShadow: "inset 1px 0 0 color-mix(in srgb, var(--brand-red) 22%, var(--bg))",
          }}
        >
          <svg
            width="76"
            height="76"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--brand-red)"
            strokeWidth="1.1"
            strokeLinecap="round"
            style={{ opacity: 0.9 }}
          >
            <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
            <circle cx="12" cy="12" r="4.1" />
            <circle cx="17.1" cy="6.9" r="1.15" fill="var(--brand-red)" stroke="none" />
          </svg>
        </div>
      </div>
    </div>
  );
}
