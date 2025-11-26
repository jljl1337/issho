import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPreSession,
  getCsrfToken,
  signIn as signInApi,
  signOutAll as signOutAllApi,
  signOut as signOutApi,
  signUp as signUpApi,
} from "~/lib/db/auth";
import { queryKeys } from "~/lib/react-query/query-keys";

/**
 * Query hook to fetch CSRF token
 */
export function useCsrfToken(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.csrfToken(),
    queryFn: () => getCsrfToken(),
    enabled,
  });
}

/**
 * Mutation hook to create a pre-session and get CSRF token
 */
export function usePreSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createPreSession(),
    onSuccess: (csrfToken) => {
      // Update the CSRF token in the cache
      queryClient.setQueryData(queryKeys.auth.csrfToken(), csrfToken);
    },
  });
}

/**
 * Mutation hook to sign up a new user
 */
export function useSignUp() {
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      await signUpApi(username, password);
    },
  });
}

/**
 * Mutation hook to sign in a user
 */
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      username,
      password,
      csrfToken,
    }: {
      username: string;
      password: string;
      csrfToken: string;
    }) => {
      await signInApi(username, password, csrfToken);
    },
    onSuccess: () => {
      // Invalidate user and CSRF token queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.csrfToken() });
    },
  });
}

/**
 * Mutation hook to sign out the current session
 */
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (csrfToken: string) => signOutApi(csrfToken),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
}

/**
 * Mutation hook to sign out all sessions
 */
export function useSignOutAll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (csrfToken: string) => signOutAllApi(csrfToken),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
}
