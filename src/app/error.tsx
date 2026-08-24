"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="energy-root min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col items-center justify-center gap-4 px-5 text-center"
      dir="rtl"
    >
      <div className="text-sm tracking-wide text-[var(--brand-red)]">خطا</div>
      <div className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-lalezar)" }}>
        یه مشکلی پیش اومد
      </div>
      <p className="text-sm text-[var(--ink-soft)] max-w-sm leading-7">
        صفحه با خطا مواجه شد. می‌تونی دوباره امتحان کنی یا به صفحه اصلی برگردی.
      </p>
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-full bg-[var(--ink)] text-[var(--bg)] px-5 py-2.5 text-sm font-bold cursor-pointer hover:opacity-90"
        >
          تلاش دوباره
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-bold"
        >
          صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
