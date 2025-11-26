import { throwIfError } from "~/lib/db/common";
import { customFetch } from "~/lib/db/fetch";

export async function getVersion(): Promise<string> {
  const response = await customFetch("/api/version", "GET");
  await throwIfError(response);

  const data: { version: string } = await response.json();
  return data.version;
}
