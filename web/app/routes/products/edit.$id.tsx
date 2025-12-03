import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { useTranslation } from "react-i18next";

import { VerticallyCenterPage } from "~/components/pages/vertically-center-page";
import { useSession } from "~/contexts/session-context";
import { useProduct } from "~/hooks/use-products";
import { ApiError } from "~/lib/db/common";
import { isUser } from "~/lib/validation/role";

export default function Page() {
  const { t } = useTranslation("product");
  const { user, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useProduct(id || "");

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

  if (productLoading) {
    return (
      <VerticallyCenterPage className="flex flex-col gap-4">
        <p className="text-muted-foreground">{t("loading")}</p>
      </VerticallyCenterPage>
    );
  }

  return (
    <VerticallyCenterPage className="flex flex-col gap-4">
      <h1 className="text-4xl">{t("editProduct")}</h1>
      {product && (
        <div className="text-muted-foreground">
          <p>Editing product: {product.name}</p>
          <p className="text-sm">Product edit page - Coming soon</p>
        </div>
      )}
    </VerticallyCenterPage>
  );
}
