import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import type { ColumnDef } from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";

import { VerticallyCenterPage } from "~/components/pages/vertically-center-page";
import { DataTable } from "~/components/tables/data-table";
import TableRowDropdown from "~/components/tables/dropdown";
import { useLanguage } from "~/contexts/language-context";
import { useSession } from "~/contexts/session-context";
import { useProducts } from "~/hooks/use-products";
import { type Product } from "~/lib/db/products";
import { formatDateTime } from "~/lib/format/date";
import { isUser } from "~/lib/validation/role";

export default function Page() {
  const { t } = useTranslation("product");
  const { t: tNav } = useTranslation("navigation");
  const { language } = useLanguage();

  const { user, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();

  // Store all loaded products
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorId, setCursorId] = useState<string | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }

    if (!isLoading && user && isUser(user.role)) {
      navigate("/");
    }
  }, [user, isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `${tNav("products")} | Issho`;
  }, [tNav]);

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useProducts({
    pageSize: 20,
    cursor,
    cursorId,
  });

  // Update allProducts when new products are fetched
  useEffect(() => {
    if (products.length > 0 && !productsLoading) {
      setAllProducts((prev) => {
        // If cursor is undefined, this is the first load
        if (!cursor && !cursorId) {
          return products;
        }
        // Otherwise, append new products
        const existingIds = new Set(prev.map((p) => p.id));
        const newProducts = products.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newProducts];
      });
      setIsLoadingMore(false);
    }
  }, [products, productsLoading, cursor, cursorId]);

  // Check if we have more products to load
  const hasMoreProducts = products.length === 20;

  // Handle load more
  const handleLoadMore = () => {
    if (!hasMoreProducts || allProducts.length === 0) return;
    setIsLoadingMore(true);
    const lastProduct = allProducts[allProducts.length - 1];
    setCursor(lastProduct.updatedAt || "");
    setCursorId(lastProduct.id);
  };

  // Define table columns
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: t("name"),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <Link
            to={`/products/edit/${product.id}`}
            className="font-medium hover:underline"
          >
            {product.name}
          </Link>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: t("active"),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return <span className="text-sm">{isActive ? t("yes") : t("no")}</span>;
      },
    },
    {
      accessorKey: "createdAt",
      header: t("createdAt"),
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        const date = new Date(createdAt);
        return (
          <span className="text-sm">{formatDateTime(date, language)}</span>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: t("updatedAt"),
      cell: ({ row }) => {
        const updatedAt = row.getValue("updatedAt") as string;
        const date = new Date(updatedAt);
        return (
          <span className="text-sm">{formatDateTime(date, language)}</span>
        );
      },
    },
  ];

  return (
    <VerticallyCenterPage className="flex flex-col gap-4">
      <h1 className="text-4xl">{t("products")}</h1>
      <div>
        <Button asChild>
          <Link to="/products/create">
            <PlusIcon className="mr-2 h-4 w-4" />
            {t("createProduct")}
          </Link>
        </Button>
      </div>

      {productsLoading && allProducts.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t("loadingProducts")}</p>
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={allProducts} />

          {hasMoreProducts && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="cursor-pointer"
              >
                {isLoadingMore ? t("loading") : t("loadMore")}
              </Button>
            </div>
          )}
        </>
      )}
    </VerticallyCenterPage>
  );
}
