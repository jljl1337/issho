import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { useTranslation } from "react-i18next";

import DestructivePage from "~/components/pages/destructive-page";
import { useSession } from "~/contexts/session-context";
import { useDeletePost } from "~/hooks/use-posts";
import { translateError } from "~/lib/db/common";

export default function Page() {
  const { t } = useTranslation("post");
  const { csrfToken, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();
  const { id } = useParams();
  const deletePostMutation = useDeletePost();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `${t("deletePost")} | Issho`;
  }, [t]);

  async function onDeletePost() {
    if (!csrfToken) {
      return { error: t("noCsrfToken") };
    }
    if (!id) {
      return { error: "Post ID is required" };
    }
    try {
      await deletePostMutation.mutateAsync({ id, csrfToken });
      return { error: null };
    } catch (error) {
      return { error: translateError(error) };
    }
  }

  return (
    <>
      <DestructivePage
        title={t("deletePost")}
        description={t("deletePostConfirm")}
        action={onDeletePost}
        redirectTo="/posts"
      />
    </>
  );
}
