import { throwIfError } from "~/lib/db/common";
import { customFetch } from "~/lib/db/fetch";

type CsrfToken = {
  csrfToken: string;
};

export async function signUp(
  username: string,
  password: string,
): Promise<void> {
  const response = await customFetch("/api/auth/sign-up", "POST", {
    username,
    password,
  });

  await throwIfError(response);
}

/**
 * Creates a pre-session and returns the CSRF token.
 */
export async function createPreSession(): Promise<string> {
  const response = await customFetch("/api/auth/pre-session", "POST");
  await throwIfError(response);

  const data: CsrfToken = await response.json();
  return data.csrfToken;
}

export async function signIn(
  username: string,
  password: string,
  csrfToken: string,
): Promise<void> {
  const response = await customFetch(
    "/api/auth/sign-in",
    "POST",
    {
      username,
      password,
    },
    csrfToken,
  );

  await throwIfError(response);
}

export async function getCsrfToken(): Promise<string> {
  const response = await customFetch("/api/auth/csrf-token", "GET");
  await throwIfError(response);

  const data: CsrfToken = await response.json();
  return data.csrfToken;
}

export async function signOut(csrfToken: string): Promise<void> {
  const response = await customFetch(
    "/api/auth/sign-out",
    "POST",
    null,
    csrfToken,
  );

  await throwIfError(response);
}

export async function signOutAll(csrfToken: string): Promise<void> {
  const response = await customFetch(
    "/api/auth/sign-out-all",
    "POST",
    null,
    csrfToken,
  );

  await throwIfError(response);
}
