import { redirect } from "react-router";

export class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export async function throwIfError(response: Response): Promise<void> {
  if (!response.ok) {
    const errorData = (await response.json()) as {
      code: string;
      message: string;
    };
    throw new ApiError(errorData.code, errorData.message);
  }
}

/**
 * Redirects the user based on the provided error messages.
 * If any error is "Unauthorized", redirects to the sign-in page.
 * For any other error, redirects to a generic error page.
 *
 * @param errors - An array of error messages (ApiError objects or null).
 */
export function redirectIfNeeded(...errors: (ApiError | null)[]) {
  for (const error of errors) {
    if (error != null) {
      if (isUnauthorizedError(error)) {
        throw redirect("/auth/sign-in");
      }
      throw redirect("/error");
    }
  }
}

export function isUnauthorizedError(error: ApiError): boolean {
  return error.code === "401";
}
