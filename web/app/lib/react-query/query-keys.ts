/**
 * Centralized query keys factory for type-safe query key management
 */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    csrfToken: () => [...queryKeys.auth.all, "csrf-token"] as const,
  },
  users: {
    all: ["users"] as const,
    me: () => [...queryKeys.users.all, "me"] as const,
  },
  version: {
    all: ["version"] as const,
    get: () => [...queryKeys.version.all, "get"] as const,
  },
  posts: (params?: any) => ["posts", params] as const,
  post: (id: string) => ["posts", id] as const,
} as const;
