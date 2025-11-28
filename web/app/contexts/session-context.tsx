import React, { createContext, useContext, useEffect, useMemo } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { useCsrfToken } from "~/hooks/use-auth";
import { useMe } from "~/hooks/use-user";
import type { User } from "~/lib/db/users";

type SessionContextType = {
  isLoggedIn: boolean;
  user: User | null;
  csrfToken: string | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  clearSession: () => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Use React Query hooks for data fetching
  const {
    data: user,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useMe();
  const {
    data: csrfToken,
    isLoading: isCsrfLoading,
    refetch: refetchCsrf,
  } = useCsrfToken();

  const isLoading = isUserLoading || isCsrfLoading;
  const isLoggedIn = useMemo(() => user != null, [user]);

  const refreshSession = async () => {
    // Refetch both user and CSRF token
    await Promise.all([refetchUser(), refetchCsrf()]);
  };

  const clearSession = () => {
    // Clear all cached queries
    queryClient.clear();
  };

  return (
    <SessionContext.Provider
      value={{
        isLoggedIn,
        user: user ?? null,
        csrfToken: csrfToken ?? null,
        isLoading,
        refreshSession,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
