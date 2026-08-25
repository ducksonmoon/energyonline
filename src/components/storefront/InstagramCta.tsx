export function InstagramCta({ instagramHandle }: { instagramHandle: string }) {
  return (
    <div className="px-5 py-[52px]">
      <div className="max-w-[720px] mx-auto border border-[var(--line)] rounded-md p-7">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-[52px] h-[52px] rounded-full bg-[var(--brand-red)] flex items-center justify-center flex-none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.2" cy="6.8" r="1" />
            </svg>
          </div>
          <div className="text-[17px] font-bold">سفارش از ترکیه رو از دایرکت هماهنگ می‌کنیم</div>
        </div>
        <div className="text-sm leading-[1.85] text-[var(--ink-soft)] mb-5">
          چیزی که تو فروشگاه نیست ولی می‌تونیم از ترکیه بیاریم رو از دایرکت اینستاگرام هماهنگ می‌کنیم. استوری‌ها رو
          هم دنبال کن؛ موجودی‌های تازه و چیزایی که تازه رسیده همون‌جا گفته می‌شه.
        </div>
        <a
          href={`https://instagram.com/${instagramHandle}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-[3px] bg-[var(--ink)] text-[var(--bg)] font-bold text-[13.5px]"
        >
          پیام در اینستاگرام {instagramHandle && <span dir="ltr">@{instagramHandle}</span>}
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
    </div>
  );
}
