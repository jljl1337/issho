import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useTranslation } from "react-i18next";

import DestructivePage from "~/components/pages/destructive-page";
import { useSession } from "~/contexts/session-context";
import { useSignOut } from "~/hooks/use-auth";
import { translateError } from "~/lib/db/common";

export default function Page() {
  const { t } = useTranslation();
  const { csrfToken, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();
  const signOutMutation = useSignOut();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  async function onSignOut() {
    if (!csrfToken) {
      return { error: t("user.noCsrfToken") };
    }
    try {
      await signOutMutation.mutateAsync(csrfToken);
      return { error: null };
    } catch (error) {
      return { error: translateError(error) };
    }
  }

  return (
    <>
      <title>{t("user.signOut")} | Issho</title>
      <DestructivePage
        title={t("user.signOut")}
        description={t("user.signOutConfirm")}
        action={onSignOut}
        redirectTo="/auth/sign-in"
      />
    </>
  );
}
