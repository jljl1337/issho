import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError, isUnauthorizedError } from "~/lib/db/common";
import {
  confirmEmailVerification as confirmEmailVerificationApi,
  deleteMe as deleteMeApi,
  getMe,
  requestEmailVerification as requestEmailVerificationApi,
  updateEmail as updateEmailApi,
  updateLanguage as updateLanguageApi,
  updatePassword as updatePasswordApi,
  updateUsername as updateUsernameApi,
  type User,
} from "~/lib/db/users";
import { queryKeys } from "~/lib/react-query/query-keys";

/**
 * Query hook to fetch the current user
 */
export function useMe(enabled = true) {
  return useQuery<User | null>({
    queryKey: queryKeys.users.me(),
    queryFn: async () => {
      try {
        return await getMe();
      } catch (error) {
        // If unauthorized, return null instead of throwing
        if (error instanceof ApiError && isUnauthorizedError(error)) {
          return null;
        }
        throw error;
      }
    },
    enabled,
  });
}

/**
 * Mutation hook to update username
 */
export function useUpdateUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      newUsername,
      csrfToken,
    }: {
      newUsername: string;
      csrfToken: string;
    }) => {
      await updateUsernameApi(newUsername, csrfToken);
    },
    onSuccess: () => {
      // Invalidate user query to refetch updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}

/**
 * Mutation hook to update email
 */
export function useUpdateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      newEmail,
      csrfToken,
    }: {
      newEmail: string;
      csrfToken: string;
    }) => {
      await updateEmailApi(newEmail, csrfToken);
    },
    onSuccess: () => {
      // Invalidate user query to refetch updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}

/**
 * Mutation hook to update password
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: async ({
      oldPassword,
      newPassword,
      csrfToken,
    }: {
      oldPassword: string;
      newPassword: string;
      csrfToken: string;
    }) => {
      await updatePasswordApi(oldPassword, newPassword, csrfToken);
    },
  });
}

/**
 * Mutation hook to update language
 */
export function useUpdateLanguage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      languageCode,
      csrfToken,
    }: {
      languageCode: string;
      csrfToken: string;
    }) => {
      await updateLanguageApi(languageCode, csrfToken);
    },
    onSuccess: () => {
      // Invalidate user query to refetch updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}

/**
 * Mutation hook to delete the current user account
 */
export function useDeleteMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (csrfToken: string) => deleteMeApi(csrfToken),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
}

/**
 * Mutation hook to request email verification
 */
export function useRequestEmailVerification() {
  return useMutation({
    mutationFn: (csrfToken: string) => requestEmailVerificationApi(csrfToken),
  });
}

/**
 * Mutation hook to confirm email verification with code
 */
export function useConfirmEmailVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      code,
      csrfToken,
    }: {
      code: string;
      csrfToken: string;
    }) => {
      await confirmEmailVerificationApi(code, csrfToken);
    },
    onSuccess: () => {
      // Invalidate user query to refetch updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}
