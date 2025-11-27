import React, { createContext, useContext, useEffect, useState } from "react";

import { useSession } from "./session-context";
import { useTranslation } from "react-i18next";

import { useUpdateLanguage } from "~/hooks/use-user";

const LANGUAGE_STORAGE_KEY = "issho_language";

type LanguageCode = "en-US" | "zh-HK";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (
    language: LanguageCode,
    csrfToken?: string,
  ) => Promise<{ error: string | null }>;
  isUpdating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const { isLoggedIn, user } = useSession();
  const [language, setLanguageState] = useState<LanguageCode>("en-US");
  const updateLanguageMutation = useUpdateLanguage();

  // Initialize language on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      if (isLoggedIn && user) {
        // User is logged in - use language from user and store in localStorage
        const backendLanguage = user.languageCode as LanguageCode;
        localStorage.setItem(LANGUAGE_STORAGE_KEY, backendLanguage);
        setLanguageState(backendLanguage);
        await i18n.changeLanguage(backendLanguage);
      } else {
        // User is not logged in - use localStorage only
        const cachedLanguage =
          (localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode) ||
          "en-US";
        setLanguageState(cachedLanguage);
        await i18n.changeLanguage(cachedLanguage);
      }
    };

    initializeLanguage();
  }, [isLoggedIn, user, i18n]);

  const setLanguage = async (
    newLanguage: LanguageCode,
    csrfToken?: string,
  ): Promise<{ error: string | null }> => {
    try {
      // Update localStorage immediately
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      setLanguageState(newLanguage);
      await i18n.changeLanguage(newLanguage);

      // If logged in and csrf token provided, update backend
      if (isLoggedIn && csrfToken) {
        await updateLanguageMutation.mutateAsync({
          languageCode: newLanguage,
          csrfToken,
        });
      }

      return { error: null };
    } catch (error) {
      console.error("Error updating language:", error);
      return {
        error: error instanceof Error ? error.message : "An error occurred",
      };
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isUpdating: updateLanguageMutation.isPending,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
