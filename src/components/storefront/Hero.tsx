"use client";

import { useState, type MouseEvent } from "react";
import { CategoryIcon } from "@/components/storefront/CategoryIcon";

export type HeroTag = { catLabel: string; stockFa: string; iconKey: string };

const TAG_POSITIONS = [
  { className: "top-[4%] right-[2%] -rotate-[8deg]", anim: "animate-[floatA_4.5s_ease-in-out_infinite]" },
  { className: "bottom-[6%] left-[2%] rotate-[7deg]", anim: "animate-[floatB_5.5s_ease-in-out_infinite_.3s]" },
  { className: "top-[8%] left-[6%] rotate-[5deg]", anim: "animate-[floatA_5s_ease-in-out_infinite_.6s]" },
];

export function Hero({ heroStockLine, heroTags }: { heroStockLine: string; heroTags: HeroTag[] }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  }

  return (
    <div className="relative px-5 pt-8 pb-2 sm:pt-11 sm:pb-8 max-w-[1280px] mx-auto lg:flex lg:items-center lg:gap-12 xl:gap-20">
      <div
        className="pointer-events-none absolute -top-10 right-0 w-[60vw] max-w-[420px] h-[280px] rounded-full opacity-[0.12] blur-[70px]"
        style={{ background: "var(--brand-red)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-[50vw] max-w-[320px] h-[220px] rounded-full opacity-[0.14] blur-[70px]"
        style={{ background: "var(--accent)" }}
      />
      <div className="relative flex flex-col items-center text-center gap-2.5 lg:flex-1 lg:items-start lg:text-right">
        <div className="text-[10.5px] sm:text-[11px] tracking-[.14em] font-bold text-[var(--brand-red)]">
          جدیدترین انتخاب‌ها
        </div>
        <div className="text-[clamp(22px,4vw,34px)] font-extrabold leading-[1.35] max-w-[480px] [animation:heroWordIn_.8s_cubic-bezier(.16,1,.3,1)_both]">
          منتخب لباس‌های اورجینال از ترکیه، با تعداد محدود.
        </div>
        <div className="text-[12px] sm:text-[12.5px] text-[var(--ink-soft)]">{heroStockLine}</div>
        <a
          href="#grid"
          className="mt-1.5 inline-flex items-center gap-2 rounded-[3px] bg-[var(--ink)] text-[var(--bg)] font-bold text-sm px-5 py-3 sm:px-[22px] sm:py-3.5 transition-transform active:scale-95 hover:scale-105"
        >
          مشاهده محصولات
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

      <div
        onMouseMove={handleMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        className="mt-3 lg:mt-0 mx-auto w-full max-w-[340px] h-[210px] lg:flex-1 lg:max-w-none lg:h-[320px] relative"
        style={{ perspective: "1200px" }}
      >
        <div
          className="absolute inset-x-[6%] inset-y-[4%] rounded-[10px] overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--brand-red) 6%, var(--bg-alt)), color-mix(in srgb, var(--accent) 10%, var(--bg-alt)))",
            backgroundImage:
              "radial-gradient(var(--line) 1.4px, transparent 1.4px), linear-gradient(135deg, color-mix(in srgb, var(--brand-red) 6%, var(--bg-alt)), color-mix(in srgb, var(--accent) 10%, var(--bg-alt)))",
            backgroundSize: "13px 13px, 100% 100%",
          }}
        >
          <div
            className="absolute -top-1/3 -left-1/4 w-2/3 h-2/3 rounded-full opacity-50 blur-3xl"
            style={{ background: "var(--accent)" }}
          />
          <div
            className="absolute -bottom-1/3 -right-1/4 w-1/2 h-1/2 rounded-full opacity-30 blur-3xl"
            style={{ background: "var(--brand-red)" }}
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
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[104px] h-[104px] rounded-full flex items-center justify-center [animation:floatDisc_5s_ease-in-out_infinite]"
            style={{
              background: "radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--brand-red) 88%, white), var(--brand-red))",
              boxShadow: "0 16px 32px rgba(0,0,0,.2)",
            }}
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
              className={`absolute flex items-center gap-1.5 rounded-[6px] border border-[var(--line)] bg-[var(--bg)] px-2 py-1.5 z-[3] ${TAG_POSITIONS[i]?.className ?? ""} ${TAG_POSITIONS[i]?.anim ?? ""}`}
              style={{ boxShadow: "0 10px 20px rgba(0,0,0,.14)" }}
            >
              <div className="absolute -top-[4px] right-3 w-2 h-2 rounded-full bg-[var(--bg)] border-2 border-[var(--line)]" />
              <CategoryIcon iconKey={t.iconKey} size={14} className="text-[var(--ink)]" />
              <div>
                <div className="text-[10px] font-bold">{t.catLabel}</div>
                <div className="text-[9px] font-bold text-[var(--brand-red)]">{t.stockFa}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
