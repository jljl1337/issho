import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import type { ColumnDef } from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";

import { HorizontallyCenteredPage } from "~/components/layouts/horizontally-centered-page";
import { DataTable } from "~/components/tables/data-table";
import TableRowDropdown from "~/components/tables/dropdown";
import { useLanguage } from "~/contexts/language-context";
import { useSession } from "~/contexts/session-context";
import { usePosts } from "~/hooks/use-posts";
import { type Post } from "~/lib/db/posts";
import { formatDate, formatDateTime } from "~/lib/format/date";

export default function Page() {
  const { t } = useTranslation("post");
  const { t: tNav } = useTranslation("navigation");
  const { language } = useLanguage();

  const { isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();

  // Store all loaded posts
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorId, setCursorId] = useState<string | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `${tNav("posts")} | Issho`;
  }, [tNav]);

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = usePosts({
    orderBy: "updated_at",
    ascending: false,
    includeAll: true,
    pageSize: 20,
    cursor,
    cursorId,
  });

  // Update allPosts when new posts are fetched
  useEffect(() => {
    if (posts.length > 0 && !postsLoading) {
      setAllPosts((prev) => {
        // If cursor is undefined, this is the first load
        if (!cursor && !cursorId) {
          return posts;
        }
        // Otherwise, append new posts
        const existingIds = new Set(prev.map((p) => p.id));
        const newPosts = posts.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newPosts];
      });
      setIsLoadingMore(false);
    }
  }, [posts, postsLoading, cursor, cursorId]);

  // Check if we have more posts to load
  const hasMorePosts = posts.length === 20;

  // Handle load more
  const handleLoadMore = () => {
    if (!hasMorePosts || allPosts.length === 0) return;
    setIsLoadingMore(true);
    const lastPost = allPosts[allPosts.length - 1];
    setCursor(lastPost.updatedAt || "");
    setCursorId(lastPost.id);
  };

  // Define table columns
  const columns: ColumnDef<Post>[] = [
    {
      accessorKey: "title",
      header: t("title"),
      cell: ({ row }) => {
        const post = row.original;
        return (
          <Link
            to={`/posts/${post.id}`}
            className="font-medium hover:underline"
          >
            {post.title}
          </Link>
        );
      },
    },
    {
      accessorKey: "description",
      header: t("description"),
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-md truncate text-muted-foreground">
            {description}
          </div>
        );
      },
    },
    {
      accessorKey: "publishedAt",
      header: t("status"),
      cell: ({ row }) => {
        const publishedAt = row.getValue("publishedAt") as string | null;
        if (!publishedAt) {
          return <span className="text-muted-foreground">{t("draft")}</span>;
        }
        const date = new Date(publishedAt);
        const now = new Date();
        if (date > now) {
          return (
            <span className="text-muted-foreground">
              {t("scheduled")} ({formatDate(date, language)})
            </span>
          );
        }
        return (
          <span>
            {t("published")} ({formatDate(date, language)})
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: t("createdAt"),
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        const date = new Date(createdAt);
        return (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(date, language)}
          </span>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: t("updatedAt"),
      cell: ({ row }) => {
        const updatedAt = row.getValue("updatedAt") as string;
        const date = new Date(updatedAt);
        return (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(date, language)}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const post = row.original;
        return (
          <div className="text-right">
            <TableRowDropdown
              editUrl={`/admin/posts/${post.id}/edit`}
              deleteUrl={`/admin/posts/${post.id}/delete`}
            />
          </div>
        );
      },
    },
  ];

  return (
    <HorizontallyCenteredPage className="flex flex-col gap-4">
      <h1 className="text-4xl">{t("posts")}</h1>
      <div>
        <Button asChild>
          <Link to="/admin/posts/create">
            <PlusIcon className="mr-2 h-4 w-4" />
            {t("createPost")}
          </Link>
        </Button>
      </div>

      {postsLoading && allPosts.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t("loadingPosts")}</p>
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={allPosts} />

          {hasMorePosts && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="cursor-pointer"
              >
                {isLoadingMore ? t("loading") : t("loadMore")}
              </Button>
            </div>
          )}
        </>
      )}
    </HorizontallyCenteredPage>
  );
}
