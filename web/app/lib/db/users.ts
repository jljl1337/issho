import { getError } from "~/lib/db/common";
import { customFetch } from "~/lib/db/fetch";

type User = {
  id: string;
  username: string;
  role: string;
  createdAt: string;
};

export async function getMe() {
  const response = await customFetch("/api/users/me", "GET");

  const error = await getError(response);
  if (error != null) {
    return { data: null, error };
  }

  const data: User = await response.json();
  return { data, error: null };
}

export async function updateUsername(newUsername: string, csrfToken: string) {
  const response = await customFetch(
    "/api/users/me/username",
    "PATCH",
    { newUsername },
    csrfToken,
  );

  return { error: await getError(response) };
}

export async function updatePassword(
  oldPassword: string,
  newPassword: string,
  csrfToken: string,
) {
  const response = await customFetch(
    "/api/users/me/password",
    "PATCH",
    { oldPassword, newPassword },
    csrfToken,
  );

  return { error: await getError(response) };
}

export async function deleteMe(csrfToken: string) {
  const response = await customFetch(
    "/api/users/me",
    "DELETE",
    null,
    csrfToken,
  );

  return { error: await getError(response) };
}
