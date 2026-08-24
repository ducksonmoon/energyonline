"use client";

export function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="px-4 sm:px-5 pt-4">
      <div className="max-w-[520px] mx-auto relative">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="absolute top-1/2 -translate-y-1/2 right-3.5 text-[var(--ink-soft)] pointer-events-none"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          inputMode="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="جستجوی محصول..."
          className="w-full rounded-full border border-[var(--line)] bg-transparent pr-10 pl-9 py-2.5 text-sm placeholder:text-[var(--ink-soft)] focus:outline-none focus:border-[var(--ink)] transition-colors"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="پاک کردن جستجو"
            className="absolute top-1/2 -translate-y-1/2 left-3 text-[var(--ink-soft)] cursor-pointer text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
