import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="energy-root min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col items-center justify-center gap-4 px-5 text-center"
      dir="rtl"
    >
      <div className="text-sm tracking-wide text-[var(--ink-soft)]">۴۰۴</div>
      <div className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-lalezar)" }}>
        این صفحه پیدا نشد
      </div>
      <p className="text-sm text-[var(--ink-soft)] max-w-sm leading-7">
        لینکی که دنبالش اومدی یا اشتباهه یا دیگه وجود نداره.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center justify-center rounded-full bg-[var(--ink)] text-[var(--bg)] px-5 py-2.5 text-sm font-bold hover:opacity-90"
      >
        بازگشت به فروشگاه
      </Link>
    </div>
  );
}
