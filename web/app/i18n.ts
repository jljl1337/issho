import enAuth from "./locales/en-US/auth.json";
// English translations
import enCommon from "./locales/en-US/common.json";
import enError from "./locales/en-US/error.json";
import enMessages from "./locales/en-US/messages.json";
import enNavigation from "./locales/en-US/navigation.json";
import enPost from "./locales/en-US/post.json";
import enSidebar from "./locales/en-US/sidebar.json";
import enUser from "./locales/en-US/user.json";
import enValidation from "./locales/en-US/validation.json";
import zhAuth from "./locales/zh-HK/auth.json";
// Chinese (Hong Kong) translations
import zhCommon from "./locales/zh-HK/common.json";
import zhError from "./locales/zh-HK/error.json";
import zhMessages from "./locales/zh-HK/messages.json";
import zhNavigation from "./locales/zh-HK/navigation.json";
import zhPost from "./locales/zh-HK/post.json";
import zhSidebar from "./locales/zh-HK/sidebar.json";
import zhUser from "./locales/zh-HK/user.json";
import zhValidation from "./locales/zh-HK/validation.json";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  "en-US": {
    common: enCommon,
    auth: enAuth,
    user: enUser,
    navigation: enNavigation,
    error: enError,
    validation: enValidation,
    sidebar: enSidebar,
    messages: enMessages,
    post: enPost,
  },
  "zh-HK": {
    common: zhCommon,
    auth: zhAuth,
    user: zhUser,
    navigation: zhNavigation,
    error: zhError,
    validation: zhValidation,
    sidebar: zhSidebar,
    messages: zhMessages,
    post: zhPost,
  },
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
