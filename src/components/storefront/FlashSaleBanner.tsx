"use client";

import { useHmsCountdown } from "@/lib/useHmsCountdown";

export function FlashSaleBanner({ endsAt, bannerText }: { endsAt: Date | null; bannerText: string }) {
  const { text, expired } = useHmsCountdown(endsAt);

  if (!endsAt || expired) return null;

  return (
    <a
      href="#flash"
      className="relative flex items-center justify-center gap-2.5 overflow-hidden bg-[var(--brand-red)] px-3.5 py-2.5 text-center text-[12.5px] font-bold text-[var(--accent)]"
    >
      <span className="h-1.5 w-1.5 flex-none rounded-full bg-[var(--accent)] [animation:pulseDot_1.4s_ease-in-out_infinite]" />
      <span>{bannerText}</span>
      <span className="font-extrabold tracking-wide" dir="ltr">
        {text}
      </span>
    </a>
  );
}
