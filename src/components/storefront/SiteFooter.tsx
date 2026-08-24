export function SiteFooter({
  address,
  hoursWeekday,
  hoursThursday,
  hoursFriday,
  instagramHandle,
  telegramHandle,
}: {
  address: string;
  hoursWeekday: string;
  hoursThursday: string;
  hoursFriday: string;
  instagramHandle: string;
  telegramHandle: string;
}) {
  return (
    <div className="bg-[var(--ink)] text-[var(--bg)] px-5 pt-14 pb-6.5">
      <div className="max-w-[960px] mx-auto grid gap-9" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))" }}>
        <div>
          <div className="font-extrabold text-lg mb-2.5">انرژی</div>
          <div className="text-[13px] leading-[1.9] max-w-[240px] text-[rgba(246,242,236,.6)]">
            یک فروشگاه، موجودی واقعی، بدون تکرار.
          </div>
        </div>
        <div>
          <div className="text-xs tracking-[.08em] text-[rgba(246,242,236,.5)] mb-3">آدرس فروشگاه</div>
          <div className="text-[13px] leading-[1.9] text-[rgba(246,242,236,.85)] mb-3.5">{address}</div>
          <div className="w-full aspect-video bg-[rgba(246,242,236,.06)] rounded-md flex items-center justify-center text-[rgba(246,242,236,.4)] text-xs gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" />
              <circle cx="12" cy="9" r="2.4" />
            </svg>
            نقشه فروشگاه
          </div>
        </div>
        <div>
          <div className="text-xs tracking-[.08em] text-[rgba(246,242,236,.5)] mb-3">ساعات کاری</div>
          <div className="text-[13px] leading-[2] text-[rgba(246,242,236,.85)]">
            <div className="flex justify-between max-w-[220px]">
              <span>شنبه تا چهارشنبه</span>
              <span>{hoursWeekday}</span>
            </div>
            <div className="flex justify-between max-w-[220px]">
              <span>پنج‌شنبه</span>
              <span>{hoursThursday}</span>
            </div>
            <div className="flex justify-between max-w-[220px]">
              <span>جمعه</span>
              <span>{hoursFriday}</span>
            </div>
          </div>
        </div>
        <div>
          <div className="text-xs tracking-[.08em] text-[rgba(246,242,236,.5)] mb-3">ما رو دنبال کن</div>
          <div className="flex flex-col gap-2.5">
            <a href="#" className="flex items-center gap-2 text-[13px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="1" />
              </svg>
              اینستاگرام {instagramHandle}@
            </a>
            <a href="#" className="flex items-center gap-2 text-[13px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M22 3L2 11l6 2m14-10l-4 18-8-6m12-12L8 13" />
              </svg>
              تلگرام t.me/{telegramHandle}
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-[960px] mx-auto mt-9 pt-4.5 border-t border-[rgba(246,242,236,.12)] text-[11px] text-[rgba(246,242,236,.4)]">
        © انرژی — تمامی حقوق محفوظ است.
      </div>
    </div>
  );
}
