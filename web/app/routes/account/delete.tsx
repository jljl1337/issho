import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useTranslation } from "react-i18next";

import DestructivePage from "~/components/pages/destructive-page";
import { useSession } from "~/contexts/session-context";
import { useDeleteMe } from "~/hooks/use-user";
import { translateError } from "~/lib/db/common";

export default function Page() {
  const { t } = useTranslation("user");
  const { csrfToken, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();
  const deleteMeMutation = useDeleteMe();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `${t("deleteAccount")} | Issho`;
  }, [t]);

  async function onDeleteAccount() {
    if (!csrfToken) {
      return { error: t("noCsrfToken") };
    }
    try {
      await deleteMeMutation.mutateAsync(csrfToken);
      return { error: null };
    } catch (error) {
      return { error: translateError(error) };
    }
  }

  return (
    <>
      <DestructivePage
        title={t("deleteAccount")}
        description={t("deleteAccountConfirm")}
        action={onDeleteAccount}
        redirectTo="/auth/sign-in"
      />
    </>
  );
}
