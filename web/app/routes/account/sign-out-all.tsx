import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useTranslation } from "react-i18next";

import DestructivePage from "~/components/pages/destructive-page";
import { useSession } from "~/contexts/session-context";
import { useSignOutAll } from "~/hooks/use-auth";
import { translateError } from "~/lib/db/common";

export default function Page() {
  const { t } = useTranslation();
  const { csrfToken, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();
  const signOutAllMutation = useSignOutAll();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `${t("user.signOutAll")} | Issho`;
  }, [t]);

  async function onSignOutAll() {
    if (!csrfToken) {
      return { error: t("user.noCsrfToken") };
    }
    try {
      await signOutAllMutation.mutateAsync(csrfToken);
      return { error: null };
    } catch (error) {
      return { error: translateError(error) };
    }
  }

  return (
    <>
      <DestructivePage
        title={t("user.signOutAll")}
        description={t("user.signOutAllConfirm")}
        action={onSignOutAll}
        redirectTo="/auth/sign-in"
      />
    </>
  );
}
