import { redirect } from "react-router";

type Error = {
  code: string;
  message: string;
};

export async function getError(response: Response) {
  if (!response.ok) {
    return (await response.json()) as Error;
  }
  return Promise.resolve(null);
}

/**
 * Redirects the user based on the provided error messages.
 * If any error is "Unauthorized", redirects to the sign-in page.
 * For any other error, redirects to a generic error page.
 *
 * @param errors - An array of error messages (Error objects or null).
 */
export function redirectIfNeeded(...errors: (Error | null)[]) {
  for (const error of errors) {
    if (error != null) {
      if (isUnauthorizedError(error)) {
        throw redirect("/auth/sign-in");
      }
      throw redirect("/error");
    }
  }
}

export function isUnauthorizedError(error: Error): boolean {
  return error.code === "401";
}
