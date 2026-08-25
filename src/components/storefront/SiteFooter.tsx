import Image from "next/image";

export function SiteFooter({
  address,
  phone,
  phoneTurkey,
  hoursWeekday,
  hoursThursday,
  hoursFriday,
  instagramHandle,
  telegramHandle,
}: {
  address: string;
  phone: string;
  phoneTurkey: string;
  hoursWeekday: string;
  hoursThursday: string;
  hoursFriday: string;
  instagramHandle: string;
  telegramHandle: string;
}) {
  return (
    <div className="bg-[var(--ink)] text-[var(--bg)] px-5 pt-14 pb-6.5">
      <div className="max-w-[1280px] mx-auto grid gap-9" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))" }}>
        <div>
          <Image
            src="/brand/energie-logo-light.png"
            alt="انرژی"
            width={140}
            height={79}
            className="mb-2.5 h-8 w-auto"
          />
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
          <div className="text-xs tracking-[.08em] text-[rgba(246,242,236,.5)] mb-3">تماس با ما</div>
          <div className="flex flex-col gap-2 text-[13px] text-[rgba(246,242,236,.85)]">
            <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="flex items-center gap-2" dir="ltr">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="shrink-0"
              >
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              {phone}
            </a>
            <a href={`tel:${phoneTurkey.replace(/[^0-9+]/g, "")}`} className="flex items-center gap-2" dir="ltr">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="shrink-0"
              >
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              {phoneTurkey}
            </a>
            <span className="text-[11px] text-[rgba(246,242,236,.5)]">سفارش از ترکیه</span>
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
            <a
              href={`https://instagram.com/${instagramHandle}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-[13px]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="1" />
              </svg>
              اینستاگرام <span dir="ltr">@{instagramHandle}</span>
            </a>
            <a
              href={`https://t.me/${telegramHandle}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-[13px]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M22 3L2 11l6 2m14-10l-4 18-8-6m12-12L8 13" />
              </svg>
              تلگرام <span dir="ltr">t.me/{telegramHandle}</span>
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto mt-9 pt-4.5 border-t border-[rgba(246,242,236,.12)] text-[11px] text-[rgba(246,242,236,.4)]">
        © انرژی — تمامی حقوق محفوظ است.
      </div>
    </div>
  );
}
