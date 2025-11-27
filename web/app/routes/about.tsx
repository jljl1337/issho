import { useEffect } from "react";
import { redirect, useNavigate } from "react-router";
import type { Route } from "./+types/about";

import { useTranslation } from "react-i18next";

import { useVersion } from "~/hooks/use-version";

export default function Page() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: version, isLoading, error } = useVersion();

  useEffect(() => {
    if (error) {
      navigate("/error");
    }
  }, [error, navigate]);

  useEffect(() => {
    document.title = `${t("navigation.about")} | Issho`;
  }, [t]);

  return (
    <>
      <div className="h-full flex items-center justify-center">
        <div className="h-full max-w-[90rem] flex-1 flex flex-col p-8 gap-4">
          <h1 className="text-4xl">{t("navigation.about")}</h1>
          <p className="mb-2">
            {t("navigation.version")}:{" "}
            {isLoading ? t("navigation.loading") : version}
          </p>
        </div>
      </div>
    </>
  );
}
