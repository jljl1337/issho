import { throwIfError, translateError } from "~/lib/db/common";
import { customFetch } from "~/lib/db/fetch";

export { translateError };

export type Post = {
  id: string;
  userID: string | null;
  title: string;
  description: string;
  content: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GetPostListParams = {
  orderBy?: string;
  ascending?: boolean;
  includeDrafts?: boolean;
  pageSize?: number;
  cursor?: string;
  cursorId?: string;
  searchQuery?: string;
  userId?: string;
};

export async function getPosts(params?: GetPostListParams): Promise<Post[]> {
  const searchParams = new URLSearchParams();

  if (params?.orderBy) {
    searchParams.set("order-by", params.orderBy);
  }
  if (params?.ascending !== undefined) {
    searchParams.set("ascending", params.ascending.toString());
  }
  if (params?.includeDrafts !== undefined) {
    searchParams.set("include-drafts", params.includeDrafts.toString());
  }
  if (params?.pageSize) {
    searchParams.set("page-size", params.pageSize.toString());
  }
  if (params?.cursor) {
    searchParams.set("cursor", params.cursor);
  }
  if (params?.cursorId) {
    searchParams.set("cursor-id", params.cursorId);
  }
  if (params?.searchQuery) {
    searchParams.set("search-query", params.searchQuery);
  }
  if (params?.userId) {
    searchParams.set("user-id", params.userId);
  }

  const queryString = searchParams.toString();
  const url = queryString ? `/api/posts?${queryString}` : "/api/posts";

  const response = await customFetch(url, "GET");
  await throwIfError(response);

  const data: Post[] = await response.json();
  return data;
}

export async function getPostById(id: string): Promise<Post> {
  const response = await customFetch(`/api/posts/${id}`, "GET");
  await throwIfError(response);

  const data: Post = await response.json();
  return data;
}

export type CreatePostParams = {
  title: string;
  description: string;
  content: string;
  publishedAt?: string | null;
};

export async function createPost(
  params: CreatePostParams,
  csrfToken: string,
): Promise<void> {
  const response = await customFetch("/api/posts", "POST", params, csrfToken);

  await throwIfError(response);
}

export type UpdatePostParams = {
  title: string;
  description: string;
  content: string;
  publishedAt?: string | null;
};

export async function updatePost(
  id: string,
  params: UpdatePostParams,
  csrfToken: string,
): Promise<void> {
  const response = await customFetch(
    `/api/posts/${id}`,
    "PUT",
    params,
    csrfToken,
  );

  await throwIfError(response);
}

export async function deletePost(id: string, csrfToken: string): Promise<void> {
  const response = await customFetch(
    `/api/posts/${id}`,
    "DELETE",
    undefined,
    csrfToken,
  );

  await throwIfError(response);
}
