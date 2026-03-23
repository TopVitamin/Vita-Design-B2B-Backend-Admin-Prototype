import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function Card({
  title,
  extra,
  children,
  className,
}: {
  title?: string;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
      <section className={cn("page-section", className)}>
      {(title || extra) && (
        <div className="mb-4 flex items-center justify-between gap-actions">
          {title ? <h3 className="page-section-title mb-0">{title}</h3> : <span />}
          {extra}
        </div>
      )}
      {children}
    </section>
  );
}
