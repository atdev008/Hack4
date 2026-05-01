"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/i18n/context";
import { ChevronRight, X } from "lucide-react";

interface GuideStep {
  targetId: string;
  titleTh: string;
  titleEn: string;
  descTh: string;
  descEn: string;
}

const STORAGE_KEY = "moodquest_trip_guide_done";

const steps: GuideStep[] = [
  {
    targetId: "trip-stamps-bar",
    titleTh: "แสตมป์สะสม",
    titleEn: "Stamp Collection",
    descTh: "ทำภารกิจสำเร็จจะได้แสตมป์ แสตมป์ที่ยังไม่ได้จะเป็นลายน้ำจางๆ พอทำสำเร็จจะเปลี่ยนเป็นสีเต็ม สะสมไว้อวดเพื่อนได้!",
    descEn: "Complete missions to earn stamps. Unearned stamps appear faded — they light up when you complete them. Collect and show off to friends!",
  },
  {
    targetId: "trip-hero-card",
    titleTh: "ข้อมูลทริป",
    titleEn: "Trip Info",
    descTh: "แสดงชื่อทริป งบประมาณโดยประมาณ ระดับความเหนื่อย และจำนวนสถานที่ทั้งหมด",
    descEn: "Shows trip name, estimated budget, tiredness level, and total number of places",
  },
  {
    targetId: "trip-progress",
    titleTh: "ความคืบหน้า",
    titleEn: "Progress",
    descTh: "แถบแสดงว่าทำภารกิจไปกี่ข้อแล้ว เมื่อครบทุกข้อจะได้รับ Badge!",
    descEn: "Shows how many missions you've completed. Finish all to earn a Badge!",
  },
  {
    targetId: "trip-route-map",
    titleTh: "แผนที่เส้นทาง",
    titleEn: "Route Map",
    descTh: "แสดงภาพรวมเส้นทางทั้งหมด จุด A B C D กดที่แผนที่หรือปุ่ม 'นำทางทั้งหมด' เพื่อเปิด Google Maps นำทางไปทุกจุดได้เลย",
    descEn: "Overview of your route with points A B C D. Tap the map or 'Navigate All' to open Google Maps with all waypoints",
  },
  {
    targetId: "trip-mission-0",
    titleTh: "การ์ดภารกิจ",
    titleEn: "Mission Card",
    descTh: "แต่ละการ์ดมี: รูปสถานที่จริง, อุณหภูมิ ณ จุดนั้น, ค่า AQI (คุณภาพอากาศ), คำเตือนฝนตก/ใส่หน้ากาก, Carbon Credit ที่ลดได้, และปุ่มนำทางไป Google Maps",
    descEn: "Each card shows: real place photo, temperature, AQI (air quality), rain/mask warnings, Carbon Credit saved, and a button to navigate via Google Maps",
  },
  {
    targetId: "trip-mission-actions-0",
    titleTh: "ยืนยันภารกิจ",
    titleEn: "Complete Mission",
    descTh: "3 วิธียืนยัน: 📷 ถ่ายรูป (เปิดกล้อง) | 🖼 เลือกรูป (จากแกลเลอรี่) | 📍 เช็คอิน (ใช้ GPS ตรวจว่าอยู่ใกล้สถานที่) — AI จะตรวจว่ารูป/ตำแหน่งตรงกับภารกิจ",
    descEn: "3 ways to verify: 📷 Camera (take photo) | 🖼 Gallery (pick photo) | 📍 Check-in (GPS verifies you're nearby) — AI checks if photo/location matches the mission",
  },
  {
    targetId: "save-trip-btn",
    titleTh: "บันทึกทริป",
    titleEn: "Save Trip",
    descTh: "กดปุ่มสีเขียวด้านล่างเพื่อบันทึกทริปนี้ ทริปจะถูกเก็บไว้ในหน้า 'ทริป' และข้อมูลจะเข้าระบบ",
    descEn: "Tap the green button at the bottom to save this trip. It will be stored in your 'Trips' tab and synced to your account",
  },
  {
    targetId: "trip-invite-btn",
    titleTh: "ชวนเพื่อนมาเล่น",
    titleEn: "Invite Friends",
    descTh: "แชร์ทริปนี้ให้เพื่อนผ่าน LINE, Messenger หรือหาเพื่อนใกล้เคียงที่ใช้แอปเดียวกัน",
    descEn: "Share this trip with friends via LINE, Messenger, or find nearby users on the same app",
  },
];

