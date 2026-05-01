"use client";

import { useState, useRef, useEffect } from "react";
import { TripResult as TripResultType, MissionStatus } from "@/types";
import { useI18n } from "@/i18n/context";
import { Wallet, Zap, MapPin, Target, CheckCircle2, Trophy, BookOpen, Umbrella, Sun, CloudSun, CloudRain, CloudDrizzle, Cloud, ShieldAlert } from "./Icons";
import { AqiIcon, getAqiTextColor } from "./AqiIcon";
import { Camera, Loader2, Share2, Copy, Check, ImagePlus, RefreshCw, Navigation, MapPinCheck, Leaf } from "lucide-react";
import RouteMap from "./RouteMap";
import { type ComponentType } from "react";
import { type LucideProps } from "lucide-react";

interface TripResultProps {
  trip: TripResultType;
  missions: MissionStatus[];
  onCompleteMission: (index: number, photoUrl?: string) => void;
  onSave: () => void;
  onRecalculate: () => void;
  allCompleted: boolean;
  transport?: string;
  isSaved?: boolean;
}

const weatherIconMap: Record<string, ComponentType<LucideProps>> = {
  sun: Sun, "cloud-sun": CloudSun, cloud: Cloud, "cloud-drizzle": CloudDrizzle, "cloud-rain": CloudRain,
};
function getIconForWeather(iconName?: string) { return iconName ? weatherIconMap[iconName] || null : null; }
function getWeatherChipStyle(iconName?: string) {
  switch (iconName) {
    case "cloud-rain": return { bg: "#DBEAFE", text: "#1E40AF", icon: "#3B82F6" };
    case "cloud-drizzle": return { bg: "#DBEAFE", text: "#1E40AF", icon: "#60A5FA" };
    case "cloud-sun": return { bg: "#FEF3C7", text: "#92400E", icon: "#F59E0B" };
    case "cloud": return { bg: "#F3F4F6", text: "#6B7280", icon: "#9CA3AF" };
    default: return { bg: "#FEF9C3", text: "#92400E", icon: "#F59E0B" };
  }
}

