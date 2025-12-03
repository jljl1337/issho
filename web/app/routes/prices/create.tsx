import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { useTranslation } from "react-i18next";

import { PriceEditorPage } from "~/components/pages/price-editor-page";
import { useSession } from "~/contexts/session-context";
import { useCreatePrice } from "~/hooks/use-prices";
import { translateError } from "~/lib/db/prices";
import { isUser } from "~/lib/validation/role";

export default function Page() {
  const { t } = useTranslation("price");
  const { user, isLoggedIn, isLoading, csrfToken } = useSession();
  const navigate = useNavigate();
  const createPrice = useCreatePrice();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }

    if (!isLoading && user && isUser(user.role)) {
      navigate("/");
    }
  }, [user, isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `${t("createPrice")} | Issho`;
  }, [t]);

  const handleSave = async (data: {
    name: string;
    description: string;
    priceAmount: number;
    priceCurrency: string;
    isRecurring: boolean;
    recurringInterval: string | null;
    recurringIntervalCount: number | null;
    isActive: boolean;
  }) => {
    if (!csrfToken) {
      setErrorMessage(t("noCsrfToken"));
      return;
    }

    setErrorMessage(null);

    try {
      await createPrice.mutateAsync({
        params: data,
        csrfToken,
      });
      navigate("/prices");
    } catch (error) {
      setErrorMessage(translateError(error));
    }
  };

  if (isLoading || !isLoggedIn) {
    return null;
  }

  return (
    <PriceEditorPage
      mode="create"
      onSave={handleSave}
      isLoading={createPrice.isPending}
      errorMessage={errorMessage}
    />
  );
}
