import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslations from "./locales/en.json";
import taTranslations from "./locales/ta.json";

const savedLang = localStorage.getItem("marinZenLang") || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    ta: { translation: taTranslations },
  },
  lng: savedLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
