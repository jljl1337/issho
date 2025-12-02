import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { PostEditorPage } from "~/components/pages/post-editor-page";
import { useSession } from "~/contexts/session-context";
import { useCreatePost } from "~/hooks/use-posts";
import { translateError } from "~/lib/db/common";

export default function Page() {
  const { isLoggedIn, isLoading, csrfToken } = useSession();
  const navigate = useNavigate();
  const createPost = useCreatePost();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `Create Post | Issho`;
  }, []);

  const handleSave = async (data: {
    title: string;
    description: string;
    content: string;
    publishedAt: string | null;
  }) => {
    if (!csrfToken) {
      setErrorMessage("No CSRF token available");
      return;
    }

    setErrorMessage(null);

    try {
      await createPost.mutateAsync({
        params: data,
        csrfToken,
      });
      navigate("/posts");
    } catch (error) {
      setErrorMessage(translateError(error));
    }
  };

  if (isLoading || !isLoggedIn) {
    return null;
  }

  return (
    <PostEditorPage
      onSave={handleSave}
      isLoading={createPost.isPending}
      errorMessage={errorMessage}
    />
  );
}
