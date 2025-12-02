import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { useTranslation } from "react-i18next";

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
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">{t("postNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="h-full max-w-[90rem] min-w-0 flex-1 flex flex-col p-8 gap-4">
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <MarkdownRenderer content={post.content || ""} />
        </article>
      </div>
    </div>
  );
}
