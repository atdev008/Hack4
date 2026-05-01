"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Locale, translations, moodTranslations, transportTranslations, provinceTranslations } from "./translations";

type Translations = (typeof translations)["th"] | (typeof translations)["en"];
type MoodTranslations = (typeof moodTranslations)["th"] | (typeof moodTranslations)["en"];
type TransportTranslations = (typeof transportTranslations)["th"] | (typeof transportTranslations)["en"];

interface I18nContextType {
  locale: Locale;
  t: Translations;
  moods: MoodTranslations;
  transports: TransportTranslations;
  provinces: readonly string[];
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("th");

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === "th" ? "en" : "th"));
  }, []);

  const value: I18nContextType = {
    locale,
    t: translations[locale],
    moods: moodTranslations[locale],
    transports: transportTranslations[locale],
    provinces: provinceTranslations[locale],
    toggleLocale,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
