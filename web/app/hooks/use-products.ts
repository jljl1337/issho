import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createProduct as createProductApi,
  deleteProduct as deleteProductApi,
  getProductById,
  getProducts,
  updateProduct as updateProductApi,
  type CreateProductParams,
  type GetProductListParams,
  type UpdateProductParams,
} from "~/lib/db/products";
import { queryKeys } from "~/lib/react-query/query-keys";

/**
 * Query hook to fetch products list
 */
export function useProducts(params?: GetProductListParams) {
  return useQuery({
    queryKey: queryKeys.products(params),
    queryFn: () => getProducts(params),
  });
}

/**
 * Query hook to fetch a single product by ID
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
}

/**
 * Mutation hook to create a product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      params,
      csrfToken,
    }: {
      params: CreateProductParams;
      csrfToken: string;
    }) => createProductApi(params, csrfToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * Mutation hook to update a product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      params,
      csrfToken,
    }: {
      id: string;
      params: UpdateProductParams;
      csrfToken: string;
    }) => updateProductApi(id, params, csrfToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * Mutation hook to delete a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, csrfToken }: { id: string; csrfToken: string }) =>
      deleteProductApi(id, csrfToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
