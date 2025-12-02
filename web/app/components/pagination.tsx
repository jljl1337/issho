import { Link } from "react-router";

import {
  ArrowLeftToLineIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

import { Button } from "~/components/ui/button";

interface PaginationProps {
  isFirstPage: boolean;
  firstPageUrl: string;
  previousPageUrl: string;
  nextPageUrl: string;
}

export default function Pagination({
  isFirstPage,
  firstPageUrl,
  previousPageUrl,
  nextPageUrl,
}: PaginationProps) {
  return (
    <div className="ml-auto flex items-center gap-2 lg:ml-0">
      <Button
        variant="outline"
        className="hidden h-8 w-8 p-0 lg:flex"
        disabled={isFirstPage}
        asChild={!isFirstPage}
      >
        <Link to={firstPageUrl}>
          <span className="sr-only">Go to first page</span>
          <ArrowLeftToLineIcon />
        </Link>
      </Button>
      <Button
        variant="outline"
        className="size-8"
        size="icon"
        disabled={isFirstPage}
        asChild={!isFirstPage}
      >
        <Link to={previousPageUrl}>
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon />
        </Link>
      </Button>
      <Button variant="outline" className="size-8" size="icon" asChild>
        <Link to={nextPageUrl}>
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon />
        </Link>
      </Button>
    </div>
  );
}
