import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type FilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  children: ReactNode;
};

export function FilterChip({
  active = false,
  className,
  children,
  type = "button",
  ...props
}: FilterChipProps) {
  return (
    <button
      type={type}
      className={cn("filter-chip", active && "is-active", className)}
      {...props}
    >
      {children}
    </button>
  );
}
