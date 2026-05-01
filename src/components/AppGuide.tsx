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
  action?: () => void; // auto-action when reaching this step
}

const STORAGE_KEY = "moodquest_app_guide_done";

interface AppGuideProps {
  onSelectMood?: (id: string) => void;
  onGoToDetails?: () => void;
  onSelectProvince?: () => void;
  onSelectDistrict?: () => void;
  step: string; // current app step: "mood" | "details"
}

export default function AppGuide({ onSelectMood, onGoToDetails, onSelectProvince, onSelectDistrict, step: appStep }: AppGuideProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // All guide steps across pages
  const steps: GuideStep[] = appStep === "mood" ? [
    {
      targetId: "mood-healing",
      titleTh: "เลือก mood ที่ต้องการ",
      titleEn: "Pick your mood",
      descTh: "ลองเลือก 'ฮีลใจ' เป็นตัวอย่าง",
      descEn: "Try selecting 'Healing' as an example",
      action: () => onSelectMood?.("healing"),
    },
    {
      targetId: "bottom-nav-center",
      titleTh: "กดปุ่มนี้เพื่อไปต่อ",
      titleEn: "Tap this button to continue",
      descTh: "ปุ่มจะขยายออก กดเพื่อไปหน้าตั้งค่าทริป",
      descEn: "The button expands — tap to go to trip setup",
      action: () => onGoToDetails?.(),
    },
  ] : appStep === "details" ? [
    {
      targetId: "area-province-tab",
      titleTh: "เลือกวิธีระบุพื้นที่",
      titleEn: "Choose area method",
      descTh: "เลือก 'จังหวัด' แล้วกดกรุงเทพเป็นตัวอย่าง",
      descEn: "Select 'Province' then pick Bangkok",
      action: () => onSelectProvince?.(),
    },
    {
      targetId: "area-radius-slider",
      titleTh: "ตั้งรัศมีค้นหา",
      titleEn: "Set search radius",
      descTh: "เลื่อนเพื่อกำหนดว่าภารกิจจะอยู่ไกลแค่ไหน",
      descEn: "Slide to set how far missions can be",
    },
    {
      targetId: "duration-slider",
      titleTh: "เลือกเวลาที่มี",
      titleEn: "Set available time",
      descTh: "เลื่อนเพื่อกำหนดเวลาเที่ยว",
      descEn: "Slide to set trip duration",
    },
    {
      targetId: "budget-slider",
      titleTh: "ตั้งงบประมาณ",
      titleEn: "Set budget",
      descTh: "เลื่อนเพื่อกำหนดงบที่ต้องการ",
      descEn: "Slide to set your budget",
    },
    {
      targetId: "places-count-section",
      titleTh: "เลือกจำนวนสถานที่",
      titleEn: "Choose number of places",
      descTh: "เลือกจำนวนหรือปล่อยอัตโนมัติ",
      descEn: "Pick a number or leave on Auto",
    },
    {
      targetId: "transport-section",
      titleTh: "เลือกวิธีเดินทาง",
      titleEn: "Choose transport",
      descTh: "เลือกว่าจะเดินทางแบบไหน",
      descEn: "Pick how you'll get around",
    },
    {
      targetId: "bottom-nav-center",
      titleTh: "กดสร้างทริป!",
      titleEn: "Create your trip!",
      descTh: "AI จะสร้างภารกิจสุดพิเศษให้คุณ 🎯",
      descEn: "AI will create special quests for you 🎯",
    },
  ] : [];

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Reset step when app step changes
  useEffect(() => {
    setCurrent(0);
  }, [appStep]);

  // Update target rect
  useEffect(() => {
    if (!visible || !steps[current]) return;
    const findEl = () => {
      const el = document.getElementById(steps[current].targetId);
      if (el) {
        setRect(el.getBoundingClientRect());
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setRect(null);
      }
    };
    // Delay to let DOM update after actions
    const timer = setTimeout(findEl, 300);
    return () => clearTimeout(timer);
  }, [visible, current, steps, appStep]);

  const handleNext = useCallback(() => {
    const step = steps[current];
    // Execute action if any
    if (step?.action) step.action();

    if (current < steps.length - 1) {
      setCurrent(current + 1);
    } else {
      // Done with this page's steps
      if (appStep === "details") {
        // All done
        localStorage.setItem(STORAGE_KEY, "true");
        setVisible(false);
      }
      // If mood page, guide continues on details page
    }
  }, [current, steps, appStep]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }, []);

  if (!visible || steps.length === 0 || !steps[current]) return null;

  const s = steps[current];
  const isLast = appStep === "details" && current === steps.length - 1;

  // Tooltip position
  const tooltipStyle: React.CSSProperties = { zIndex: 81, pointerEvents: "auto", maxWidth: 280 };
  if (rect) {
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow > 120) {
      tooltipStyle.top = rect.bottom + 12;
      tooltipStyle.left = Math.max(16, Math.min(rect.left, window.innerWidth - 296));
    } else {
      tooltipStyle.bottom = window.innerHeight - rect.top + 12;
      tooltipStyle.left = Math.max(16, Math.min(rect.left, window.innerWidth - 296));
    }
  } else {
    tooltipStyle.top = "40%";
    tooltipStyle.left = 20;
    tooltipStyle.right = 20;
  }

  return (
    <div className="fixed inset-0 z-[80]">
      {/* Spotlight overlay */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="app-spotlight">
            <rect width="100%" height="100%" fill="white" />
            {rect && <rect x={rect.left - 6} y={rect.top - 4} width={rect.width + 12} height={rect.height + 8} rx="12" fill="black" />}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#app-spotlight)" />
      </svg>

      {/* Highlight */}
      {rect && (
        <div className="absolute rounded-xl pointer-events-none"
          style={{ left: rect.left - 6, top: rect.top - 4, width: rect.width + 12, height: rect.height + 8, border: "2px solid #6366F1", boxShadow: "0 0 0 4px rgba(99,102,241,0.2)" }} />
      )}

      {/* Click to advance */}
      <div className="absolute inset-0" onClick={handleNext} />

      {/* Tooltip */}
      <div className="absolute animate-fade-in" style={tooltipStyle}>
        <div className="bg-white rounded-2xl p-4 shadow-xl">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-[14px] font-bold">{isEn ? s.titleEn : s.titleTh}</h4>
            <button onClick={(e) => { e.stopPropagation(); handleSkip(); }}
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#F3F4F6" }}>
              <X size={11} strokeWidth={2} style={{ color: "#9CA3AF" }} />
            </button>
          </div>
          <p className="text-[12px] mb-3" style={{ color: "#6B7280" }}>{isEn ? s.descEn : s.descTh}</p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium" style={{ color: "#9CA3AF" }}>{current + 1}/{steps.length}</span>
            <button onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white"
              style={{ background: isLast ? "#10B981" : "#6366F1" }}>
              {isLast ? (isEn ? "Done!" : "เสร็จ!") : (isEn ? "Next" : "ถัดไป")}
              {!isLast && <ChevronRight size={11} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
