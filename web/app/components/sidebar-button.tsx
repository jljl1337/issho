import { type LucideIcon } from "lucide-react";

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
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors cursor-pointer",
        isActive
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {isOpen && <span>{label}</span>}
    </button>
  );
}
