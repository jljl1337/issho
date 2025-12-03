import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useTranslation } from "react-i18next";

import { VerticallyCenterPage } from "~/components/pages/vertically-center-page";
import { useSession } from "~/contexts/session-context";
import { isUser } from "~/lib/validation/role";

export default function Page() {
  const { t } = useTranslation("product");
  const { user, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }

    if (!isLoading && user && isUser(user.role)) {
      navigate("/");
    }
  }, [user, isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `${t("createProduct")} | Issho`;
  }, [t]);

  return (
    <VerticallyCenterPage className="flex flex-col gap-4">
      <h1 className="text-4xl">{t("createProduct")}</h1>
      <p className="text-muted-foreground">
        Product creation page - Coming soon
      </p>
    </VerticallyCenterPage>
  );
}
