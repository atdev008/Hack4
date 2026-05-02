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
    descTh: "ภาพรวมเส้นทาง A B C D กดเพื่อเปิด Google Maps นำทางทุกจุด",
    descEn: "Route overview A B C D. Tap to open Google Maps navigation",
  },
  {
    targetId: "trip-mission-0",
    titleTh: "การ์ดภารกิจ",
    titleEn: "Mission Card",
    descTh: "รูปสถานที่จริง อุณหภูมิ AQI เตือนฝน/หน้ากาก Carbon Credit และปุ่มนำทาง",
    descEn: "Real photo, temperature, AQI, rain/mask alerts, Carbon Credit, and navigation",
  },
  {
    targetId: "trip-mission-actions-0",
    titleTh: "ยืนยันภารกิจ",
    titleEn: "Complete Mission",
    descTh: "📷 ถ่ายรูป | 🖼 เลือกรูป | 📍 เช็คอิน GPS — AI ตรวจให้อัตโนมัติ",
    descEn: "📷 Camera | 🖼 Gallery | 📍 GPS Check-in — AI verifies automatically",
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
    descTh: "แชร์ทริปให้เพื่อนผ่าน LINE, Messenger หรือหาเพื่อนใกล้เคียง",
    descEn: "Share trip via LINE, Messenger or find nearby friends",
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
    // Reset rect immediately when step changes
    setRect(null);
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tryFind = () => {
      const el = document.getElementById(steps[current].targetId);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.height > 0 && r.width > 0) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          // Wait for scroll to finish then measure
          timer = setTimeout(() => {
            const r2 = el.getBoundingClientRect();
            if (r2.height > 0) setRect(r2);
          }, 600);
          return;
        }
      }
      attempts++;
      if (attempts < 8) timer = setTimeout(tryFind, 500);
    };
    timer = setTimeout(tryFind, 200);
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

  const tooltipStyle: React.CSSProperties = { zIndex: 81, pointerEvents: "auto", maxWidth: 280, left: 16, right: 16 };
  if (rect) {
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow > 160) {
      // Show below target
      tooltipStyle.top = Math.min(rect.bottom + 12, window.innerHeight - 180);
    } else if (spaceAbove > 160) {
      // Show above target
      tooltipStyle.bottom = Math.max(window.innerHeight - rect.top + 12, 20);
    } else {
      // Not enough space — show in center of screen
      tooltipStyle.top = "50%";
      tooltipStyle.transform = "translateY(-50%)";
    }
  } else {
    tooltipStyle.top = "40%";
    tooltipStyle.transform = "translateY(-50%)";
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
