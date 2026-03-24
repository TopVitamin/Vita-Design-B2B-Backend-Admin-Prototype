import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function DescriptionList({
  items,
  columns = 4,
  dense = false,
  labelWidth,
  className,
}: {
  items: Array<{ label: string; value: ReactNode }>;
  columns?: 2 | 3 | 4;
  dense?: boolean;
  labelWidth?: number | string;
  className?: string;
}) {
  const columnClassName =
    columns === 2 ? "md:grid-cols-2" : columns === 3 ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4";

  return (
    <div className={cn("description-grid", dense && "gap-y-3", columnClassName, className)}>
      {items.map((item) => (
        <div key={item.label} className="description-item">
          <div className="description-label" style={labelWidth ? { minWidth: labelWidth } : undefined}>
            {item.label}
          </div>
          <div className="description-value">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
