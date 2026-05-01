"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/i18n/context";
import { Gift, ChevronRight, Calendar, Trophy, Sparkles } from "lucide-react";

interface Activity {
  id: string;
  titleTh: string;
  titleEn: string;
  descTh: string;
  descEn: string;
  reward: string;
  color: string;
  icon: "gift" | "trophy" | "sparkles" | "calendar";
  imageQuery: string;
}

const iconMap = { gift: Gift, trophy: Trophy, sparkles: Sparkles, calendar: Calendar };

const activities: Activity[] = [
  {
    id: "walk-5km",
    titleTh: "เดินสะสม 5 กม. วันนี้",
    titleEn: "Walk 5km Today",
    descTh: "ทำภารกิจเดินครบ 5 กม. รับ Badge พิเศษ + Carbon Credit x2",
    descEn: "Complete 5km walking missions for a special Badge + 2x Carbon Credit",
    reward: "🏅 + 2x CO₂",
    color: "#10B981",
    icon: "sparkles",
    imageQuery: "Lumphini Park",
  },
  {
    id: "photo-challenge",
    titleTh: "ชาเลนจ์ถ่ายรูป Hidden Gem",
    titleEn: "Hidden Gem Photo Challenge",
    descTh: "ถ่ายรูปสถานที่ลับที่คนไม่ค่อยรู้จัก ลุ้นรับรางวัลประจำสัปดาห์",
    descEn: "Photograph a hidden gem spot — win weekly prizes!",
    reward: "🎁 Weekly Prize",
    color: "#8B5CF6",
    icon: "gift",
    imageQuery: "Talat Noi Bangkok",
  },
  {
    id: "weekend-quest",
    titleTh: "Weekend Quest: สายกิน",
    titleEn: "Weekend Quest: Foodie",
    descTh: "ทำภารกิจสายกินครบ 3 ร้าน รับ Badge 'Weekend Foodie Master'",
    descEn: "Complete 3 foodie missions this weekend for 'Weekend Foodie Master' Badge",
    reward: "🍜 Badge",
    color: "#F59E0B",
    icon: "trophy",
    imageQuery: "Chatuchak Market",
  },
  {
    id: "green-travel",
    titleTh: "Green Travel Week",
    titleEn: "Green Travel Week",
    descTh: "เที่ยวแบบเดิน/ปั่นจักรยาน สะสม Carbon Credit แลกส่วนลดร้านค้า",
    descEn: "Walk or bike this week — collect Carbon Credits for shop discounts",
    reward: "🌿 Discounts",
    color: "#059669",
    icon: "calendar",
    imageQuery: "Bang Krachao",
  },
];

export default function ActivityBanner() {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  // Fetch images for all activities
  useEffect(() => {
    activities.forEach(async (act) => {
      try {
        const res = await fetch(`/api/place-image?q=${encodeURIComponent(act.imageQuery)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.imageUrl) {
            setImageUrls((prev) => ({ ...prev, [act.id]: data.imageUrl }));
          }
        }
      } catch { /* ignore */ }
    });
  }, []);

  // Auto-slide
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % activities.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [paused]);

  const goTo = useCallback((i: number) => {
    setCurrent(i);
    setPaused(true);
    setTimeout(() => setPaused(false), 6000);
  }, []);

  const act = activities[current];
  const Icon = iconMap[act.icon];
  const imgUrl = imageUrls[act.id];

  return (
    <div className="mb-5 animate-fade-in-up">
      <div
        className="app-card overflow-hidden cursor-pointer transition-all duration-300"
        onClick={() => goTo((current + 1) % activities.length)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Image */}
        <div className="relative h-32 overflow-hidden">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={isEn ? act.titleEn : act.titleTh}
              className="w-full h-full object-cover transition-opacity duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${act.color}15, ${act.color}08)` }} />
          )}
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 60%)" }}
          />
          {/* Reward badge on image */}
          <div className="absolute top-3 right-3">
            <span
              className="px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{ background: "rgba(255,255,255,0.9)", color: act.color, backdropFilter: "blur(4px)" }}
            >
              {act.reward}
            </span>
          </div>
          {/* Title on image */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-[15px] font-bold text-white leading-tight drop-shadow-sm">
              {isEn ? act.titleEn : act.titleTh}
            </h3>
          </div>
        </div>

        {/* Description */}
        <div className="p-3 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${act.color}12` }}
          >
            <Icon size={18} strokeWidth={1.8} style={{ color: act.color }} />
          </div>
          <p className="flex-1 text-[12px] leading-relaxed line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>
            {isEn ? act.descEn : act.descTh}
          </p>
          <ChevronRight size={16} strokeWidth={2} className="flex-shrink-0" style={{ color: act.color }} />
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 pb-2.5">
          {activities.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); goTo(i); }}
              className="transition-all duration-300"
              style={{
                width: i === current ? 16 : 6,
                height: 6,
                borderRadius: 3,
                background: i === current ? act.color : "var(--color-border)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
