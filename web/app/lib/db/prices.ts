import { throwIfError, translateError } from "~/lib/db/common";
import { customFetch } from "~/lib/db/fetch";

export { translateError };

export type Price = {
  id: string;
  externalId: string;
  productId: string;
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

export type GetPriceListParams = {
  pageSize?: number;
  cursor?: string;
  cursorId?: string;
};

export async function getPrices(params?: GetPriceListParams): Promise<Price[]> {
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
  const url = queryString ? `/api/prices?${queryString}` : "/api/prices";

  const response = await customFetch(url, "GET");
  await throwIfError(response);

  const data: Price[] = await response.json();
  return data;
}

export async function getPriceById(id: string): Promise<Price> {
  const response = await customFetch(`/api/prices/${id}`, "GET");
  await throwIfError(response);

  const data: Price = await response.json();
  return data;
}

export type CreatePriceParams = {
  productId: string;
  name: string;
  description: string;
  priceAmount: number;
  priceCurrency: string;
  isRecurring: boolean;
  recurringInterval?: string | null;
  recurringIntervalCount?: number | null;
  isActive?: boolean;
};

export async function createPrice(
  params: CreatePriceParams,
  csrfToken: string,
): Promise<void> {
  const response = await customFetch("/api/prices", "POST", params, csrfToken);

  await throwIfError(response);
}

export type UpdatePriceParams = {
  name: string;
  description: string;
  priceAmount: number;
  priceCurrency: string;
  isRecurring: boolean;
  recurringInterval?: string | null;
  recurringIntervalCount?: number | null;
  isActive: boolean;
};

export async function updatePrice(
  id: string,
  params: UpdatePriceParams,
  csrfToken: string,
): Promise<void> {
  const response = await customFetch(
    `/api/prices/${id}`,
    "PUT",
    params,
    csrfToken,
  );

  await throwIfError(response);
}
