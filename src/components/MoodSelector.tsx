"use client";

import { MoodOption } from "@/types";
import { useI18n } from "@/i18n/context";
import { moodIcons } from "./Icons";

interface MoodSelectorProps {
  moods: MoodOption[];
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function MoodSelector({
  moods,
  selected,
  onSelect,
}: MoodSelectorProps) {
  const { moods: moodT } = useI18n();

  return (
    <div className="grid grid-cols-3 gap-3">
      {moods.map((mood, i) => {
        const isSelected = selected === mood.id;
        const t = moodT[mood.id as keyof typeof moodT];
        const Icon = moodIcons[mood.id];
        return (
          <button
            key={mood.id}
            id={`mood-${mood.id}`}
            onClick={() => onSelect(mood.id)}
            className={`animate-fade-in-up delay-${i + 1}`}
            aria-pressed={isSelected}
          >
            <div
              className={`
                app-card flex flex-col items-center text-center p-4 relative overflow-hidden
                transition-all duration-200
              `}
              style={{
                ...(isSelected
                  ? {
                      outline: `2px solid ${mood.color}`,
                      outlineOffset: "-2px",
                      background: `${mood.color}06`,
                      borderColor: "transparent",
                    }
                  : {}),
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2"
                style={{ background: `${mood.color}10` }}
              >
                {Icon && (
                  <Icon
                    size={24}
                    strokeWidth={1.8}
                    style={{ color: mood.color }}
                  />
                )}
              </div>
              <span className="font-semibold text-sm leading-tight">
                {t?.label ?? mood.label}
              </span>
              <span
                className="text-[11px] mt-0.5 leading-tight"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {t?.description ?? mood.description}
              </span>
              {isSelected && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center animate-scale-in"
                  style={{ background: mood.color }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
