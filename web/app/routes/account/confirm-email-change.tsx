import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { useTranslation } from "react-i18next";

import { ConfirmTokenForm } from "~/components/confirm-token-form";
import { useSession } from "~/contexts/session-context";
import { useConfirmEmailChange } from "~/hooks/use-user";
import { translateError } from "~/lib/db/common";

export default function Page() {
  const { t } = useTranslation(["user", "auth", "common", "validation"]);
  const { isLoggedIn, isLoading, csrfToken } = useSession();
  const navigate = useNavigate();
  const confirmEmailChange = useConfirmEmailChange();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `${t("confirmEmailChange")} | Issho`;
  }, [t]);

  async function handleSubmit(code: string) {
    if (!csrfToken) {
      setError("No CSRF token available");
      return;
    }

    try {
      await confirmEmailChange.mutateAsync({
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
    <ConfirmTokenForm
      title={t("confirmEmailChange")}
      description={t("confirmEmailChangeDesc")}
      onSubmit={handleSubmit}
      isSubmitting={confirmEmailChange.isPending}
      error={error}
    />
  );
}
