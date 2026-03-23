import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white border border-primary hover:bg-primary-hover hover:border-primary-hover",
  secondary:
    "bg-white text-text-primary border border-border hover:bg-bg-hover",
  ghost: "bg-transparent text-text-secondary border border-transparent hover:bg-bg-hover",
  danger:
    "bg-danger text-white border border-danger hover:opacity-90",
};

const sizeClassMap: Record<ButtonSize, string> = {
  sm: "h-btn-sm px-btn-sm-x text-small",
  md: "h-btn-md px-btn-md-x text-body",
};

export function Button({
  className,
  variant = "secondary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-control rounded-sm font-body transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-subtle focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variantClassMap[variant],
        sizeClassMap[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
