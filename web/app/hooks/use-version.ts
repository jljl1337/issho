import { useQuery } from "@tanstack/react-query";

import { getVersion } from "~/lib/db/version";
import { queryKeys } from "~/lib/react-query/query-keys";

/**
 * Query hook to fetch the API version
 */
export function useVersion(enabled = true) {
  return useQuery({
    queryKey: queryKeys.version.get(),
    queryFn: () => getVersion(),
    enabled,
  });
}
