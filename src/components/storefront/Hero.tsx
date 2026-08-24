"use client";

import { useState, type MouseEvent } from "react";
import { CategoryIcon } from "@/components/storefront/CategoryIcon";

export type HeroTag = { catLabel: string; stockFa: string; iconKey: string };

const TAG_POSITIONS = [
  { className: "top-[6%] right-[3%] -rotate-[8deg]", anim: "animate-[floatA_4.5s_ease-in-out_infinite]" },
  { className: "bottom-[9%] left-0 rotate-[7deg]", anim: "animate-[floatB_5.5s_ease-in-out_infinite_.3s]" },
];

export function Hero({ heroStockLine, heroTags }: { heroStockLine: string; heroTags: HeroTag[] }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  }

  return (
    <div className="px-5 pt-7 pb-8 sm:px-6 sm:pt-12 sm:pb-[60px] relative flex flex-wrap items-center gap-6 sm:gap-10 max-w-[1160px] mx-auto">
      <div className="flex-1 min-w-[280px] basis-[380px] flex flex-col items-start gap-3 sm:gap-4">
        <div className="text-[10.5px] sm:text-[11px] tracking-[.14em] font-bold text-[var(--brand-red)]">
          همین الان، فقط همینا موجوده
        </div>
        <div className="flex items-center gap-2 [animation:heroWordIn_.8s_cubic-bezier(.16,1,.3,1)_both]">
          <svg width="18" height="32" viewBox="0 0 20 34" className="flex-none sm:w-[22px] sm:h-10">
            <path d="M18 2L4 17l14 15" stroke="var(--ink)" strokeWidth="5" strokeLinecap="square" fill="none" />
          </svg>
          <div
            className="text-[clamp(48px,15vw,108px)] leading-none tracking-wide -skew-x-[8deg]"
            style={{ fontFamily: "var(--font-lalezar)" }}
          >
            انرژی
          </div>
          <svg width="18" height="32" viewBox="0 0 20 34" className="flex-none sm:w-[22px] sm:h-10">
            <path d="M2 2L16 17 2 32" stroke="var(--accent)" strokeWidth="5" strokeLinecap="square" fill="none" />
          </svg>
        </div>
        <div className="text-[clamp(18px,4vw,24px)] font-bold leading-[1.4] sm:leading-[1.5]">
          تعداد مشخص، بدون تکرار.
          <br />
          وقتی تموم شد، تموم شد.
        </div>
        <div className="text-[12.5px] sm:text-[13px] leading-[1.8] text-[var(--ink-soft)]">{heroStockLine}</div>
        <a
          href="#grid"
          className="inline-flex items-center gap-2 rounded-[3px] bg-[var(--ink)] text-[var(--bg)] font-bold text-sm px-5 py-3 sm:px-[22px] sm:py-3.5 transition-transform active:scale-95 hover:scale-105"
        >
          دیدن موجودی
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M5 12h13M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>

      <div
        onMouseMove={handleMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        className="flex-1 min-w-[240px] basis-[320px] h-[220px] sm:h-[300px] md:h-[380px] relative"
        style={{ perspective: "1200px" }}
      >
        <div
          className="absolute inset-x-[8%] inset-y-[6%] rounded-[10px] bg-[var(--bg-alt)] overflow-hidden"
          style={{
            backgroundImage: "radial-gradient(var(--line) 1.4px, transparent 1.4px)",
            backgroundSize: "13px 13px",
          }}
        >
          <div
            className="absolute -top-1/3 -left-1/4 w-2/3 h-2/3 rounded-full opacity-40 blur-3xl"
            style={{ background: "var(--accent)" }}
          />
        </div>
        <div
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${tilt.x * 16}deg) rotateX(${-tilt.y * 16}deg)`,
          }}
        >
          <div
            className="absolute top-[28%] left-[36%] w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center [animation:floatDisc_5s_ease-in-out_infinite]"
            style={{ background: "var(--brand-red)", boxShadow: "0 20px 40px rgba(0,0,0,.18)" }}
          >
            <svg width="72%" viewBox="0 0 20 14" className="[animation:arrowShuttle_2.6s_ease-in-out_infinite]">
              <path
                d="M13 2.5L6 7l7 4.5"
                stroke="var(--accent)"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          {heroTags.map((t, i) => (
            <div
              key={t.catLabel + i}
              className={`absolute flex items-center gap-1.5 sm:gap-2 rounded-[6px] border border-[var(--line)] bg-[var(--bg)] px-2.5 py-2 sm:px-3.5 sm:py-2.5 z-[3] ${TAG_POSITIONS[i]?.className ?? ""} ${TAG_POSITIONS[i]?.anim ?? ""}`}
              style={{ boxShadow: "0 14px 26px rgba(0,0,0,.14)" }}
            >
              <div className="absolute -top-[5px] right-3.5 w-2.5 h-2.5 rounded-full bg-[var(--bg)] border-2 border-[var(--line)]" />
              <CategoryIcon iconKey={t.iconKey} size={16} className="text-[var(--ink)] sm:hidden" />
              <CategoryIcon iconKey={t.iconKey} size={18} className="text-[var(--ink)] hidden sm:block" />
              <div>
                <div className="text-[11px] sm:text-xs font-bold">{t.catLabel}</div>
                <div className="text-[9.5px] sm:text-[10.5px] font-bold text-[var(--brand-red)]">{t.stockFa}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
