"use client";

/**
 * Custom AQI line icon — lungs with air particles
 */
export function AqiIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Lungs outline */}
      <path d="M12 4v8" />
      <path d="M8 12c-2 0-4 1-4 4s2 4 4 4c1.5 0 3-1 4-2" />
      <path d="M16 12c2 0 4 1 4 4s-2 4-4 4c-1.5 0-3-1-4-2" />
      {/* Air particles */}
      <circle cx="6" cy="8" r="0.8" fill={color} stroke="none" />
      <circle cx="18" cy="7" r="0.8" fill={color} stroke="none" />
      <circle cx="4" cy="5" r="0.6" fill={color} stroke="none" />
      <circle cx="20" cy="4" r="0.6" fill={color} stroke="none" />
      <circle cx="8" cy="5" r="0.5" fill={color} stroke="none" />
      <circle cx="16" cy="4" r="0.5" fill={color} stroke="none" />
    </svg>
  );
}

/**
 * AQI level badge with icon, number, and color
 */
export function AqiBadge({
  aqi,
  color,
  size = "sm",
}: {
  aqi: number;
  color: string;
  size?: "sm" | "md";
}) {
  const textColor = getAqiTextColor(aqi);
  const bgColor = `${color}15`;

  if (size === "sm") {
    return (
      <div
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full"
        style={{ background: bgColor, color: textColor }}
      >
        <AqiIcon size={12} color={color} />
        <span className="text-[10px] font-bold">{aqi}</span>
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ background: bgColor, color: textColor }}
    >
      <AqiIcon size={14} color={color} />
      <span className="text-[11px] font-bold">AQI {aqi}</span>
    </div>
  );
}

export function getAqiTextColor(aqi: number): string {
  if (aqi <= 50) return "#15803D";
  if (aqi <= 85) return "#A16207";
  if (aqi <= 150) return "#C2410C";
  if (aqi <= 200) return "#DC2626";
  return "#7C2D12";
}
