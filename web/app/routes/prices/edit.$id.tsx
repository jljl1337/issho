import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useTranslation } from "react-i18next";

import { PriceEditorPage } from "~/components/pages/price-editor-page";
import { useSession } from "~/contexts/session-context";
import { usePrice, useUpdatePrice } from "~/hooks/use-prices";
import { ApiError, translateError } from "~/lib/db/common";
import { isUser } from "~/lib/validation/role";

export default function Page() {
  const { t } = useTranslation("price");
  const { user, isLoggedIn, isLoading, csrfToken } = useSession();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    data: price,
    isLoading: priceLoading,
    error: priceError,
  } = usePrice(id || "");
  const updatePrice = useUpdatePrice();
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
    document.title = `${t("editPrice")} | Issho`;
  }, [t]);

  // Handle 404 errors when fetching the price
  useEffect(() => {
    if (
      priceError &&
      priceError instanceof ApiError &&
      priceError.code === "404"
    ) {
      navigate(-1);
    }
  }, [priceError, navigate]);

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
    if (!csrfToken || !id) {
      setErrorMessage(t("noCsrfToken"));
      return;
    }

    setErrorMessage(null);

    try {
      await updatePrice.mutateAsync({
        id,
        params: data,
        csrfToken,
      });
      navigate("/prices");
    } catch (error) {
      if (error instanceof ApiError && error.code === "404") {
        navigate(-1);
      } else {
        setErrorMessage(translateError(error));
      }
    }
  };

  if (isLoading || !isLoggedIn || priceLoading) {
    return null;
  }

  return (
    <PriceEditorPage
      mode="edit"
      initialData={price}
      onSave={handleSave}
      isLoading={updatePrice.isPending}
      errorMessage={errorMessage}
    />
  );
}
