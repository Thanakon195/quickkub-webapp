import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en/translation.json";
import th from "../locales/th/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    th: { translation: th },
    en: { translation: en },
  },
  lng: "th",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
