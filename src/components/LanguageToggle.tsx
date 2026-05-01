"use client";

import { useI18n } from "@/i18n/context";

export default function LanguageToggle() {
  const { locale, toggleLocale } = useI18n();

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200"
      style={{
        background: "var(--color-surface-3)",
        color: "var(--color-text-secondary)",
      }}
      aria-label={locale === "th" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"}
    >
      <span className="text-[13px]">{locale === "th" ? "🇬🇧" : "🇹🇭"}</span>
      <span>{locale === "th" ? "EN" : "TH"}</span>
    </button>
  );
}
