import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { PostEditorPage } from "~/components/pages/post-editor-page";
import { useSession } from "~/contexts/session-context";
import { usePost, useUpdatePost } from "~/hooks/use-posts";
import { ApiError, translateError } from "~/lib/db/common";
import { isUser as isUserRole } from "~/lib/validation/role";

export default function Page() {
  const {
    user,
    isLoggedIn,
    isLoading: sessionLoading,
    csrfToken,
  } = useSession();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    data: post,
    isLoading: postLoading,
    error: postError,
  } = usePost(id || "");
  const updatePost = useUpdatePost();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }

    if (!sessionLoading && user && isUserRole(user.role)) {
      navigate(-1);
    }
  }, [user, isLoggedIn, sessionLoading, navigate]);

  useEffect(() => {
    document.title = `Edit Post | Issho`;
  }, []);

  // Handle 404 errors when fetching the post
  useEffect(() => {
    if (
      postError &&
      postError instanceof ApiError &&
      postError.code === "404"
    ) {
      navigate(-1);
    }
  }, [postError, navigate]);

  const handleSave = async (data: {
    title: string;
    description: string;
    content: string;
    publishedAt: string | null;
  }) => {
    if (!csrfToken || !id) {
      setErrorMessage("No CSRF token or post ID available");
      return;
    }

    setErrorMessage(null);

    try {
      await updatePost.mutateAsync({
        id,
        params: data,
        csrfToken,
      });
      navigate("/posts");
    } catch (error) {
      if (error instanceof ApiError && error.code === "404") {
        navigate(-1);
      } else {
        setErrorMessage(translateError(error));
      }
    }
  };

  if (sessionLoading || !isLoggedIn || postLoading) {
    return null;
  }

  return (
    <PostEditorPage
      initialData={post}
      onSave={handleSave}
      isLoading={updatePost.isPending}
      errorMessage={errorMessage}
    />
  );
}
