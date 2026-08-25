"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { CategoryIcon } from "@/components/storefront/CategoryIcon";
import { toFa } from "@/lib/format";

export type CategoryShortcut = { key: string; label: string; iconKey: string; count: number };

const EDGE_TOLERANCE = 4;

export function CategoryShortcuts({
  shortcuts,
  onSelect,
}: {
  shortcuts: CategoryShortcut[];
  onSelect: (key: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startScrollLeft: number; moved: boolean; pointerId: number } | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  function updateEdges() {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= EDGE_TOLERANCE) {
      setAtStart(true);
      setAtEnd(true);
      return;
    }
    const distanceFromZero = Math.abs(el.scrollLeft);
    setAtStart(distanceFromZero <= EDGE_TOLERANCE);
    setAtEnd(distanceFromZero >= maxScroll - EDGE_TOLERANCE);
  }

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => updateEdges();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [shortcuts.length]);

  function scrollByStep(direction: "forward" | "back") {
    const el = scrollerRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.7;
    // Reading order runs right-to-left, and modern browsers report a negative
    // scrollLeft range for that, so "forward" means decreasing scrollLeft.
    el.scrollBy({ left: direction === "forward" ? -step : step, behavior: "smooth" });
  }

  function handleWheel(e: ReactWheelEvent<HTMLDivElement>) {
    const el = scrollerRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // native horizontal wheel/trackpad already works
    e.preventDefault();
    el.scrollLeft += e.deltaY;
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return; // let native touch scrolling handle phones/tablets
    const el = scrollerRef.current;
    if (!el) return;
    drag.current = { startX: e.clientX, startScrollLeft: el.scrollLeft, moved: false, pointerId: e.pointerId };
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // pointer may not be active (e.g. programmatic events) — dragging still works without capture
    }
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const el = scrollerRef.current;
    if (!el || !drag.current) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 3) drag.current.moved = true;
    el.scrollLeft = drag.current.startScrollLeft - dx;
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>) {
    const el = scrollerRef.current;
    if (el) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture may already be released
      }
    }
    drag.current = null;
  }

  function handleClickCapture(e: React.MouseEvent<HTMLDivElement>) {
    if (drag.current?.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return (
    <div className="px-4 sm:px-6 pb-7 sm:pb-11 pt-2 max-w-[1280px] mx-auto relative">
      <div
        ref={scrollerRef}
        data-noscrollbar
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={handleClickCapture}
        className="flex justify-center gap-2.5 sm:gap-3.5 overflow-x-auto py-2.5 px-0.5 pb-3.5 cursor-grab active:cursor-grabbing select-none"
        style={{ overscrollBehaviorX: "contain", WebkitOverflowScrolling: "touch" }}
      >
        {shortcuts.map((c, i) => {
          const tint = i % 2 === 0 ? "var(--brand-red)" : "var(--accent)";
          return (
            <a
              key={c.key}
              href="#grid"
              draggable={false}
              onClick={(e) => {
                e.preventDefault();
                onSelect(c.key);
              }}
              className="group flex-none flex flex-col items-center gap-2 w-[92px] px-2.5 pt-4 pb-3.5 border border-[var(--line)] rounded-[4px] relative bg-[var(--bg)] cursor-pointer transition-transform duration-300 [transition-timing-function:cubic-bezier(.16,1,.3,1)] hover:-translate-y-1 hover:border-[var(--ink)]"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute top-1.5 left-2 text-[10px] font-bold text-[var(--ink-soft)]">
                {toFa(c.count)}
              </div>
              <div
                className="flex items-center justify-center w-11 h-11 rounded-full transition-transform duration-300 group-hover:scale-110"
                style={{ background: `color-mix(in srgb, ${tint} 16%, transparent)` }}
              >
                <CategoryIcon iconKey={c.iconKey} size={22} className="text-[var(--ink)]" />
              </div>
              <span className="text-[12.5px] font-bold">{c.label}</span>
            </a>
          );
        })}
      </div>

      {!atStart && (
        <button
          type="button"
          aria-label="دسته‌بندی‌های قبلی"
          onClick={() => scrollByStep("back")}
          className="hidden sm:flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-[-14px] w-9 h-9 rounded-full border border-[var(--line)] bg-[var(--bg)] shadow-md cursor-pointer hover:border-[var(--ink)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      )}
      {!atEnd && (
        <button
          type="button"
          aria-label="دسته‌بندی‌های بعدی"
          onClick={() => scrollByStep("forward")}
          className="hidden sm:flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-[-14px] w-9 h-9 rounded-full border border-[var(--line)] bg-[var(--bg)] shadow-md cursor-pointer hover:border-[var(--ink)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
