"use client";

import { useEffect, useState } from "react";
import { RevealOnScroll } from "@/components/storefront/RevealOnScroll";
import { toFa } from "@/lib/format";

function useCountdown(target: Date | null) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!target) return;
    function tick() {
      const diff = Math.max(0, target!.getTime() - Date.now());
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setText(`${toFa(days)} روز و ${toFa(hours)} ساعت و ${toFa(mins)} دقیقه`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return text;
}

export function AvailabilityBanner({
  showCountdown,
  discountEndsAt,
  flashActive,
}: {
  showCountdown: boolean;
  discountEndsAt: Date | null;
  flashActive: boolean;
}) {
  const countdownText = useCountdown(discountEndsAt);

  if (flashActive || !showCountdown || !discountEndsAt) return null;

  return (
    <div className="bg-[var(--ink)] text-[var(--bg)] px-5 py-6 relative overflow-hidden">
      <RevealOnScroll className="max-w-[1280px] mx-auto flex items-center gap-4 flex-wrap">
        <div className="text-[13px] text-[rgba(246,242,236,.6)]">پایان تخفیف‌های فعلی:</div>
        <div className="font-extrabold text-lg tracking-wide text-[var(--accent)]">{countdownText}</div>
      </RevealOnScroll>
    </div>
  );
}
