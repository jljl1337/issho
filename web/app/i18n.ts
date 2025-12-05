import enUS from "./locales/en-US";
import zhHK from "./locales/zh-HK";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  "en-US": enUS,
  "zh-HK": zhHK,
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en-US", // default language
  fallbackLng: "en-US",
  defaultNS: "common",
  ns: [
    "common",
    "auth",
    "user",
    "navigation",
    "error",
    "validation",
    "sidebar",
    "messages",
    "post",
  ],
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
