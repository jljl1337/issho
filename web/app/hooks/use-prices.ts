import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPrice as createPriceApi,
  getPriceById,
  getPrices,
  updatePrice as updatePriceApi,
  type CreatePriceParams,
  type GetPriceListParams,
  type UpdatePriceParams,
} from "~/lib/db/prices";
import { queryKeys } from "~/lib/react-query/query-keys";

/**
 * Query hook to fetch prices list
 */
export function usePrices(params?: GetPriceListParams) {
  return useQuery({
    queryKey: queryKeys.prices(params),
    queryFn: () => getPrices(params),
  });
}

/**
 * Query hook to fetch a single price by ID
 */
export function usePrice(id: string) {
  return useQuery({
    queryKey: queryKeys.price(id),
    queryFn: () => getPriceById(id),
    enabled: !!id,
  });
}

/**
 * Mutation hook to create a price
 */
export function useCreatePrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      params,
      csrfToken,
    }: {
      params: CreatePriceParams;
      csrfToken: string;
    }) => createPriceApi(params, csrfToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prices"] });
    },
  });
}

/**
 * Mutation hook to update a price
 */
export function useUpdatePrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      params,
      csrfToken,
    }: {
      id: string;
      params: UpdatePriceParams;
      csrfToken: string;
    }) => updatePriceApi(id, params, csrfToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prices"] });
    },
  });
}
