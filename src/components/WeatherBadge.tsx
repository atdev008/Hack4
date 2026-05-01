"use client";

import { WeatherData, AqiData } from "@/types";
import { useI18n } from "@/i18n/context";
import { Sun, CloudSun, CloudRain, CloudDrizzle, Cloud, Thermometer, Droplets, ShieldAlert, Umbrella } from "./Icons";
import { AqiIcon, getAqiTextColor } from "./AqiIcon";

interface WeatherBadgeProps {
  weather: WeatherData | null;
  aqi?: AqiData | null;
  loading?: boolean;
  currentTemp?: number | null;
  locationName?: string | null;
}

// Shared style logic — same as mission cards
// Check both rainPercent AND description text for rain keywords
function getChipStyle(rainPercent: number, desc?: string) {
  const isRainDesc = desc
    ? /ฝน|พายุ|rain|storm|thunder|shower/i.test(desc)
    : false;

  if (rainPercent >= 60 || (isRainDesc && rainPercent >= 30))
    return { bg: "#DBEAFE", text: "#1E40AF", icon: "#3B82F6" };
  if (rainPercent >= 40 || isRainDesc)
    return { bg: "#DBEAFE", text: "#1E40AF", icon: "#60A5FA" };
  if (rainPercent >= 20)
    return { bg: "#FEF3C7", text: "#92400E", icon: "#F59E0B" };
  if (rainPercent >= 10)
    return { bg: "#F3F4F6", text: "#6B7280", icon: "#9CA3AF" };
  return { bg: "#FEF9C3", text: "#92400E", icon: "#F59E0B" };
}

function getWeatherIcon(rainPercent: number, size = 18, desc?: string) {
  const isRainDesc = desc
    ? /ฝน|พายุ|rain|storm|thunder|shower/i.test(desc)
    : false;
  const style = getChipStyle(rainPercent, desc);

  if (rainPercent >= 60 || (isRainDesc && rainPercent >= 30))
    return <CloudRain size={size} strokeWidth={1.8} style={{ color: style.icon }} />;
  if (rainPercent >= 40 || isRainDesc)
    return <CloudDrizzle size={size} strokeWidth={1.8} style={{ color: style.icon }} />;
  if (rainPercent >= 20)
    return <CloudSun size={size} strokeWidth={1.8} style={{ color: style.icon }} />;
  if (rainPercent >= 10)
    return <Cloud size={size} strokeWidth={1.8} style={{ color: style.icon }} />;
  return <Sun size={size} strokeWidth={1.8} style={{ color: style.icon }} />;
}

export function WeatherBadgeInline({ weather, aqi, loading, currentTemp, locationName }: WeatherBadgeProps) {
  const { locale } = useI18n();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full skeleton">
          <div className="w-4 h-4 rounded-full" />
          <div className="w-20 h-3 rounded" />
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const { today } = weather;
  const desc = locale === "en" ? today.descEn : today.descTh;
  const chip = getChipStyle(today.rainPercent, desc);

  return (
    <div className="flex flex-wrap items-center gap-1.5 animate-fade-in">
      {/* Weather chip — same style as mission card badges */}
      <div
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
        style={{ background: chip.bg, color: chip.text }}
      >
        {getWeatherIcon(today.rainPercent, 13, desc)}
        <span>{currentTemp ?? today.maxTemp}°C</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span className="font-medium">{desc || `${today.rainPercent}%`}</span>
        {locationName && (
          <>
            <span style={{ opacity: 0.4 }}>·</span>
            <span className="text-[10px] font-medium">{locationName}</span>
          </>
        )}
      </div>

      {/* AQI chip — same style as mission card badges */}
      {aqi && (
        <div
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full"
          style={{
            background: `${aqi.color}15`,
            color: getAqiTextColor(aqi.aqi),
          }}
        >
          <AqiIcon size={12} color={aqi.color} />
          <span className="text-[10px] font-bold">{aqi.aqi}</span>
        </div>
      )}
    </div>
  );
}

export function WeatherCard({ weather, aqi, loading }: WeatherBadgeProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  if (loading) {
    return (
      <div className="app-card p-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl skeleton" />
          <div className="flex-1 space-y-2">
            <div className="w-24 h-3 skeleton rounded" />
            <div className="w-32 h-3 skeleton rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const { today } = weather;
  const desc = isEn ? today.descEn : today.descTh;
  const chip = getChipStyle(today.rainPercent, desc);
  const isRainy = today.rainPercent >= 40 || /ฝน|พายุ|rain|storm|thunder|shower/i.test(desc || "");
  const needMask = aqi && aqi.aqi > 85;

  return (
    <div className="app-card overflow-hidden animate-fade-in-up">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon box — same rounded-xl style as mission number */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: chip.bg }}
          >
            {getWeatherIcon(today.rainPercent, 22, desc)}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold">{desc}</span>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
                <Thermometer size={12} strokeWidth={1.8} />
                {today.minTemp}° – {today.maxTemp}°C
              </span>
              <span className="flex items-center gap-1 text-[12px]" style={{ color: chip.text }}>
                <Droplets size={12} strokeWidth={1.8} style={{ color: chip.icon }} />
                {isEn ? "Rain" : "ฝน"} {today.rainPercent}%
              </span>
              {aqi && (
                <span className="flex items-center gap-1 text-[12px]" style={{ color: getAqiTextColor(aqi.aqi) }}>
                  <AqiIcon size={13} color={aqi.color} />
                  AQI {aqi.aqi}
                </span>
              )}
            </div>
          </div>

          {/* Top-right badges — same as mission card */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
              style={{ background: chip.bg, color: chip.text }}
            >
              {getWeatherIcon(today.rainPercent, 13, desc)}
              <span className="text-[11px] font-semibold">{today.maxTemp}°C</span>
            </div>
            {aqi && (
              <div
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full"
                style={{ background: `${aqi.color}15`, color: getAqiTextColor(aqi.aqi) }}
              >
                <AqiIcon size={12} color={aqi.color} />
                <span className="text-[10px] font-bold">{aqi.aqi}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warnings — same style as mission card warnings */}
      {(isRainy || needMask) && (
        <div>
          {isRainy && (
            <div
              className="px-4 py-2.5 flex items-start gap-2 text-[12px] font-medium"
              style={{ background: "#EFF6FF", color: "#1E40AF", borderTop: "1px solid #DBEAFE" }}
            >
              <Umbrella size={13} strokeWidth={2} className="flex-shrink-0 mt-0.5" />
              <span>
                {isEn
                  ? `${today.rainPercent}% chance of rain — bring an umbrella!`
                  : `โอกาสฝนตก ${today.rainPercent}% — อย่าลืมพกร่ม!`}
              </span>
            </div>
          )}
          {needMask && (
            <div
              className="px-4 py-2.5 flex items-start gap-2 text-[12px] font-medium"
              style={{
                background: `${aqi.color}08`,
                color: getAqiTextColor(aqi.aqi),
                borderTop: `1px solid ${aqi.color}20`,
              }}
            >
              <ShieldAlert size={13} strokeWidth={2} className="flex-shrink-0 mt-0.5" style={{ color: aqi.color }} />
              <span>
                {isEn
                  ? `AQI ${aqi.aqi} — Wear a mask outdoors for health protection`
                  : `AQI ${aqi.aqi} — แนะนำสวมหน้ากากอนามัยเมื่ออยู่กลางแจ้ง`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
