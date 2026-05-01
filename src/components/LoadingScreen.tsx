"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/context";
import { Search, Route, Wand2, Sparkles } from "./Icons";
import { type LucideProps } from "lucide-react";
import { ComponentType } from "react";

const stepIcons: ComponentType<LucideProps>[] = [Search, Route, Wand2, Sparkles];

export default function LoadingScreen() {
  const { t } = useI18n();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % t.loadingSteps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [t.loadingSteps.length]);

  const StepIcon = stepIcons[step];

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 animate-fade-in">
      <div className="relative mb-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "#6366F108" }}
        >
          <div className="animate-bounce-soft">
            <StepIcon size={32} strokeWidth={1.5} style={{ color: "var(--color-primary)" }} />
          </div>
        </div>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: "2px solid var(--color-primary)",
            opacity: 0.15,
            animation: "pulse-ring 1.5s ease-out infinite",
          }}
        />
      </div>

      <h3 className="text-lg font-bold mb-2">{t.loadingTitle}</h3>
      <p className="text-sm text-center" style={{ color: "var(--color-text-secondary)" }}>
        {t.loadingSteps[step]}
      </p>

      <div className="flex gap-2 mt-8">
        {t.loadingSteps.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i === step ? "var(--color-primary)" : "var(--color-border)",
              transform: i === step ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
