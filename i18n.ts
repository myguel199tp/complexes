// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationES from "./locales/es.json";
import translationEN from "./locales/en.json";
import translationPT from "./locales/pt.json";

i18n
  .use(initReactI18next) // pasa i18n a react-i18next
  .init({
    resources: {
      es: { translation: translationES },
      en: { translation: translationEN },
      pt: { translation: translationPT },
    },
    lng: "es", // idioma por defecto
    fallbackLng: "es",
    interpolation: { escapeValue: false },
  });

export default i18n;
