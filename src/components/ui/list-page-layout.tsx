import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type ListPageMainCardProps = {
  children: ReactNode;
  className?: string;
};

type ListPageToolbarProps = HTMLAttributes<HTMLDivElement>;

export function ListPageMainCard({
  children,
  className,
}: ListPageMainCardProps) {
  return <div className={cn("list-page-main-card", className)}>{children}</div>;
}

export function ListPageToolbar({
  className,
  children,
  ...props
}: ListPageToolbarProps) {
  return (
    <div className={cn("table-toolbar min-h-[52px] border-b border-border px-4 py-2.5", className)} {...props}>
      {children}
    </div>
  );
}
