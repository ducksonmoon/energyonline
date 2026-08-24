"use client";

export type NavCategory = { key: string; label: string };

export function CategoryNav({
  categories,
  active,
  onSelect,
}: {
  categories: NavCategory[];
  active: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div id="grid" className="px-4 sm:px-5 pt-7 sm:pt-11">
      <div className="max-w-[1100px] mx-auto flex gap-2 sm:gap-2.5 flex-wrap justify-center">
        {categories.map((c) => {
          const isActive = active === c.key;
          return (
            <button
              key={c.key}
              onClick={() => onSelect(c.key)}
              className="rounded-[22px] text-[13px] font-semibold px-[18px] py-[9px] cursor-pointer transition-all duration-250 border"
              style={{
                borderColor: isActive ? "var(--ink)" : "var(--line)",
                background: isActive ? "var(--ink)" : "transparent",
                color: isActive ? "var(--bg)" : "var(--ink)",
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
