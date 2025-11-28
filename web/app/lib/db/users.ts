import { throwIfError, translateError } from "~/lib/db/common";
import { customFetch } from "~/lib/db/fetch";

export { translateError };

export type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  languageCode: string;
  createdAt: string;
};

export async function getMe(): Promise<User> {
  const response = await customFetch("/api/users/me", "GET");
  await throwIfError(response);

  const data: User = await response.json();
  return data;
}

export async function updateUsername(
  newUsername: string,
  csrfToken: string,
): Promise<void> {
  const response = await customFetch(
    "/api/users/me/username",
    "PATCH",
    { newUsername },
    csrfToken,
  );

  await throwIfError(response);
}

export async function updatePassword(
  oldPassword: string,
  newPassword: string,
  csrfToken: string,
): Promise<void> {
  const response = await customFetch(
    "/api/users/me/password",
    "PATCH",
    { oldPassword, newPassword },
    csrfToken,
  );

  await throwIfError(response);
}

export async function updateLanguage(
  languageCode: string,
  csrfToken: string,
): Promise<void> {
  const response = await customFetch(
    "/api/users/me/language",
    "PATCH",
    { languageCode },
    csrfToken,
  );

  await throwIfError(response);
}

export async function deleteMe(csrfToken: string): Promise<void> {
  const response = await customFetch(
    "/api/users/me",
    "DELETE",
    null,
    csrfToken,
  );

  await throwIfError(response);
}
