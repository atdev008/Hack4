"use client";

import { useI18n } from "@/i18n/context";
import { Home, Map, List, User } from "lucide-react";
import { type ReactNode } from "react";

type Tab = "home" | "trips" | "list" | "profile";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  centerButton: ReactNode;
  centerLabel?: string;
  showCenter: boolean;
  expanded: boolean; // when true, nav tabs hide and center button expands full width
}

export default function BottomNav({
  activeTab,
  onTabChange,
  centerButton,
  centerLabel,
  showCenter,
  expanded,
}: BottomNavProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  const tabs: { id: Tab; icon: typeof Home; label: string }[] = [
    { id: "home", icon: Home, label: isEn ? "Home" : "หน้าแรก" },
    { id: "trips", icon: Map, label: isEn ? "Trips" : "ทริป" },
    { id: "list", icon: List, label: isEn ? "Completed" : "สำเร็จ" },
    { id: "profile", icon: User, label: isEn ? "Profile" : "โปรไฟล์" },
  ];

  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{
        background: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderTop: "1px solid rgba(0, 0, 0, 0.06)",
      }}
    >
      <div className="max-w-lg mx-auto px-3">
        {/* Expanded mode: full-width CTA */}
        {expanded && showCenter ? (
          <div className="py-3 animate-fade-in">
            <div className="flex items-center gap-3">
              {/* Center action as full-width pill */}
              <div className="flex-1">{centerButton}</div>
            </div>
          </div>
        ) : (
          /* Normal mode: tabs with center FAB */
          <div className="flex items-end justify-around">
            {leftTabs.map((tab) => (
              <NavItem
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={() => onTabChange(tab.id)}
              />
            ))}

            {/* Center FAB */}
            <div className="flex flex-col items-center px-1" style={{ marginTop: "-28px" }}>
              {showCenter ? (
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: "rgba(245, 158, 11, 0.15)",
                      filter: "blur(10px)",
                      transform: "scale(1.3)",
                    }}
                  />
                  <div className="relative z-10">
                    {centerButton}
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16" />
              )}
            </div>

            {rightTabs.map((tab) => (
              <NavItem
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={() => onTabChange(tab.id)}
              />
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Home;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center py-2 px-3 min-w-[56px] transition-all duration-200"
    >
      <Icon
        size={22}
        strokeWidth={active ? 2.2 : 1.6}
        style={{
          color: active ? "var(--color-primary)" : "var(--color-text-tertiary)",
          transition: "color 0.2s",
        }}
      />
      <span
        className="text-[10px] mt-0.5 font-medium transition-colors duration-200"
        style={{ color: active ? "var(--color-primary)" : "var(--color-text-tertiary)" }}
      >
        {label}
      </span>
    </button>
  );
}

export type { Tab };
