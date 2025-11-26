import { getError } from "~/lib/db/common";
import { customFetch } from "~/lib/db/fetch";

export async function getVersion() {
  const response = await customFetch("/api/version", "GET");

  const error = await getError(response);
  if (error != null) {
    return { data: null, error };
  }

  const data: { version: string } = await response.json();
  return { data: data.version, error: null };
}
