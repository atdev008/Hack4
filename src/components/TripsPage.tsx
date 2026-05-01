"use client";

import { useI18n } from "@/i18n/context";
import { SavedTrip } from "@/hooks/useSavedTrips";
import { Map, Trash2, ChevronRight, CheckCircle2 } from "lucide-react";
import { TripResult, MissionStatus } from "@/types";

interface TripsPageProps {
  trips: SavedTrip[];
  onViewTrip: (trip: TripResult, missions: MissionStatus[]) => void;
  onDelete: (id: string) => void;
  showCompleted?: boolean;
}

export default function TripsPage({ trips, onViewTrip, onDelete, showCompleted }: TripsPageProps) {
  const { t, locale } = useI18n();
  const isEn = locale === "en";

  const title = showCompleted ? t.completedTrips : t.myTrips;
  const emptyTitle = showCompleted ? t.completedTripsEmpty : t.myTripsEmpty;
  const emptySub = showCompleted ? t.completedTripsEmptySub : t.myTripsEmptySub;

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 animate-fade-in">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "var(--color-surface-3)" }}
        >
          {showCompleted ? (
            <CheckCircle2 size={28} strokeWidth={1.5} style={{ color: "var(--color-text-tertiary)" }} />
          ) : (
            <Map size={28} strokeWidth={1.5} style={{ color: "var(--color-text-tertiary)" }} />
          )}
        </div>
        <h3 className="text-base font-bold mb-1">{emptyTitle}</h3>
        <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>{emptySub}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="space-y-3">
        {trips.map((saved, i) => {
          const completedCount = saved.missions.filter((m) => m.completed).length;
          const totalCount = saved.missions.length;
          const date = new Date(saved.savedAt);
          const dateStr = date.toLocaleDateString(isEn ? "en-US" : "th-TH", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={saved.id}
              className={`app-card overflow-hidden animate-fade-in-up delay-${i + 1}`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[15px] truncate">{saved.trip.trip_title}</h3>
                      {saved.completed && (
                        <CheckCircle2 size={16} strokeWidth={2} style={{ color: "var(--color-success)" }} />
                      )}
                    </div>
                    <p className="text-[12px] truncate" style={{ color: "var(--color-text-secondary)" }}>
                      {saved.trip.short_description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                        {dateStr}
                      </span>
                      <span className="text-[11px]" style={{ color: saved.completed ? "var(--color-success)" : "var(--color-primary)" }}>
                        {t.missionsCount} {completedCount}/{totalCount}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                        ฿{saved.trip.estimated_budget?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onViewTrip(saved.trip, saved.missions)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                      style={{ background: "var(--color-primary)", color: "white" }}
                    >
                      <ChevronRight size={16} strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => onDelete(saved.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                      style={{ background: "var(--color-surface-3)" }}
                    >
                      <Trash2 size={14} strokeWidth={1.8} style={{ color: "var(--color-text-tertiary)" }} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1" style={{ background: "var(--color-border-light)" }}>
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                    background: saved.completed
                      ? "linear-gradient(90deg, #10B981, #14B8A6)"
                      : "linear-gradient(90deg, #6366F1, #818CF8)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* Spacer for bottom nav */}
      <div className="h-24" />
    </div>
  );
}
