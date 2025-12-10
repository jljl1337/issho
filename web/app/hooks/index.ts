/**
 * Re-export all React Query hooks for easier imports
 */

// Auth hooks
export {
  useCsrfToken,
  usePreSession,
  useSignUp,
  useSignIn,
  useSignOut,
  useSignOutAll,
} from "./use-auth";

// User hooks
export {
  useMe,
  useUpdateUsername,
  useUpdatePassword,
  useDeleteMe,
  useRequestEmailVerification,
  useConfirmEmailVerification,
} from "./use-user";

// Version hooks
export { useVersion } from "./use-version";

// Post hooks
export {
  usePosts,
  usePost,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
} from "./use-posts";
