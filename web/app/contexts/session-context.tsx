import React, { createContext, useContext, useEffect, useState } from "react";

import { getCsrfToken } from "~/lib/db/auth";
import { isUnauthorizedError } from "~/lib/db/common";
import { getMe } from "~/lib/db/users";

type User = {
  id: string;
  username: string;
  role: string;
  createdAt: string;
};

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = async () => {
    setIsLoading(true);
    try {
      // Fetch user and CSRF token in parallel
      const [userResult, csrfResult] = await Promise.all([
        getMe(),
        getCsrfToken(),
      ]);

      // If we got CSRF token, set it
      if (csrfResult.data != null) {
        setCsrfToken(csrfResult.data);
      } else {
        setCsrfToken(null);
      }

      // Check if user is unauthorized
      if (userResult.error != null && isUnauthorizedError(userResult.error)) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }

      // If we got user data, set it
      if (userResult.data != null) {
        setUser(userResult.data);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Failed to refresh session:", error);
      setIsLoggedIn(false);
      setUser(null);
      setCsrfToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = () => {
    setIsLoggedIn(false);
    setUser(null);
    setCsrfToken(null);
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        isLoggedIn,
        user,
        csrfToken,
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
