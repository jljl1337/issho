import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { useTranslation } from "react-i18next";

import { ConfirmTokenPage } from "~/components/pages/confirm-token-page";
import { useSession } from "~/contexts/session-context";
import { useConfirmEmailVerification } from "~/hooks/use-user";
import { translateError } from "~/lib/db/common";

export default function Page() {
  const { t } = useTranslation(["user", "auth", "common", "validation"]);
  const { isLoggedIn, isLoading, csrfToken } = useSession();
  const navigate = useNavigate();
  const confirmEmailVerification = useConfirmEmailVerification();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `${t("confirmEmailVerification")} | Issho`;
  }, [t]);

  async function handleSubmit(code: string) {
    if (!csrfToken) {
      setError("No CSRF token available");
      return;
    }

    try {
      await confirmEmailVerification.mutateAsync({
        code,
        csrfToken,
      });
      navigate("/account");
    } catch (error) {
      const translatedError = translateError(error);
      setError(translatedError);
    }
  }

  return (
    <ConfirmTokenPage
      title={t("confirmEmailVerification")}
      description={t("confirmEmailVerificationDesc")}
      onSubmit={handleSubmit}
      isSubmitting={confirmEmailVerification.isPending}
      error={error}
    />
  );
}
