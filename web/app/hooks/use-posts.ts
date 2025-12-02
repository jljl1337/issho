import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPost as createPostApi,
  deletePost as deletePostApi,
  getPostById,
  getPosts,
  updatePost as updatePostApi,
  type CreatePostParams,
  type GetPostListParams,
  type UpdatePostParams,
} from "~/lib/db/posts";
import { queryKeys } from "~/lib/react-query/query-keys";

/**
 * Query hook to fetch posts list
 */
export function usePosts(params?: GetPostListParams) {
  return useQuery({
    queryKey: queryKeys.posts(params),
    queryFn: () => getPosts(params),
  });
}

/**
 * Query hook to fetch a single post by ID
 */
export function usePost(id: string) {
  return useQuery({
    queryKey: queryKeys.post(id),
    queryFn: () => getPostById(id),
    enabled: !!id,
  });
}

/**
 * Mutation hook to create a post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      params,
      csrfToken,
    }: {
      params: CreatePostParams;
      csrfToken: string;
    }) => createPostApi(params, csrfToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

/**
 * Mutation hook to update a post
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      params,
      csrfToken,
    }: {
      id: string;
      params: UpdatePostParams;
      csrfToken: string;
    }) => updatePostApi(id, params, csrfToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

/**
 * Mutation hook to delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, csrfToken }: { id: string; csrfToken: string }) =>
      deletePostApi(id, csrfToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
