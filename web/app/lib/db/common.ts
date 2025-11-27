import { redirect } from "react-router";

import i18n from "~/i18n";

export class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

/**
 * Translates an API error to a user-friendly message.
 * If the error code has a specific translation, it will be used.
 * Otherwise, a generic error message will be shown.
 */
export function translateError(error: unknown): string {
  if (error instanceof ApiError) {
    // Check if we have a specific translation for this error code
    const translationKey = `errors.${error.code}`;
    const translated = i18n.t(translationKey);

    // If the translation key was not found, i18n returns the key itself
    if (translated !== translationKey) {
      return translated;
    }
  }

  // Fallback to generic error message
  return i18n.t("errors.genericError");
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
