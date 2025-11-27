import enUS from "./locales/en-US.json";
import zhHK from "./locales/zh-HK.json";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  "en-US": {
    translation: enUS,
  },
  "zh-HK": {
    translation: zhHK,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en-US", // default language
  fallbackLng: "en-US",
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
