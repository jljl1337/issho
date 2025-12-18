import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { useTranslation } from "react-i18next";

import DestructivePage from "~/components/pages/destructive-page";
import { useSession } from "~/contexts/session-context";
import { useDeletePost, usePost } from "~/hooks/use-posts";
import { ApiError, translateError } from "~/lib/db/common";
import { isUser } from "~/lib/validation/role";

export default function Page() {
  const { t } = useTranslation("post");
  const { user, isLoggedIn, isLoading, csrfToken } = useSession();
  const navigate = useNavigate();
  const { id } = useParams();
  const deletePostMutation = useDeletePost();
  const { data: post, isLoading: postLoading, error } = usePost(id || "");

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }

    if (!isLoading && user && isUser(user.role)) {
      navigate(-1);
    }
  }, [user, isLoggedIn, isLoading, navigate]);

  // Handle 404 errors when fetching the post
  useEffect(() => {
    if (error && error instanceof ApiError && error.code === "404") {
      navigate(-1);
    }
  }, [error, navigate]);

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
        redirectTo="/admin/posts"
      />
    </>
  );
}
