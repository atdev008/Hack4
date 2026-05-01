"use client";

import { RouteItem } from "@/types";
import { useI18n } from "@/i18n/context";
import { Navigation, Footprints, Bike, Leaf } from "lucide-react";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

interface RouteMapProps {
  items: RouteItem[];
  transport?: string;
}

const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Average CO2 saved per km compared to car (150g CO2/km)
// Walking/cycling = 0g CO2, so saving = 150g/km = 0.15 kg/km
const CO2_SAVED_PER_KM = 0.15; // kg

// Calories per km
const CALORIES_WALK_PER_KM = 65;
const CALORIES_BIKE_PER_KM = 35;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

export default function RouteMap({ items, transport }: RouteMapProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  const points = items.filter((item) => item.place_lat && item.place_lng);
  if (points.length === 0) return null;

  // Calculate total distance
  let totalDistanceKm = 0;
  for (let i = 1; i < points.length; i++) {
    totalDistanceKm += haversineKm(
      points[i - 1].place_lat!, points[i - 1].place_lng!,
      points[i].place_lat!, points[i].place_lng!
    );
  }

  const isGreen = transport === "walk" || transport === "bike";
  const carbonSavedKg = isGreen ? totalDistanceKm * CO2_SAVED_PER_KM : 0;
  const calories = transport === "walk"
    ? totalDistanceKm * CALORIES_WALK_PER_KM
    : transport === "bike"
    ? totalDistanceKm * CALORIES_BIKE_PER_KM
    : 0;

  // Google Maps URL
  const origin = `${points[0].place_lat},${points[0].place_lng}`;
  const destination = `${points[points.length - 1].place_lat},${points[points.length - 1].place_lng}`;
  const waypoints = points.length > 2
    ? points.slice(1, -1).map((p) => `${p.place_lat},${p.place_lng}`).join("|")
    : "";
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ""}&travelmode=walking`;

  return (
    <div className="app-card overflow-hidden animate-fade-in-up delay-2">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold">{isEn ? "Route Map" : "แผนที่เส้นทาง"}</h3>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
          style={{ background: "var(--color-primary)", color: "white" }}
        >
          <Navigation size={12} strokeWidth={2} />
          {isEn ? "Navigate All" : "นำทางทั้งหมด"}
        </a>
      </div>

      {/* Total distance + Carbon Credit */}
      <div className="px-4 pb-2 flex flex-wrap items-center gap-2">
        {/* Total distance */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
          style={{ background: "var(--color-surface-3)", color: "var(--color-text-secondary)" }}
        >
          <Navigation size={12} strokeWidth={2} style={{ color: "var(--color-primary)" }} />
          {totalDistanceKm < 1
            ? `${Math.round(totalDistanceKm * 1000)} m`
            : `${totalDistanceKm.toFixed(1)} km`}
          {isEn ? " total" : " รวม"}
        </div>

        {/* Carbon Credit — only for walk/bike */}
        {isGreen && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
            style={{ background: "#10B98112", color: "#059669" }}
          >
            <Leaf size={12} strokeWidth={2} />
            {carbonSavedKg < 1
              ? `${Math.round(carbonSavedKg * 1000)}g`
              : `${carbonSavedKg.toFixed(2)}kg`}
            {" CO₂ "}
            {isEn ? "saved" : "ลดได้"}
          </div>
        )}

        {/* Calories — only for walk/bike */}
        {isGreen && calories > 0 && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
            style={{ background: "#F59E0B12", color: "#D97706" }}
          >
            {transport === "walk"
              ? <Footprints size={12} strokeWidth={2} />
              : <Bike size={12} strokeWidth={2} />}
            ~{Math.round(calories)} kcal
          </div>
        )}
      </div>

      {/* Interactive Map */}
      <div className="px-4 pb-3">
        <div className="rounded-2xl overflow-hidden" style={{ height: 220 }}>
          <LeafletMap points={points} />
        </div>
      </div>

      {/* Stop list */}
      <div className="px-4 pb-4">
        <div className="space-y-2">
          {points.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                style={{ background: "var(--color-primary)" }}
              >
                {LABELS[i]}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-semibold truncate block">{p.place}</span>
                {i > 0 && (
                  <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                    ↑ {(() => {
                      const d = haversineKm(points[i-1].place_lat!, points[i-1].place_lng!, p.place_lat!, p.place_lng!);
                      return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
                    })()}
                    {p.duration_text ? ` · ${p.duration_text}` : ""}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium flex-shrink-0" style={{ color: "var(--color-text-tertiary)" }}>
                {p.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
