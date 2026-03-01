// hooks/useLanguage.ts
import i18n from "@/i18n";
import { useState, useEffect } from "react";

export const SUPPORTED_LANGUAGES = ["es", "en", "pt"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

function isLanguage(value: string): value is Language {
  return SUPPORTED_LANGUAGES.includes(value as Language);
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("language");
      if (stored && isLanguage(stored)) return stored;
    }

    const current = i18n.language;
    return isLanguage(current) ? current : "es";
  });

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);

    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
    }

    setLanguage(lang);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedLang = localStorage.getItem("language");

    if (savedLang && isLanguage(savedLang)) {
      i18n.changeLanguage(savedLang);
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    const handleChange = (lng: string) => {
      if (isLanguage(lng)) {
        setLanguage(lng);
      }
    };

    i18n.on("languageChanged", handleChange);
    return () => {
      i18n.off("languageChanged", handleChange);
    };
  }, []);

  return { language, changeLanguage };
}
