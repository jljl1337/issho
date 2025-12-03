import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { useTranslation } from "react-i18next";

import { ProductEditorPage } from "~/components/pages/product-editor-page";
import { useSession } from "~/contexts/session-context";
import { useCreateProduct } from "~/hooks/use-products";
import { translateError } from "~/lib/db/products";
import { isUser } from "~/lib/validation/role";

export default function Page() {
  const { t } = useTranslation("product");
  const { user, isLoggedIn, isLoading, csrfToken } = useSession();
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
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
    document.title = `${t("createProduct")} | Issho`;
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
      await createProduct.mutateAsync({
        params: data,
        csrfToken,
      });
      navigate("/products");
    } catch (error) {
      setErrorMessage(translateError(error));
    }
  };

  if (isLoading || !isLoggedIn) {
    return null;
  }

  return (
    <ProductEditorPage
      mode="create"
      onSave={handleSave}
      isLoading={createProduct.isPending}
      errorMessage={errorMessage}
    />
  );
}
