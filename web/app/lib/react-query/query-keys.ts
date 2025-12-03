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
  prices: (params?: any) => ["prices", params] as const,
  price: (id: string) => ["prices", id] as const,
  products: (params?: any) => ["products", params] as const,
  product: (id: string) => ["products", id] as const,
} as const;
