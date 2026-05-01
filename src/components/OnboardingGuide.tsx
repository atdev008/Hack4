"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/i18n/context";
import { ChevronRight, X } from "lucide-react";

interface GuideStep {
  targetId: string; // DOM element id to highlight
  titleTh: string;
  titleEn: string;
  descTh: string;
  descEn: string;
  arrow: "up" | "down" | "none";
}

const STORAGE_KEY = "moodquest_onboarding_done";

const loginSteps: GuideStep[] = [
  {
    targetId: "auth-signup-link",
    titleTh: "เริ่มจากสมัครสมาชิก",
    titleEn: "Start by signing up",
    descTh: "กดตรงนี้เพื่อสร้างบัญชีใหม่",
    descEn: "Tap here to create a new account",
    arrow: "down",
  },
];

const signupSteps: GuideStep[] = [
  {
    targetId: "auth-name-input",
    titleTh: "กรอกชื่อของคุณ",
    titleEn: "Enter your name",
    descTh: "ใส่ชื่อ-นามสกุล เพื่อให้เพื่อนรู้จักคุณ",
    descEn: "Your name so friends can find you",
    arrow: "down",
  },
  {
    targetId: "auth-email-input",
    titleTh: "ใส่อีเมล",
    titleEn: "Enter email",
    descTh: "ใช้อีเมลจริงของคุณ",
    descEn: "Use your real email address",
    arrow: "down",
  },
  {
    targetId: "auth-password-input",
    titleTh: "ตั้งรหัสผ่าน",
    titleEn: "Set password",
    descTh: "อย่างน้อย 6 ตัวอักษร",
    descEn: "At least 6 characters",
    arrow: "down",
  },
  {
    targetId: "auth-submit-btn",
    titleTh: "กดสร้างบัญชี!",
    titleEn: "Tap to create account!",
    descTh: "เสร็จแล้ว พร้อมเที่ยวตาม mood 🎉",
    descEn: "Done! Ready to travel by mood 🎉",
    arrow: "up",
  },
];

interface OnboardingGuideProps {
  onSwitchToSignup?: () => void;
  mode: "login" | "signup";
}

export default function OnboardingGuide({ onSwitchToSignup, mode }: OnboardingGuideProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"login" | "signup">("login");
  const [rect, setRect] = useState<DOMRect | null>(null);

  const steps = phase === "login" ? loginSteps : signupSteps;
  const step = steps[current];

  // Show only once ever
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  // Update target rect when step changes
  useEffect(() => {
    if (!visible || !step) return;
    const el = document.getElementById(step.targetId);
    if (el) {
      const r = el.getBoundingClientRect();
      setRect(r);
      // Scroll into view if needed
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setRect(null);
    }
  }, [visible, step, phase, current, mode]);

  // When AuthScreen switches to signup mode, advance guide
  useEffect(() => {
    if (mode === "signup" && phase === "login") {
      setPhase("signup");
      setCurrent(0);
    }
  }, [mode, phase]);

  const handleNext = useCallback(() => {
    if (phase === "login" && current === loginSteps.length - 1) {
      // Last login step → switch to signup
      if (onSwitchToSignup) onSwitchToSignup();
      setPhase("signup");
      setCurrent(0);
      return;
    }
    if (current < steps.length - 1) {
      setCurrent(current + 1);
    } else {
      // Done
      localStorage.setItem(STORAGE_KEY, "true");
      setVisible(false);
    }
  }, [phase, current, steps.length, onSwitchToSignup]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }, []);

  if (!visible || !step) return null;

  const allSteps = [...loginSteps, ...signupSteps];
  const globalIndex = phase === "login" ? current : loginSteps.length + current;
  const isLast = phase === "signup" && current === signupSteps.length - 1;

  // Tooltip position based on target rect and arrow direction
  const tooltipStyle: React.CSSProperties = {};
  if (rect) {
    if (step.arrow === "down") {
      // Tooltip above the target
      tooltipStyle.bottom = window.innerHeight - rect.top + 12;
      tooltipStyle.left = Math.max(16, rect.left + rect.width / 2 - 150);
      tooltipStyle.right = 16;
      tooltipStyle.maxWidth = 300;
    } else if (step.arrow === "up") {
      // Tooltip below the target
      tooltipStyle.top = rect.bottom + 12;
      tooltipStyle.left = Math.max(16, rect.left + rect.width / 2 - 150);
      tooltipStyle.right = 16;
      tooltipStyle.maxWidth = 300;
    }
  } else {
    tooltipStyle.top = "40%";
    tooltipStyle.left = 20;
    tooltipStyle.right = 20;
  }

  return (
    <div className="fixed inset-0 z-[80]" style={{ pointerEvents: "auto" }}>
      {/* Dark overlay with spotlight hole */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - 6}
                y={rect.top - 4}
                width={rect.width + 12}
                height={rect.height + 8}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#spotlight-mask)" />
      </svg>

      {/* Highlight border around target */}
      {rect && (
        <div
          className="absolute rounded-xl pointer-events-none"
          style={{
            left: rect.left - 6,
            top: rect.top - 4,
            width: rect.width + 12,
            height: rect.height + 8,
            border: "2px solid #6366F1",
            boxShadow: "0 0 0 4px rgba(99,102,241,0.2), 0 0 20px rgba(99,102,241,0.3)",
          }}
        />
      )}

      {/* Click anywhere to advance (except skip) */}
      <div className="absolute inset-0" onClick={handleNext} />

      {/* Tooltip */}
      <div className="absolute animate-fade-in" style={{ ...tooltipStyle, zIndex: 81, pointerEvents: "auto" }}>
        <div className="bg-white rounded-2xl p-4 shadow-xl" style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }}>
          {/* Arrow pointing to target */}
          {rect && step.arrow === "down" && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45" style={{ boxShadow: "2px 2px 4px rgba(0,0,0,0.05)" }} />
          )}
          {rect && step.arrow === "up" && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45" style={{ boxShadow: "-2px -2px 4px rgba(0,0,0,0.05)" }} />
          )}

          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-[15px] font-bold">{isEn ? step.titleEn : step.titleTh}</h4>
            <button onClick={(e) => { e.stopPropagation(); handleSkip(); }}
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--color-surface-3)" }}>
              <X size={12} strokeWidth={2} style={{ color: "var(--color-text-tertiary)" }} />
            </button>
          </div>
          <p className="text-[13px] mb-3" style={{ color: "var(--color-text-secondary)" }}>
            {isEn ? step.descEn : step.descTh}
          </p>

          <div className="flex items-center justify-between">
            {/* Progress */}
            <div className="flex gap-1">
              {allSteps.map((_, i) => (
                <div key={i} className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: i === globalIndex ? 14 : 5, background: i === globalIndex ? "#6366F1" : i < globalIndex ? "#6366F1" : "#E5E7EB", opacity: i <= globalIndex ? 1 : 0.4 }} />
              ))}
            </div>
            {/* Next */}
            <button onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white"
              style={{ background: isLast ? "#10B981" : "#6366F1" }}>
              {isLast ? (isEn ? "Done!" : "เสร็จ!") : (isEn ? "Next" : "ถัดไป")}
              {!isLast && <ChevronRight size={12} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
