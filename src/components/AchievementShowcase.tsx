"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/context";
import { SavedTrip } from "@/hooks/useSavedTrips";
import { Share2, Copy, Check, Trophy, Star, Target } from "lucide-react";

interface AchievementShowcaseProps {
  allTrips: SavedTrip[];
  completedTrips: SavedTrip[];
}

interface Badge {
  name: string;
  tripTitle: string;
  emoji: string;
  completed: boolean;
}

export default function AchievementShowcase({ allTrips, completedTrips }: AchievementShowcaseProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const [sharingBadge, setSharingBadge] = useState<Badge | null>(null);
  const [copied, setCopied] = useState(false);

  // Collect badges from ALL saved trips (completed = gold, incomplete = silver/locked)
  const badges: Badge[] = allTrips.map((saved) => ({
    name: saved.trip.badge_reward,
    tripTitle: saved.trip.trip_title,
    emoji: saved.trip.badge_emoji || "🏆",
    completed: saved.completed,
  }));

  // Collect stamps from all trips
  const stamps: { emoji: string; place: string; done: boolean }[] = [];
  allTrips.forEach((saved) => {
    saved.trip.route_items?.forEach((item, i) => {
      if (item.stamp_emoji) {
        stamps.push({
          emoji: item.stamp_emoji,
          place: item.place,
          done: saved.missions[i]?.completed ?? false,
        });
      }
    });
  });

  const totalMissions = allTrips.reduce((s, t) => s + t.missions.length, 0);
  const doneMissions = allTrips.reduce((s, t) => s + t.missions.filter((m) => m.completed).length, 0);

  const handleShareBadge = async (badge: Badge) => {
    const text = isEn
      ? `🏆 I earned "${badge.name}" on MoodQuest Thailand!\nTrip: ${badge.tripTitle}\n\nTravel by mood — join me!`
      : `🏆 ได้เหรียญ "${badge.name}" จาก MoodQuest Thailand!\nทริป: ${badge.tripTitle}\n\nมาเที่ยวตาม mood กัน!`;
    if (navigator.share) {
      try { await navigator.share({ title: badge.name, text }); return; } catch { /* cancelled */ }
    }
    setSharingBadge(badge);
  };

  const handleCopy = async () => {
    if (!sharingBadge) return;
    const text = isEn
      ? `🏆 I earned "${sharingBadge.name}" on MoodQuest! Trip: ${sharingBadge.tripTitle}`
      : `🏆 ได้เหรียญ "${sharingBadge.name}" จาก MoodQuest! ทริป: ${sharingBadge.tripTitle}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => { setCopied(false); setSharingBadge(null); }, 2000);
    } catch { /* not available */ }
  };

  return (
    <div className="mt-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Trophy size={16} strokeWidth={1.8} style={{ color: "#F59E0B" }} />
          <h3 className="text-[14px] font-bold">{isEn ? "Achievements" : "ความสำเร็จ"}</h3>
        </div>
        {badges.length > 0 && (
          <span className="text-[11px] font-medium" style={{ color: "var(--color-text-tertiary)" }}>
            {completedTrips.length}/{allTrips.length} {isEn ? "completed" : "สำเร็จ"}
          </span>
        )}
      </div>

      {/* Empty state */}
      {badges.length === 0 && (
        <div className="app-card p-5 text-center">
          <div className="flex justify-center gap-3 mb-3">
            {["🏆", "⭐", "🎯"].map((e, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: "var(--color-surface-3)",
                  border: "2px dashed var(--color-border)",
                  opacity: 0.4,
                }}
              >
                {e}
              </div>
            ))}
          </div>
          <p className="text-[13px] font-semibold mb-0.5">{isEn ? "No achievements yet" : "ยังไม่มีความสำเร็จ"}</p>
          <p className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
            {isEn ? "Complete your first trip to earn badges!" : "ทำทริปแรกให้สำเร็จเพื่อรับเหรียญ!"}
          </p>
        </div>
      )}

      {/* Trophy shelf */}
      {badges.length > 0 && (
        <div className="app-card overflow-hidden">
          {/* Badges row */}
          <div className="p-4 pb-3">
            <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {badges.map((badge, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                  <button
                    onClick={() => badge.completed ? handleShareBadge(badge) : undefined}
                    className="relative group"
                    disabled={!badge.completed}
                  >
                    {/* Glow — only for completed */}
                    {badge.completed && (
                      <div className="absolute inset-0 rounded-full" style={{ background: "#F59E0B", opacity: 0.15, filter: "blur(12px)", transform: "scale(1.2)" }} />
                    )}
                    {/* Medal */}
                    <div
                      className="relative w-[68px] h-[68px] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                      style={badge.completed ? {
                        background: "linear-gradient(145deg, #FEF3C7, #FDE68A, #FBBF24)",
                        border: "3px solid #F59E0B",
                        boxShadow: "0 6px 20px rgba(245,158,11,0.3), inset 0 2px 6px rgba(255,255,255,0.6)",
                      } : {
                        background: "linear-gradient(145deg, #F3F4F6, #E5E7EB)",
                        border: "3px solid #D1D5DB",
                        opacity: 0.5,
                      }}
                    >
                      <span className={`text-2xl ${badge.completed ? "drop-shadow-sm" : "grayscale"}`}>{badge.emoji}</span>
                    </div>
                    {/* Share dot — completed only */}
                    {badge.completed && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "var(--color-primary)", boxShadow: "0 2px 6px rgba(99,102,241,0.3)" }}>
                        <Share2 size={10} strokeWidth={2.5} color="white" />
                      </div>
                    )}
                  </button>
                  <div className="text-center max-w-[76px]">
                    <span className="text-[10px] font-semibold leading-tight block">{badge.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stamps row */}
          {stamps.length > 0 && (
            <div className="px-4 pb-3">
              <p className="text-[10px] font-semibold mb-2" style={{ color: "var(--color-text-tertiary)" }}>
                {isEn ? "STAMPS" : "แสตมป์"}
              </p>
              <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                {stamps.map((stamp, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 border-2 transition-all duration-300"
                    style={{
                      borderColor: stamp.done ? "var(--color-primary)" : "var(--color-border)",
                      background: stamp.done ? "var(--color-primary)06" : "transparent",
                      opacity: stamp.done ? 1 : 0.25,
                      filter: stamp.done ? "none" : "grayscale(1)",
                    }}
                    title={stamp.place}
                  >
                    {stamp.emoji}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="px-4 py-2.5 flex items-center justify-around" style={{ background: "var(--color-surface-3)", borderTop: "1px solid var(--color-border-light)" }}>
            <Stat icon={<Trophy size={13} strokeWidth={2} style={{ color: "#F59E0B" }} />} value={completedTrips.length} label={isEn ? "Badges" : "เหรียญ"} />
            <div className="w-px h-5" style={{ background: "var(--color-border)" }} />
            <Stat icon={<Target size={13} strokeWidth={2} style={{ color: "#6366F1" }} />} value={`${doneMissions}/${totalMissions}`} label={isEn ? "Missions" : "ภารกิจ"} />
            <div className="w-px h-5" style={{ background: "var(--color-border)" }} />
            <Stat icon={<Star size={13} strokeWidth={2} style={{ color: "#8B5CF6" }} />} value={stamps.filter((s) => s.done).length} label={isEn ? "Stamps" : "แสตมป์"} />
          </div>
        </div>
      )}

      {/* Share panel */}
      {sharingBadge && (
        <div className="app-card p-4 mt-3 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-semibold">{isEn ? "Share badge" : "แชร์เหรียญ"}</span>
            <button onClick={() => setSharingBadge(null)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--color-surface-3)" }}>
              <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>✕</span>
            </button>
          </div>
          <div className="flex items-center gap-3 mb-3 p-3 rounded-xl" style={{ background: "var(--color-surface-3)" }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
              style={{ background: "linear-gradient(135deg, #FEF3C7, #FDE68A)", border: "2px solid #F59E0B" }}>
              {sharingBadge.emoji}
            </div>
            <div>
              <div className="text-[13px] font-bold">{sharingBadge.name}</div>
              <div className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>{sharingBadge.tripTitle}</div>
            </div>
          </div>
          <button onClick={handleCopy} className="pill-btn w-full gap-1.5 text-[13px]"
            style={{ background: copied ? "#10B981" : "var(--color-primary)", color: "white", padding: "12px 16px" }}>
            {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={2} />}
            {copied ? (isEn ? "Copied!" : "คัดลอกแล้ว!") : (isEn ? "Copy & Share" : "คัดลอกเพื่อแชร์")}
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <div>
        <span className="text-[13px] font-bold block leading-none">{value}</span>
        <span className="text-[9px]" style={{ color: "var(--color-text-tertiary)" }}>{label}</span>
      </div>
    </div>
  );
}
