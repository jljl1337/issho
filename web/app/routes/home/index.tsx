import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useTranslation } from "react-i18next";

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
    <>
      <div className="h-full flex items-center justify-center">
        <div className="h-full max-w-[90rem] flex-1 flex flex-col p-8 gap-4">
          <h1 className="text-4xl">{t("home")}</h1>
        </div>
      </div>
    </>
  );
}
