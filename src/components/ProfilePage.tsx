"use client";

import { useI18n } from "@/i18n/context";
import { SavedTrip } from "@/hooks/useSavedTrips";
import { Trophy, MapPin, CheckCircle2, Star, LogOut } from "lucide-react";
import FriendsSection from "./FriendsSection";

interface ProfilePageProps {
  allTrips: SavedTrip[];
  completedTrips: SavedTrip[];
  userName?: string;
  userEmail?: string;
  userId?: string;
  geoLat?: number | null;
  geoLng?: number | null;
  onLogout?: () => void;
}

export default function ProfilePage({ allTrips, completedTrips, userName, userEmail, userId, geoLat, geoLng, onLogout }: ProfilePageProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  // Collect all stamps from completed trips
  const allStamps: { emoji: string; place: string; tripTitle: string }[] = [];
  const allBadges: { name: string; tripTitle: string }[] = [];

  completedTrips.forEach((saved) => {
    allBadges.push({ name: saved.trip.badge_reward, tripTitle: saved.trip.trip_title });
    saved.trip.route_items?.forEach((item, i) => {
      if (saved.missions[i]?.completed) {
        allStamps.push({
          emoji: item.stamp_emoji || "📍",
          place: item.place,
          tripTitle: saved.trip.trip_title,
        });
      }
    });
  });

  const totalMissions = allTrips.reduce((sum, t) => sum + t.missions.length, 0);
  const completedMissions = allTrips.reduce((sum, t) => sum + t.missions.filter((m) => m.completed).length, 0);
  const photoMissions = allTrips.reduce((sum, t) => sum + t.missions.filter((m) => m.photoUrl).length, 0);

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold mb-4">{isEn ? "Profile" : "โปรไฟล์"}</h2>

      {/* User info */}
      {userName && (
        <div className="app-card p-4 mb-4 flex items-center gap-3 animate-fade-in-up">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white" style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)" }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-bold truncate">{userName}</div>
            {userEmail && <div className="text-[12px] truncate" style={{ color: "var(--color-text-tertiary)" }}>{userEmail}</div>}
          </div>
          {onLogout && (
            <button onClick={onLogout} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--color-surface-3)" }}>
              <LogOut size={16} strokeWidth={1.8} style={{ color: "var(--color-text-tertiary)" }} />
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="app-card p-3 text-center">
          <MapPin size={18} strokeWidth={1.8} className="mx-auto mb-1" style={{ color: "var(--color-primary)" }} />
          <div className="text-lg font-bold">{allTrips.length}</div>
          <div className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>{isEn ? "Trips" : "ทริป"}</div>
        </div>
        <div className="app-card p-3 text-center">
          <CheckCircle2 size={18} strokeWidth={1.8} className="mx-auto mb-1" style={{ color: "var(--color-success)" }} />
          <div className="text-lg font-bold">{completedMissions}/{totalMissions}</div>
          <div className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>{isEn ? "Missions" : "ภารกิจ"}</div>
        </div>
        <div className="app-card p-3 text-center">
          <Star size={18} strokeWidth={1.8} className="mx-auto mb-1" style={{ color: "#F59E0B" }} />
          <div className="text-lg font-bold">{photoMissions}</div>
          <div className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>{isEn ? "Photos" : "รูปถ่าย"}</div>
        </div>
      </div>

      {/* Badges */}
      {allBadges.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Trophy size={16} strokeWidth={1.8} style={{ color: "#F59E0B" }} />
            {isEn ? "Badges" : "เหรียญตรา"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {allBadges.map((badge, i) => (
              <div key={i} className="app-card px-3 py-2 flex items-center gap-2">
                <Trophy size={14} strokeWidth={1.8} style={{ color: "#F59E0B" }} />
                <div>
                  <div className="text-[13px] font-semibold">{badge.name}</div>
                  <div className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>{badge.tripTitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stamp Collection */}
      {allStamps.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold mb-3">{isEn ? "Stamp Collection" : "แสตมป์สะสม"}</h3>
          <div className="grid grid-cols-5 gap-3">
            {allStamps.map((stamp, i) => (
              <div key={i} className="flex flex-col items-center gap-1 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2"
                  style={{ borderColor: "var(--color-primary)", background: "var(--color-primary)08", boxShadow: "0 0 12px rgba(99,102,241,0.15)" }}
                >
                  {stamp.emoji}
                </div>
                <span className="text-[9px] font-medium text-center max-w-[60px] truncate" style={{ color: "var(--color-text-secondary)" }}>
                  {stamp.place}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--color-surface-3)" }}>
            <Star size={24} strokeWidth={1.5} style={{ color: "var(--color-text-tertiary)" }} />
          </div>
          <p className="text-sm font-medium">{isEn ? "No stamps yet" : "ยังไม่มีแสตมป์"}</p>
          <p className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>{isEn ? "Complete missions to collect stamps!" : "ทำภารกิจเพื่อสะสมแสตมป์!"}</p>
        </div>
      )}

      {/* Friends */}
      {userId && (
        <FriendsSection userId={userId} userName={userName || ""} geoLat={geoLat} geoLng={geoLng} />
      )}

      <div className="h-24" />
    </div>
  );
}
