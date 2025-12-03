import { throwIfError, translateError } from "~/lib/db/common";
import { customFetch } from "~/lib/db/fetch";

export { translateError };

export type Product = {
  id: string;
  name: string;
  description: string;
  priceAmount: number;
  priceCurrency: string;
  isRecurring: boolean;
  recurringInterval: string | null;
  recurringIntervalCount: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GetProductListParams = {
  orderBy?: string;
  ascending?: boolean;
  pageSize?: number;
  cursor?: string;
  cursorId?: string;
};

export async function getProducts(
  params?: GetProductListParams,
): Promise<Product[]> {
  const searchParams = new URLSearchParams();

  if (params?.orderBy) {
    searchParams.set("order-by", params.orderBy);
  }
  if (params?.ascending !== undefined) {
    searchParams.set("ascending", params.ascending.toString());
  }
  if (params?.pageSize) {
    searchParams.set("page-size", params.pageSize.toString());
  }
  if (params?.cursor) {
    searchParams.set("cursor", params.cursor);
  }
  if (params?.cursorId) {
    searchParams.set("cursor-id", params.cursorId);
  }

  const queryString = searchParams.toString();
  const url = queryString ? `/api/products?${queryString}` : "/api/products";

  const response = await customFetch(url, "GET");
  await throwIfError(response);

  const data: Product[] = await response.json();
  return data;
}

export async function getProductById(id: string): Promise<Product> {
  const response = await customFetch(`/api/products/${id}`, "GET");
  await throwIfError(response);

  const data: Product = await response.json();
  return data;
}

export type CreateProductParams = {
  name: string;
  description: string;
  priceAmount: number;
  priceCurrency: string;
  isRecurring: boolean;
  recurringInterval?: string | null;
  recurringIntervalCount?: number | null;
  isActive?: boolean;
};

export async function createProduct(
  params: CreateProductParams,
  csrfToken: string,
): Promise<void> {
  const response = await customFetch(
    "/api/products",
    "POST",
    params,
    csrfToken,
  );

  await throwIfError(response);
}

export type UpdateProductParams = {
  name: string;
  description: string;
  priceAmount: number;
  priceCurrency: string;
  isRecurring: boolean;
  recurringInterval?: string | null;
  recurringIntervalCount?: number | null;
  isActive: boolean;
};

export async function updateProduct(
  id: string,
  params: UpdateProductParams,
  csrfToken: string,
): Promise<void> {
  const response = await customFetch(
    `/api/products/${id}`,
    "PUT",
    params,
    csrfToken,
  );

  await throwIfError(response);
}

export async function deleteProduct(
  id: string,
  csrfToken: string,
): Promise<void> {
  const response = await customFetch(
    `/api/products/${id}`,
    "DELETE",
    undefined,
    csrfToken,
  );

  await throwIfError(response);
}
