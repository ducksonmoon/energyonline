const ITEMS = [
  {
    label: "کالای اورجینال، خریداری‌شده از ترکیه",
    tint: "rgba(181,51,58,.12)",
    color: "var(--brand-red)",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "موجودی سایت، موجودی واقعی فروشگاه است",
    tint: "rgba(244,200,26,.22)",
    color: "#8a6d0a",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 4h16l-1.5 6h-13z" />
        <path d="M4 10v9a1 1 0 001 1h14a1 1 0 001-1v-9" />
        <path d="M9.5 14.5h5" />
      </svg>
    ),
  },
  {
    label: "سفارش اختصاصی از دایرکت اینستاگرام",
    tint: "rgba(20,19,17,.08)",
    color: "var(--ink)",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
        <circle cx="12" cy="12" r="4.1" />
        <circle cx="17.1" cy="6.9" r="1.15" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export function TrustStrip() {
  return (
    <div className="border-y border-[var(--line)] bg-[var(--bg-alt)] py-4">
      <div className="max-w-[1280px] mx-auto px-5 flex flex-wrap justify-center gap-2.5">
        {ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2.5 rounded-full border border-[var(--line)] bg-[var(--bg)] pr-4 pl-3.5 py-2"
          >
            <span
              className="flex items-center justify-center w-7 h-7 rounded-full shrink-0"
              style={{ background: item.tint, color: item.color }}
            >
              {item.icon}
            </span>
            <span className="text-[12.5px] font-bold">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
