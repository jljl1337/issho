import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import type { ColumnDef } from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";

import { HorizontallyCenteredPage } from "~/components/layouts/horizontally-centered-page";
import { DataTable } from "~/components/tables/data-table";
import { useLanguage } from "~/contexts/language-context";
import { useSession } from "~/contexts/session-context";
import { usePrices } from "~/hooks/use-prices";
import { type Price } from "~/lib/db/prices";
import { formatDateTime } from "~/lib/format/date";
import { isUser } from "~/lib/validation/role";

export default function Page() {
  const { t } = useTranslation("price");
  const { t: tNav } = useTranslation("navigation");
  const { language } = useLanguage();

  const { user, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();

  // Store all loaded prices
  const [allPrices, setAllPrices] = useState<Price[]>([]);
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
    document.title = `${tNav("prices")} | Issho`;
  }, [tNav]);

  // Fetch prices
  const { data: prices = [], isLoading: pricesLoading } = usePrices({
    pageSize: 20,
    cursor,
    cursorId,
  });

  // Update allPrices when new prices are fetched
  useEffect(() => {
    if (prices.length > 0 && !pricesLoading) {
      setAllPrices((prev) => {
        // If cursor is undefined, this is the first load
        if (!cursor && !cursorId) {
          return prices;
        }
        // Otherwise, append new prices
        const existingIds = new Set(prev.map((p) => p.id));
        const newPrices = prices.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newPrices];
      });
      setIsLoadingMore(false);
    }
  }, [prices, pricesLoading, cursor, cursorId]);

  // Check if we have more prices to load
  const hasMorePrices = prices.length === 20;

  // Handle load more
  const handleLoadMore = () => {
    if (!hasMorePrices || allPrices.length === 0) return;
    setIsLoadingMore(true);
    const lastPrice = allPrices[allPrices.length - 1];
    setCursor(lastPrice.updatedAt || "");
    setCursorId(lastPrice.id);
  };

  // Define table columns
  const columns: ColumnDef<Price>[] = [
    {
      accessorKey: "name",
      header: t("name"),
      cell: ({ row }) => {
        const price = row.original;
        return (
          <Link
            to={`/admin/prices/${price.id}/edit`}
            className="font-medium hover:underline"
          >
            {price.name}
          </Link>
        );
      },
    },
    {
      accessorKey: "priceAmount",
      header: t("price"),
      cell: ({ row }) => {
        const amountInDollars = (row.original.priceAmount / 100).toFixed(2);
        return <span>${amountInDollars}</span>;
      },
    },
    {
      accessorKey: "priceCurrency",
      header: t("currency"),
      cell: ({ row }) => {
        const price = row.original;
        const currencyKey = `currency${price.priceCurrency.toUpperCase()}`;
        return <span>{t(currencyKey)}</span>;
      },
    },
    {
      accessorKey: "isRecurring",
      header: t("recurring"),
      cell: ({ row }) => {
        const isRecurring = row.getValue("isRecurring") as boolean;
        return (
          <span className="text-sm">{isRecurring ? t("yes") : t("no")}</span>
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
    <HorizontallyCenteredPage className="flex flex-col gap-4">
      <h1 className="text-4xl">{t("prices")}</h1>
      <div>
        <Button asChild>
          <Link to="/admin/prices/create">
            <PlusIcon className="mr-2 h-4 w-4" />
            {t("createPrice")}
          </Link>
        </Button>
      </div>

      {pricesLoading && allPrices.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t("loadingPrices")}</p>
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={allPrices} />

          {hasMorePrices && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? t("loading") : t("loadMore")}
              </Button>
            </div>
          )}
        </>
      )}
    </HorizontallyCenteredPage>
  );
}
