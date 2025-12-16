import { cn } from "~/lib/utils";

interface CenteredPageProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A centered page layout component that:
 * - Takes full width and height of parent
 * - Centers content horizontally and vertically
 * - Provides responsive padding
 * - Does not modify the size of children
 */
export function CenteredPage({ children, className }: CenteredPageProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-background p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
