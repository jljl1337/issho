import { cn } from "~/lib/utils";

export function HorizontallyCenterPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-full flex justify-center">
      <div className={cn("h-full max-w-[90rem] flex-1 p-16", className)}>
        {children}
      </div>
    </div>
  );
}
