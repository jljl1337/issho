import { useState } from "react";
import { Link } from "react-router";

import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface TableRowDropdownProps {
  editUrl: string;
  deleteUrl: string;
}

export default function TableRowDropdown({
  editUrl,
  deleteUrl,
}: TableRowDropdownProps) {
  const { t } = useTranslation("common");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
          <span className="sr-only">{t("openMenu")}</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to={editUrl}>{t("edit")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-destructive cursor-pointer">
          <Link to={deleteUrl}>{t("delete")}</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