export default function TripGuide() {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    // Delay to let trip cards render
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible || !steps[current]) return;
    let attempts = 0;
    const tryFind = () => {
      const el = document.getElementById(steps[current].targetId);
      if (el) {
        const r = el.getBoundingClientRect();
        // Skip elements that are not visible (height 0)
        if (r.height > 0) {
          setRect(r);
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          // Re-measure after scroll settles
          setTimeout(() => {
            const r2 = el.getBoundingClientRect();
            if (r2.height > 0) setRect(r2);
          }, 500);
          return;
        }
      }
      // Retry up to 5 times
      attempts++;
      if (attempts < 5) setTimeout(tryFind, 600);
      else setRect(null);
    };
    const timer = setTimeout(tryFind, 300);
    return () => clearTimeout(timer);
  }, [visible, current]);

  const handleNext = useCallback(() => {
    if (current < steps.length - 1) {
      setCurrent(current + 1);
    } else {
      localStorage.setItem(STORAGE_KEY, "true");
      setVisible(false);
    }
  }, [current]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }, []);

  if (!visible || !steps[current]) return null;

  const s = steps[current];
  const isLast = current === steps.length - 1;

  const tooltipStyle: React.CSSProperties = { zIndex: 81, pointerEvents: "auto", maxWidth: 300 };
  if (rect) {
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow > 140) {
      tooltipStyle.top = rect.bottom + 12;
      tooltipStyle.left = Math.max(12, Math.min(rect.left, window.innerWidth - 316));
    } else {
      tooltipStyle.bottom = window.innerHeight - rect.top + 12;
      tooltipStyle.left = Math.max(12, Math.min(rect.left, window.innerWidth - 316));
    }
  } else {
    tooltipStyle.top = "35%";
    tooltipStyle.left = 16;
    tooltipStyle.right = 16;
  }

  return (
    <div className="fixed inset-0 z-[80]">
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="trip-spotlight">
            <rect width="100%" height="100%" fill="white" />
            {rect && <rect x={rect.left - 6} y={rect.top - 4} width={rect.width + 12} height={rect.height + 8} rx="14" fill="black" />}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#trip-spotlight)" />
      </svg>

      {rect && (
        <div className="absolute rounded-xl pointer-events-none"
          style={{ left: rect.left - 6, top: rect.top - 4, width: rect.width + 12, height: rect.height + 8, border: "2px solid #6366F1", boxShadow: "0 0 0 4px rgba(99,102,241,0.15)" }} />
      )}

      <div className="absolute inset-0" onClick={handleNext} />

      <div className="absolute animate-fade-in" style={tooltipStyle}>
        <div className="bg-white rounded-2xl p-4 shadow-xl">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className="text-[14px] font-bold">{isEn ? s.titleEn : s.titleTh}</h4>
            <button onClick={(e) => { e.stopPropagation(); handleSkip(); }}
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#F3F4F6" }}>
              <X size={11} strokeWidth={2} style={{ color: "#9CA3AF" }} />
            </button>
          </div>
          <p className="text-[12px] leading-relaxed mb-3" style={{ color: "#6B7280" }}>
            {isEn ? s.descEn : s.descTh}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div key={i} className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: i === current ? 12 : 4, background: i <= current ? "#6366F1" : "#E5E7EB" }} />
              ))}
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white"
              style={{ background: isLast ? "#10B981" : "#6366F1" }}>
              {isLast ? (isEn ? "Got it!" : "เข้าใจแล้ว!") : (isEn ? "Next" : "ถัดไป")}
              {!isLast && <ChevronRight size={11} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
