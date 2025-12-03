import { throwIfError, translateError } from "~/lib/db/common";
import { customFetch } from "~/lib/db/fetch";

export { translateError };

export type Product = {
  id: string;
  externalId: string | null;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GetProductListParams = {
  pageSize?: number;
  cursor?: string;
  cursorId?: string;
};

export async function getProducts(
  params?: GetProductListParams,
): Promise<Product[]> {
  const searchParams = new URLSearchParams();

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
