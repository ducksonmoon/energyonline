import { LUCIDE_ICONS, CUSTOM_ICON_PATHS, FALLBACK_ICON_KEY } from "@/lib/icons";

export function CategoryIcon({
  iconKey,
  size = 22,
  className,
}: {
  iconKey: string;
  size?: number;
  className?: string;
}) {
  const LucideComponent = LUCIDE_ICONS[iconKey];
  if (LucideComponent) {
    return <LucideComponent size={size} strokeWidth={1.75} className={className} />;
  }

  const path = CUSTOM_ICON_PATHS[iconKey] ?? CUSTOM_ICON_PATHS[FALLBACK_ICON_KEY];
  if (path) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d={path} />
      </svg>
    );
  }

  const FallbackLucide = LUCIDE_ICONS[FALLBACK_ICON_KEY];
  return <FallbackLucide size={size} strokeWidth={1.75} className={className} />;
}
