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

/**
 * Fetch all products by making multiple paginated requests if needed
 */
export async function getAllProducts(): Promise<Product[]> {
  const allProducts: Product[] = [];
  let cursor: string | undefined;
  let cursorId: string | undefined;
  const pageSize = 50; // Use a reasonable page size

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const products = await getProducts({
      pageSize,
      cursor,
      cursorId,
    });

    if (products.length === 0) {
      break;
    }

    allProducts.push(...products);

    // If we got fewer products than the page size, we've reached the end
    if (products.length < pageSize) {
      break;
    }

    // Set cursor for next iteration
    const lastProduct = products[products.length - 1];
    cursor = lastProduct.updatedAt;
    cursorId = lastProduct.id;
  }

  return allProducts;
}
