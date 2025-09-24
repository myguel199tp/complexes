// hooks/useLanguage.ts
import i18n from "@/i18n";
import { useState, useEffect } from "react";

export function useLanguage() {
  const [language, setLanguage] = useState(i18n.language || "es");

  const changeLanguage = (lang: "es" | "en" | "pt") => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    setLanguage(lang);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as "es" | "en" | "pt";
    if (savedLang) {
      changeLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    const handleChange = (lng: string) => setLanguage(lng);
    i18n.on("languageChanged", handleChange);
    return () => i18n.off("languageChanged", handleChange);
  }, []);

  return { language, changeLanguage };
}
