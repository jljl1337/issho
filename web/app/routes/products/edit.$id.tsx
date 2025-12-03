import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useTranslation } from "react-i18next";

import { ProductEditorPage } from "~/components/pages/product-editor-page";
import { useSession } from "~/contexts/session-context";
import { useProduct, useUpdateProduct } from "~/hooks/use-products";
import { ApiError, translateError } from "~/lib/db/common";
import { isUser } from "~/lib/validation/role";

export default function Page() {
  const { t } = useTranslation("product");
  const { user, isLoggedIn, isLoading, csrfToken } = useSession();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useProduct(id || "");
  const updateProduct = useUpdateProduct();
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
    document.title = `${t("editProduct")} | Issho`;
  }, [t]);

  // Handle 404 errors when fetching the product
  useEffect(() => {
    if (
      productError &&
      productError instanceof ApiError &&
      productError.code === "404"
    ) {
      navigate(-1);
    }
  }, [productError, navigate]);

  const handleSave = async (data: {
    name: string;
    description: string;
    isActive: boolean;
  }) => {
    if (!csrfToken || !id) {
      setErrorMessage(t("noCsrfToken"));
      return;
    }

    setErrorMessage(null);

    try {
      await updateProduct.mutateAsync({
        id,
        params: data,
        csrfToken,
      });
      navigate("/products");
    } catch (error) {
      if (error instanceof ApiError && error.code === "404") {
        navigate(-1);
      } else {
        setErrorMessage(translateError(error));
      }
    }
  };

  if (isLoading || !isLoggedIn || productLoading) {
    return null;
  }

  return (
    <ProductEditorPage
      mode="edit"
      initialData={product}
      onSave={handleSave}
      isLoading={updateProduct.isPending}
      errorMessage={errorMessage}
    />
  );
}
