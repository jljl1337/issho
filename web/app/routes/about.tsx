import { useEffect } from "react";
import { redirect, useNavigate } from "react-router";
import type { Route } from "./+types/about";

import { useTranslation } from "react-i18next";

import { HorizontallyCenteredPage } from "~/components/layouts/horizontally-centered-page";
import { useVersion } from "~/hooks/use-version";

export default function Page() {
  const { t } = useTranslation("navigation");
  const navigate = useNavigate();
  const { data: version, isLoading, error } = useVersion();

  useEffect(() => {
    if (error) {
      navigate("/error");
    }
  }, [error, navigate]);

  useEffect(() => {
    document.title = `${t("about")} | Issho`;
  }, [t]);

  return (
    <HorizontallyCenteredPage className="flex flex-col gap-4">
      <h1 className="text-4xl">{t("about")}</h1>
      <p className="mb-2">
        {t("version")}: {isLoading ? t("loading") : version}
      </p>
    </HorizontallyCenteredPage>
  );
}
