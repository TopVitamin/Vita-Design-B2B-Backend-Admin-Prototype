import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function HorizontalScrollArea({
  children,
  className,
  viewportClassName,
}: {
  children: ReactNode;
  className?: string;
  viewportClassName?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className={cn("overflow-x-auto overflow-y-hidden", viewportClassName)}>
        {children}
      </div>
    </div>
  );
}
