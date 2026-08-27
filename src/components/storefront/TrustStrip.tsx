const ITEMS = [
  {
    label: "کالای اورجینال، خریداری‌شده از ترکیه",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "موجودی سایت، موجودی واقعی فروشگاه است",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4h16l-1.5 6h-13z" />
        <path d="M4 10v9a1 1 0 001 1h14a1 1 0 001-1v-9" />
        <path d="M9.5 14.5h5" />
      </svg>
    ),
  },
  {
    label: "سفارش اختصاصی از دایرکت اینستاگرام",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
        <circle cx="12" cy="12" r="4.1" />
        <circle cx="17.1" cy="6.9" r="1.15" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export function TrustStrip() {
  return (
    <div className="border-y border-[var(--line)] bg-[var(--bg-alt)]">
      <div className="max-w-[1280px] mx-auto px-5 py-4 flex flex-col sm:flex-row sm:justify-center gap-3 sm:gap-9">
        {ITEMS.map((item) => (
          <div key={item.label} className="flex items-center justify-center gap-2.5 text-[13px] font-bold">
            {item.icon}
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
