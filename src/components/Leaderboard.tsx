"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/context";
import { Trophy, Leaf, X, Medal } from "lucide-react";

interface LeaderEntry {
  rank: number;
  name: string;
  avatar: string;
  value: number;
  isMe?: boolean;
}

// Mock leaderboard data — in production this comes from a backend
const achievementBoard: LeaderEntry[] = [
  { rank: 1, name: "SomchaiTraveler", avatar: "🧑‍🦱", value: 24 },
  { rank: 2, name: "NidaExplorer", avatar: "👩", value: 21 },
  { rank: 3, name: "PongQuest", avatar: "🧔", value: 18 },
  { rank: 4, name: "MayWanderer", avatar: "👧", value: 15 },
  { rank: 5, name: "TonAdventure", avatar: "🧑", value: 13 },
  { rank: 6, name: "PimTravel", avatar: "👩‍🦰", value: 11 },
  { rank: 7, name: "BankRoamer", avatar: "👨", value: 9 },
  { rank: 8, name: "FernQuest", avatar: "👩‍🦳", value: 7 },
  { rank: 9, name: "OatExplore", avatar: "🧒", value: 5 },
  { rank: 10, name: "You", avatar: "😊", value: 0, isMe: true },
];

const carbonBoard: LeaderEntry[] = [
  { rank: 1, name: "GreenPong", avatar: "🧔", value: 4200 },
  { rank: 2, name: "EcoNida", avatar: "👩", value: 3800 },
  { rank: 3, name: "WalkMay", avatar: "👧", value: 3100 },
  { rank: 4, name: "BikeBank", avatar: "👨", value: 2700 },
  { rank: 5, name: "SomchaiGreen", avatar: "🧑‍🦱", value: 2400 },
  { rank: 6, name: "PimEco", avatar: "👩‍🦰", value: 1900 },
  { rank: 7, name: "TonWalker", avatar: "🧑", value: 1500 },
  { rank: 8, name: "FernBike", avatar: "👩‍🦳", value: 1100 },
  { rank: 9, name: "OatGreen", avatar: "🧒", value: 800 },
  { rank: 10, name: "You", avatar: "😊", value: 0, isMe: true },
];

interface LeaderboardProps {
  open: boolean;
  onClose: () => void;
  myBadges: number;
  myCarbonG: number;
}

export default function Leaderboard({ open, onClose, myBadges, myCarbonG }: LeaderboardProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const [tab, setTab] = useState<"achievement" | "carbon">("achievement");

  if (!open) return null;

  // Update "You" entry with real data
  const achBoard = achievementBoard.map((e) =>
    e.isMe ? { ...e, value: myBadges } : e
  ).sort((a, b) => b.value - a.value).map((e, i) => ({ ...e, rank: i + 1 }));

  const carbBoard = carbonBoard.map((e) =>
    e.isMe ? { ...e, value: myCarbonG } : e
  ).sort((a, b) => b.value - a.value).map((e, i) => ({ ...e, rank: i + 1 }));

  const board = tab === "achievement" ? achBoard : carbBoard;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}>
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Sheet */}
      <div className="bg-white rounded-t-3xl animate-slide-up max-h-[85vh] flex flex-col safe-bottom" style={{ boxShadow: "0 -4px 30px rgba(0,0,0,0.1)" }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--color-border)" }} />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Medal size={20} strokeWidth={1.8} style={{ color: "#F59E0B" }} />
            <h2 className="text-lg font-bold">{isEn ? "Leaderboard" : "กระดานผู้นำ"}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--color-surface-3)" }}>
            <X size={16} strokeWidth={2} style={{ color: "var(--color-text-tertiary)" }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pb-3 flex gap-2">
          <button
            onClick={() => setTab("achievement")}
            className="pill-btn flex-1 gap-1.5 text-[13px]"
            style={{
              background: tab === "achievement" ? "var(--color-primary)" : "var(--color-surface-3)",
              color: tab === "achievement" ? "white" : "var(--color-text-secondary)",
              padding: "10px 16px",
            }}
          >
            <Trophy size={14} strokeWidth={2} />
            {isEn ? "Achievement" : "ความสำเร็จ"}
          </button>
          <button
            onClick={() => setTab("carbon")}
            className="pill-btn flex-1 gap-1.5 text-[13px]"
            style={{
              background: tab === "carbon" ? "#10B981" : "var(--color-surface-3)",
              color: tab === "carbon" ? "white" : "var(--color-text-secondary)",
              padding: "10px 16px",
            }}
          >
            <Leaf size={14} strokeWidth={2} />
            {isEn ? "Carbon Credit" : "คาร์บอนเครดิต"}
          </button>
        </div>

        {/* Top 3 podium */}
        <div className="px-5 pb-4 flex items-end justify-center gap-3">
          {[board[1], board[0], board[2]].map((entry, i) => {
            if (!entry) return null;
            const podiumOrder = [2, 1, 3];
            const rank = podiumOrder[i];
            const heights = [80, 100, 64];
            const colors = ["#9CA3AF", "#F59E0B", "#CD7F32"];
            return (
              <div key={rank} className="flex flex-col items-center" style={{ width: 80 }}>
                <div className="text-2xl mb-1">{entry.avatar}</div>
                <span className="text-[11px] font-semibold truncate max-w-full">{entry.name}</span>
                <span className="text-[10px] font-bold mb-1" style={{ color: tab === "carbon" ? "#059669" : "var(--color-primary)" }}>
                  {tab === "carbon" ? `${entry.value}g` : `${entry.value} 🏆`}
                </span>
                <div
                  className="w-full rounded-t-xl flex items-start justify-center pt-2"
                  style={{ height: heights[i], background: `${colors[i]}20`, borderTop: `3px solid ${colors[i]}` }}
                >
                  <span className="text-[18px] font-black" style={{ color: colors[i] }}>{rank}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full list */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {board.slice(3).map((entry) => (
            <div
              key={entry.rank}
              className="flex items-center gap-3 py-2.5"
              style={{
                borderBottom: "1px solid var(--color-border-light)",
                ...(entry.isMe ? { background: "#6366F108", margin: "0 -20px", padding: "10px 20px", borderRadius: 12 } : {}),
              }}
            >
              <span className="w-6 text-[13px] font-bold text-center" style={{ color: "var(--color-text-tertiary)" }}>
                {entry.rank}
              </span>
              <span className="text-xl">{entry.avatar}</span>
              <span className={`flex-1 text-[13px] ${entry.isMe ? "font-bold" : "font-medium"}`}>
                {entry.name} {entry.isMe && (isEn ? "(You)" : "(คุณ)")}
              </span>
              <span className="text-[13px] font-bold" style={{ color: tab === "carbon" ? "#059669" : "var(--color-primary)" }}>
                {tab === "carbon" ? `${entry.value}g` : entry.value}
              </span>
              {tab === "achievement" && <Trophy size={13} strokeWidth={1.8} style={{ color: "#F59E0B" }} />}
              {tab === "carbon" && <Leaf size={13} strokeWidth={1.8} style={{ color: "#10B981" }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
