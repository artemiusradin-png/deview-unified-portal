"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Language = "en" | "zh-HK";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  isZh: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function applyDocumentLanguage(language: Language) {
  document.documentElement.lang = language;
  document.documentElement.dataset.lang = language;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("portalLanguage") === "zh-HK" ? "zh-HK" : "en";
  });

  useEffect(() => {
    applyDocumentLanguage(language);
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    localStorage.setItem("portalLanguage", next);
    applyDocumentLanguage(next);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === "en" ? "zh-HK" : "en"),
      isZh: language === "zh-HK",
    }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return value;
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-white p-0.5 text-[11px] font-medium shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`rounded-full px-2 py-1 transition-colors ${
          language === "en"
            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("zh-HK")}
        aria-pressed={language === "zh-HK"}
        className={`rounded-full px-2 py-1 transition-colors ${
          language === "zh-HK"
            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        }`}
      >
        繁
      </button>
    </div>
  );
}

export function langText<T>(isZh: boolean, en: T, zh: T) {
  return isZh ? zh : en;
}
