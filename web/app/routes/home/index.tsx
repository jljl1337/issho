import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useTranslation } from "react-i18next";

import { HorizontallyCenteredPage } from "~/components/layouts/horizontally-centered-page";
import { useSession } from "~/contexts/session-context";
import { isUser } from "~/lib/validation/role";

export default function Page() {
  const { t } = useTranslation("navigation");

  const { user, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }

    if (!isLoading && user && !isUser(user.role)) {
      navigate(-1);
    }
  }, [isLoggedIn, isLoading, user, navigate]);

  useEffect(() => {
    document.title = `${t("home")} | Issho`;
  }, [t]);

  return (
    <HorizontallyCenteredPage className="flex flex-col gap-4">
      <h1 className="text-4xl">{t("home")}</h1>
    </HorizontallyCenteredPage>
  );
}
