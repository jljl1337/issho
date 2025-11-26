import { getError } from "~/lib/db/common";
import { customFetch } from "~/lib/db/fetch";

type CsrfToken = {
  csrfToken: string;
};

export async function signUp(username: string, password: string) {
  const response = await customFetch("/api/auth/sign-up", "POST", {
    username,
    password,
  });

  return { error: await getError(response) };
}

/**
 * Creates a pre-session and returns the CSRF token.
 */
export async function createPreSession() {
  const response = await customFetch("/api/auth/pre-session", "POST");

  const error = await getError(response);
  if (error != null) {
    return { data: null, error };
  }

  const data: CsrfToken = await response.json();
  return { data: data.csrfToken, error: null };
}

export async function signIn(
  username: string,
  password: string,
  csrfToken: string,
) {
  const response = await customFetch(
    "/api/auth/sign-in",
    "POST",
    {
      username,
      password,
    },
    csrfToken,
  );

  return { error: await getError(response) };
}

export async function getCsrfToken() {
  const response = await customFetch("/api/auth/csrf-token", "GET");

  const error = await getError(response);
  if (error != null) {
    return { data: null, error };
  }

  const data: CsrfToken = await response.json();
  return { data: data.csrfToken, error: null };
}

export async function signOut(csrfToken: string) {
  const response = await customFetch(
    "/api/auth/sign-out",
    "POST",
    null,
    csrfToken,
  );

  return { error: await getError(response) };
}

export async function signOutAll(csrfToken: string) {
  const response = await customFetch(
    "/api/auth/sign-out-all",
    "POST",
    null,
    csrfToken,
  );

  return { error: await getError(response) };
}
