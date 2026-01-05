import { type LucideIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface SidebarButtonProps {
  icon: LucideIcon;
  label: string;
  isOpen: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export function SidebarButton({
  icon: Icon,
  label,
  isOpen,
  isActive = false,
  onClick,
}: SidebarButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn("w-full", isOpen ? "justify-start" : "justify-center")}
      variant={isActive ? "secondary" : "ghost"}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {isOpen && <span className="truncate">{label}</span>}
    </Button>
  );
}