export default function TripResult({ trip, missions, onCompleteMission, onSave, onRecalculate, allCompleted, transport, isSaved }: TripResultProps) {
  const { t, locale } = useI18n();
  const isEn = !t.completeMission.includes("สำเร็จ");
  const completedCount = missions.filter((m) => m.completed).length;
  const totalCount = missions.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4 pb-6">
      {/* Stamp Collection Bar */}
      <div className="app-card p-4 animate-fade-in-up">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">{isEn ? "Stamps" : "แสตมป์สะสม"}</span>
          <span className="text-[12px] font-bold" style={{ color: "var(--color-primary)" }}>{completedCount}/{totalCount}</span>
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {trip.route_items?.map((item, i) => {
            const done = missions[i]?.completed;
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-1 transition-all duration-500"
                style={{ opacity: done ? 1 : 0.25, filter: done ? "none" : "grayscale(1)", transform: done ? "scale(1)" : "scale(0.9)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-all duration-500"
                  style={{
                    borderColor: done ? "var(--color-primary)" : "var(--color-border)",
                    background: done ? "var(--color-primary)08" : "var(--color-surface-3)",
                    boxShadow: done ? "0 0 12px rgba(99,102,241,0.2)" : "none",
                  }}
                >
                  {item.stamp_emoji || "📍"}
                </div>
                <span className="text-[9px] font-medium max-w-[56px] text-center truncate" style={{ color: done ? "var(--color-text)" : "var(--color-text-tertiary)" }}>
                  {item.place.length > 8 ? item.place.slice(0, 8) + "…" : item.place}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hero Card */}
      <div className="app-card overflow-hidden animate-fade-in-up delay-1">
        <div className="p-5 pb-4">
          <h2 className="text-xl font-bold leading-tight mb-1">{trip.trip_title}</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{trip.short_description}</p>
        </div>
        <div className="grid grid-cols-3 border-t" style={{ borderColor: "var(--color-border-light)" }}>
          <StatItem icon={<Wallet size={16} strokeWidth={1.8} style={{ color: "#6366F1" }} />} label={t.budgetStat} value={`฿${trip.estimated_budget?.toLocaleString() ?? "—"}`} />
          <StatItem icon={<Zap size={16} strokeWidth={1.8} style={{ color: "#F59E0B" }} />} label={t.tiredness} value={trip.tiredness_level} border />
          <StatItem icon={<MapPin size={16} strokeWidth={1.8} style={{ color: "#10B981" }} />} label={t.places} value={`${totalCount} ${t.placesUnit}`} />
        </div>
      </div>

      {/* Progress */}
      <div className="app-card p-4 animate-fade-in-up delay-2">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-sm font-semibold">{t.progress}</span>
          <span className="text-sm font-bold" style={{ color: allCompleted ? "var(--color-success)" : "var(--color-primary)" }}>{completedCount}/{totalCount}</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%`, background: allCompleted ? "linear-gradient(90deg, #10B981, #14B8A6)" : "linear-gradient(90deg, #6366F1, #818CF8)" }} />
        </div>
      </div>

      {/* Route Map */}
      {trip.route_items && <RouteMap items={trip.route_items} transport={transport} />}

      {/* Route Timeline */}
      <div className="space-y-3">
        {trip.route_items?.map((item, index) => (
          <MissionCard
            key={index}
            item={item}
            index={index}
            prevItem={index > 0 ? trip.route_items[index - 1] : undefined}
            mission={missions[index]}
            missions={missions}
            onComplete={onCompleteMission}
            t={t}
            isEn={isEn}
            transport={transport}
          />
        ))}
      </div>

      {/* Completion */}
      {allCompleted && (
        <div className="app-card overflow-hidden animate-scale-in">
          <div className="p-6 text-center" style={{ background: "#10B98106" }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "#F59E0B10" }}>
              <Trophy size={32} strokeWidth={1.5} style={{ color: "#F59E0B" }} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--color-success)" }}>{t.congrats}</p>
            <h3 className="text-xl font-bold mb-4">{trip.badge_reward}</h3>
            <div className="rounded-2xl p-4 text-left" style={{ background: "var(--color-surface-3)" }}>
              <p className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: "var(--color-text-tertiary)" }}>
                <BookOpen size={12} strokeWidth={2} />{t.travelMemory}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{trip.travel_memory_preview}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="pt-2 space-y-2">
        {!isSaved && (
          <button onClick={onRecalculate} className="pill-btn w-full gap-2" style={{ background: "var(--color-primary)", color: "white", padding: "14px 20px" }}>
            <RefreshCw size={16} strokeWidth={2} />{isEn ? "Recalculate Trip" : "สร้างทริปใหม่"}
          </button>
        )}
        <InviteButton trip={trip} isEn={isEn} />
      </div>
    </div>
  );
}

/* ─── Mission Card with Photo Upload ─── */
function MissionCard({
  item, index, prevItem, mission, missions, onComplete, t, isEn, transport,
}: {
  item: TripResultType["route_items"][number];
  index: number;
  prevItem?: TripResultType["route_items"][number];
  mission: MissionStatus;
  missions: MissionStatus[];
  onComplete: (index: number, photoUrl?: string) => void;
  t: Record<string, unknown>;
  isEn: boolean;
  transport?: string;
}) {
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const isCompleted = mission?.completed ?? false;
  const isNext = !isCompleted && missions.slice(0, index).every((m) => m.completed);

  // Carbon credit for this segment (walk/bike only)
  const isGreen = transport === "walk" || transport === "bike";
  let segmentKm = 0;
  if (isGreen && prevItem?.place_lat && prevItem?.place_lng && item.place_lat && item.place_lng) {
    const R = 6371;
    const dLat = (item.place_lat - prevItem.place_lat) * Math.PI / 180;
    const dLng = (item.place_lng! - prevItem.place_lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(prevItem.place_lat * Math.PI / 180) * Math.cos(item.place_lat * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    segmentKm = R * 2 * Math.asin(Math.sqrt(a));
  }
  const segmentCO2g = Math.round(segmentKm * 150); // 150g CO2/km saved vs car
  const WeatherIcon = getIconForWeather(item.weather_icon);
  const chipStyle = getWeatherChipStyle(item.weather_icon);
  const hasPlaceWeather = item.temp != null || item.aqi != null;
  const needMask = item.aqi != null && item.aqi > 85;

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVerifying(true);
    setVerifyMsg(null);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => { resolve((reader.result as string).split(",")[1]); };
        reader.readAsDataURL(file);
      });
      const photoUrl = URL.createObjectURL(file);
      let userLat: number | undefined, userLng: number | undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        userLat = pos.coords.latitude; userLng = pos.coords.longitude;
      } catch { /* GPS not available */ }
      const res = await fetch("/api/verify-photo", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64, place: item.place, mission: item.mission, photoHint: item.photo_hint,
          userLat, userLng, placeLat: item.place_lat, placeLng: item.place_lng,
        }),
      });
      const result = await res.json();
      if (result.verified) {
        setVerifyMsg(result.comment || (isEn ? "Verified! ✨" : "ยืนยันสำเร็จ! ✨"));
        setTimeout(() => onComplete(index, photoUrl), 800);
      } else {
        setVerifyMsg(result.comment || (isEn ? "Try again" : "ลองใหม่นะ"));
        setVerifying(false);
      }
    } catch { onComplete(index); setVerifying(false); }
  };

  const handleGpsCheckin = async () => {
    if (!item.place_lat || !item.place_lng) { onComplete(index); return; }
    setVerifying(true); setVerifyMsg(null);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      });
      const res = await fetch("/api/verify-photo", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place: item.place, mission: item.mission,
          userLat: pos.coords.latitude, userLng: pos.coords.longitude,
          placeLat: item.place_lat, placeLng: item.place_lng,
        }),
      });
      const result = await res.json();
      setVerifyMsg(result.comment);
      if (result.verified) { setTimeout(() => onComplete(index), 800); }
      else { setVerifying(false); }
    } catch {
      setVerifyMsg(isEn ? "Could not get location" : "ไม่สามารถระบุตำแหน่งได้");
      setVerifying(false);
    }
  };

  return (
    <div
      className={`app-card overflow-hidden animate-fade-in-up delay-${Math.min(index + 3, 9)}`}
      style={{
        ...(isNext ? { outline: "2px solid var(--color-primary)", outlineOffset: "-2px", borderColor: "transparent" } : {}),
        ...(isCompleted ? { opacity: 0.6 } : {}),
      }}
    >
      <div className="p-4">
        {/* Place image — Google Places photo or Wikipedia fallback */}
        <div className="relative mb-3">
          {item.place_photo_url ? (
            <img src={item.place_photo_url} alt={item.place} className="w-full h-40 object-cover rounded-xl" loading="lazy" />
          ) : item.place_image_query ? (
            <div className="rounded-xl overflow-hidden">
              <PlaceImage query={item.place_image_query} alt={item.place} />
            </div>
          ) : null}
          {/* Distance badge */}
          {item.distance_text && (
            <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium"
              style={{ background: "rgba(255,255,255,0.92)", color: "var(--color-text-secondary)", backdropFilter: "blur(4px)" }}>
              <Navigation size={11} strokeWidth={2} style={{ color: "var(--color-primary)" }} />
              {item.distance_text} · {item.duration_text}
            </div>
          )}
        </div>

        {/* Badges — weather + carbon */}
        {(hasPlaceWeather || (isGreen && segmentCO2g > 0)) && (
          <div className="flex justify-end gap-1.5 mb-2 flex-wrap">
            {item.temp != null && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: chipStyle.bg, color: chipStyle.text }}>
                {WeatherIcon && <WeatherIcon size={13} strokeWidth={2} style={{ color: chipStyle.icon }} />}
                <span className="text-[11px] font-semibold">{item.temp}°C</span>
              </div>
            )}
            {item.aqi != null && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: `${item.aqi_color || "#FFFF00"}15`, color: getAqiTextColor(item.aqi) }}>
                <AqiIcon size={12} color={item.aqi_color || "#FFFF00"} />
                <span className="text-[10px] font-bold">{item.aqi}</span>
              </div>
            )}
            {/* Carbon credit badge — walk/bike only */}
            {isGreen && segmentCO2g > 0 && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: "#10B98112", color: "#059669" }}>
                <Leaf size={11} strokeWidth={2} />
                <span className="text-[10px] font-bold">-{segmentCO2g}g CO₂</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-shrink-0 pt-0.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: isCompleted ? "var(--color-success)" : isNext ? "var(--color-primary)" : "var(--color-text-tertiary)" }}>
              {isCompleted ? <CheckCircle2 size={18} strokeWidth={2} color="white" /> : <span className="text-sm font-bold text-white">{index + 1}</span>}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ background: "#6366F110", color: "var(--color-primary)" }}>{item.time}</span>
              <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>{item.stay_minutes} {t.mins as string}</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-[15px]">{item.place}</h3>
              <a
                href={item.place_lat && item.place_lng
                  ? `https://www.google.com/maps/dir/?api=1&destination=${item.place_lat},${item.place_lng}&travelmode=walking`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.place)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "#6366F110" }}
                title={isEn ? "Open in Google Maps" : "เปิดใน Google Maps"}
              >
                <Navigation size={13} strokeWidth={2} style={{ color: "var(--color-primary)" }} />
              </a>
            </div>
            <p className="text-[13px] leading-relaxed flex items-start gap-1.5" style={{ color: "var(--color-text-secondary)" }}>
              <Target size={14} strokeWidth={1.8} className="flex-shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }} />
              {item.mission}
            </p>

            {/* Photo hint */}
            {item.photo_hint && !isCompleted && (
              <div className="flex items-start gap-1.5 mt-2 px-3 py-2 rounded-lg text-[12px]" style={{ background: "#F3F4F6", color: "var(--color-text-secondary)" }}>
                <Camera size={13} strokeWidth={1.8} className="flex-shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }} />
                <span>{item.photo_hint}</span>
              </div>
            )}

            {/* Uploaded photo preview */}
            {mission?.photoUrl && (
              <div className="mt-2 rounded-xl overflow-hidden">
                <img src={mission.photoUrl} alt="Mission photo" className="w-full h-32 object-cover rounded-xl" />
              </div>
            )}

            {/* Rain tip */}
            {item.rain_tip && (
              <div className="flex items-start gap-1.5 mt-2 px-3 py-2 rounded-lg text-[12px]" style={{ background: "#EFF6FF", color: "#1E40AF" }}>
                <Umbrella size={13} strokeWidth={2} className="flex-shrink-0 mt-0.5" /><span>{item.rain_tip}</span>
              </div>
            )}
            {item.weather_warning && (
              <div className="flex items-start gap-1.5 mt-2 px-3 py-2 rounded-lg text-[12px]" style={{ background: needMask ? `${item.aqi_color || "#FF7E00"}08` : "#FEF3C7", color: needMask ? getAqiTextColor(item.aqi!) : "#92400E" }}>
                <ShieldAlert size={13} strokeWidth={2} className="flex-shrink-0 mt-0.5" style={{ color: needMask ? (item.aqi_color || "#FF7E00") : "#F59E0B" }} /><span>{item.weather_warning}</span>
              </div>
            )}
            {!item.weather_warning && needMask && (
              <div className="flex items-start gap-1.5 mt-2 px-3 py-2 rounded-lg text-[12px]" style={{ background: `${item.aqi_color || "#FF7E00"}08`, color: getAqiTextColor(item.aqi!) }}>
                <ShieldAlert size={13} strokeWidth={2} className="flex-shrink-0 mt-0.5" style={{ color: item.aqi_color || "#FF7E00" }} />
                <span>{isEn ? `AQI ${item.aqi} — Wear a mask when outdoors` : `AQI ${item.aqi} — แนะนำสวมหน้ากากเมื่ออยู่กลางแจ้ง`}</span>
              </div>
            )}

            {/* Verify message */}
            {verifyMsg && (
              <div className="mt-2 px-3 py-2 rounded-lg text-[12px] font-medium animate-fade-in" style={{ background: "#F0FDF4", color: "#15803D" }}>
                {verifyMsg}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {!isCompleted && (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {/* Camera */}
              <button onClick={() => cameraRef.current?.click()} disabled={verifying}
                className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all duration-200"
                style={{ background: isNext ? "var(--color-primary)" : "var(--color-surface-3)", color: isNext ? "white" : "var(--color-text-secondary)" }}>
                {verifying ? <Loader2 size={20} strokeWidth={2} className="animate-spin" /> : <Camera size={20} strokeWidth={1.8} />}
                <span className="text-[11px] font-medium">{verifying ? "..." : (isEn ? "Camera" : "ถ่ายรูป")}</span>
              </button>
              {/* Gallery */}
              <button onClick={() => fileRef.current?.click()} disabled={verifying}
                className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all duration-200"
                style={{ background: "var(--color-surface-3)", color: "var(--color-text-secondary)" }}>
                <ImagePlus size={20} strokeWidth={1.8} />
                <span className="text-[11px] font-medium">{isEn ? "Gallery" : "เลือกรูป"}</span>
              </button>
              {/* GPS Check-in */}
              {item.place_lat && item.place_lng ? (
                <button onClick={handleGpsCheckin} disabled={verifying}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all duration-200"
                  style={{ background: "#10B98110", color: "#10B981" }}>
                  <MapPinCheck size={20} strokeWidth={1.8} />
                  <span className="text-[11px] font-medium">{isEn ? "Check-in" : "เช็คอิน"}</span>
                </button>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl"
                  style={{ background: "var(--color-surface-3)", opacity: 0.4 }}>
                  <MapPinCheck size={20} strokeWidth={1.8} style={{ color: "var(--color-text-tertiary)" }} />
                  <span className="text-[11px] font-medium" style={{ color: "var(--color-text-tertiary)" }}>{isEn ? "Check-in" : "เช็คอิน"}</span>
                </div>
              )}
            </div>
            {/* Stamp watermark */}
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 border-dashed"
                style={{ opacity: 0.2, filter: "grayscale(1)", borderColor: "var(--color-border)" }}>
                {item.stamp_emoji || "📍"}
              </div>
            </div>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSelect} />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
          </div>
        )}
        {isCompleted && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm font-medium" style={{ background: "#10B98108", color: "var(--color-success)" }}>
              <CheckCircle2 size={16} strokeWidth={2} />{t.completed as string}
            </div>
            {/* Earned stamp — full color */}
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-xl border-2 flex-shrink-0 animate-scale-in"
              style={{ borderColor: "var(--color-primary)", background: "var(--color-primary)08", boxShadow: "0 0 12px rgba(99,102,241,0.25)" }}
            >
              {item.stamp_emoji || "📍"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Invite Button with bottom sheet ─── */
function InviteButton({ trip, isEn }: { trip: TripResultType; isEn: boolean }) {
  const [copied, setCopied] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [sheetMode, setSheetMode] = useState<"choose" | "phone" | "nearby">("choose");

  const generateInviteText = () => {
    const places = trip.route_items?.map((r) => `📍 ${r.place}`).join("\n") || "";
    return isEn
      ? `🗺️ Join my MoodQuest trip!\n\n${trip.trip_title}\n${trip.short_description}\n\n${places}\n\n🎯 ${trip.route_items?.length || 0} missions to complete!\nBadge: ${trip.badge_reward}\n\nDownload MoodQuest Thailand to join!`
      : `🗺️ มาเที่ยวด้วยกัน!\n\n${trip.trip_title}\n${trip.short_description}\n\n${places}\n\n🎯 ${trip.route_items?.length || 0} ภารกิจรอคุณอยู่!\nBadge: ${trip.badge_reward}\n\nมาเล่น MoodQuest Thailand กัน!`;
  };

  const handlePhoneShare = async () => {
    const text = generateInviteText();
    if (navigator.share) {
      try { await navigator.share({ title: trip.trip_title, text }); return; } catch { /* cancelled */ }
    }
    setSheetMode("phone");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateInviteText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* not available */ }
  };

  return (
    <>
      <button
        onClick={() => { setShowSheet(true); setSheetMode("choose"); }}
        className="pill-btn w-full gap-2"
        style={{ background: "white", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)", padding: "14px 20px" }}
      >
        <Share2 size={16} strokeWidth={2} />
        {isEn ? "Invite Friends" : "ชวนเพื่อนมาเล่น"}
      </button>

      {/* Bottom sheet overlay */}
      {showSheet && (
        <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}>
          <div className="flex-1" onClick={() => setShowSheet(false)} />
          <div className="bg-white rounded-t-3xl animate-slide-up safe-bottom" style={{ boxShadow: "0 -4px 30px rgba(0,0,0,0.1)" }}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: "var(--color-border)" }} />
            </div>

            <div className="px-5 pb-2 flex items-center justify-between">
              <span className="text-[15px] font-bold">
                {sheetMode === "choose" ? (isEn ? "Invite Friends" : "ชวนเพื่อน") :
                 sheetMode === "phone" ? (isEn ? "Share via phone" : "แชร์ผ่านโทรศัพท์") :
                 (isEn ? "Nearby explorers" : "นักเที่ยวใกล้เคียง")}
              </span>
              <button onClick={() => setShowSheet(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--color-surface-3)" }}>
                <span className="text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>✕</span>
              </button>
            </div>

            <div className="px-5 pb-6">
              {/* Choose mode */}
              {sheetMode === "choose" && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button onClick={handlePhoneShare}
                    className="flex flex-col items-center gap-2 p-5 rounded-2xl transition-all active:scale-95"
                    style={{ background: "var(--color-surface-3)" }}>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#6366F110" }}>
                      <Share2 size={24} strokeWidth={1.8} style={{ color: "var(--color-primary)" }} />
                    </div>
                    <span className="text-[14px] font-semibold">{isEn ? "From Phone" : "จากโทรศัพท์"}</span>
                    <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>LINE, Messenger, SMS</span>
                  </button>
                  <button onClick={() => setSheetMode("nearby")}
                    className="flex flex-col items-center gap-2 p-5 rounded-2xl transition-all active:scale-95"
                    style={{ background: "var(--color-surface-3)" }}>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#10B98110" }}>
                      <Navigation size={24} strokeWidth={1.8} style={{ color: "#10B981" }} />
                    </div>
                    <span className="text-[14px] font-semibold">{isEn ? "Nearby" : "คนใกล้เคียง"}</span>
                    <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>{isEn ? "Find explorers" : "หาเพื่อนร่วมทริป"}</span>
                  </button>
                </div>
              )}

              {/* Phone share */}
              {sheetMode === "phone" && (
                <div className="space-y-3 pt-2">
                  <div className="rounded-xl p-3 text-[12px] leading-relaxed whitespace-pre-line" style={{ background: "var(--color-surface-3)", color: "var(--color-text-secondary)", maxHeight: 160, overflow: "auto" }}>
                    {generateInviteText()}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="pill-btn flex-1 gap-1.5 text-[13px]" style={{ background: copied ? "#10B981" : "var(--color-primary)", color: "white", padding: "12px 16px" }}>
                      {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={2} />}
                      {copied ? (isEn ? "Copied!" : "คัดลอกแล้ว!") : (isEn ? "Copy" : "คัดลอก")}
                    </button>
                    <button onClick={() => setSheetMode("choose")} className="pill-btn text-[13px]" style={{ background: "var(--color-surface-3)", color: "var(--color-text-secondary)", padding: "12px 16px" }}>
                      {isEn ? "Back" : "กลับ"}
                    </button>
                  </div>
                </div>
              )}

              {/* Nearby */}
              {sheetMode === "nearby" && (
                <div className="pt-2 text-center py-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#10B98110" }}>
                    <Navigation size={28} strokeWidth={1.5} style={{ color: "#10B981" }} />
                  </div>
                  <p className="text-[14px] font-semibold mb-1">{isEn ? "Coming Soon!" : "เร็วๆ นี้!"}</p>
                  <p className="text-[12px] mb-4" style={{ color: "var(--color-text-tertiary)" }}>
                    {isEn ? "Share via phone for now" : "ตอนนี้แชร์ผ่านโทรศัพท์ก่อนนะ"}
                  </p>
                  <button onClick={() => setSheetMode("choose")} className="pill-btn text-[13px]" style={{ background: "var(--color-surface-3)", color: "var(--color-text-secondary)", padding: "10px 20px" }}>
                    {isEn ? "Back" : "กลับ"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Place Image (fetched from Wikipedia) ─── */
function PlaceImage({ query, alt }: { query: string; alt: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchImage = async () => {
      try {
        const res = await fetch(`/api/place-image?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.imageUrl) setSrc(data.imageUrl);
          else if (!cancelled) setError(true);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    };
    fetchImage();
    return () => { cancelled = true; };
  }, [query]);

  if (error || !src) {
    // Fallback: colored gradient placeholder
    return (
      <div className="w-full h-36 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366F108, #818CF808)" }}>
        <MapPin size={24} strokeWidth={1.5} style={{ color: "var(--color-text-tertiary)" }} />
      </div>
    );
  }

  return (
    <img src={src} alt={alt} className="w-full h-36 object-cover" loading="lazy" onError={() => setError(true)} />
  );
}

function StatItem({ icon, label, value, border }: { icon: React.ReactNode; label: string; value: string; border?: boolean }) {
  return (
    <div className="flex flex-col items-center py-3 px-2" style={{ borderLeft: border ? "1px solid var(--color-border-light)" : undefined, borderRight: border ? "1px solid var(--color-border-light)" : undefined }}>
      <div className="mb-0.5">{icon}</div>
      <span className="text-[10px] font-medium" style={{ color: "var(--color-text-tertiary)" }}>{label}</span>
      <span className="text-[13px] font-bold">{value}</span>
    </div>
  );
}
