import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { useTranslation } from "react-i18next";

import { HorizontallyCenteredPage } from "~/components/layouts/horizontally-centered-page";
import { MarkdownRenderer } from "~/components/markdown-renderer";
import { useSession } from "~/contexts/session-context";
import { usePost } from "~/hooks/use-posts";
import { ApiError } from "~/lib/db/common";

export default function Page() {
  const { t } = useTranslation("post");
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn, isLoading: sessionLoading } = useSession();
  const navigate = useNavigate();

  const { data: post, isLoading: postLoading, error } = usePost(id || "");

  useEffect(() => {
    if (!sessionLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, sessionLoading, navigate]);

  // Handle 404 errors when fetching the post
  useEffect(() => {
    if (error && error instanceof ApiError && error.code === "404") {
      navigate(-1);
    }
  }, [error, navigate]);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Issho`;
    }
  }, [post]);

  if (sessionLoading || postLoading) {
    return (
      <HorizontallyCenteredPage className="flex flex-col gap-4">
        <p className="text-muted-foreground">{t("loading")}</p>
      </HorizontallyCenteredPage>
    );
  }

  if (!post) {
    return (
      <HorizontallyCenteredPage className="flex flex-col gap-4">
        <p className="text-muted-foreground">{t("postNotFound")}</p>
      </HorizontallyCenteredPage>
    );
  }

  return (
    <HorizontallyCenteredPage className="flex flex-col gap-4">
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <MarkdownRenderer content={post.content || ""} />
      </article>
    </HorizontallyCenteredPage>
  );
}
