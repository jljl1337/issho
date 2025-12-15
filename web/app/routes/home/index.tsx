import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useTranslation } from "react-i18next";

import { HorizontallyCenteredPage } from "~/components/layouts/horizontally-centered-page";
import { useSession } from "~/contexts/session-context";

export default function Page() {
  const { t } = useTranslation("navigation");

  const { isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `${t("home")} | Issho`;
  }, [t]);

  return (
    <HorizontallyCenteredPage className="flex flex-col gap-4">
      <h1 className="text-4xl">{t("home")}</h1>
    </HorizontallyCenteredPage>
  );
}
