import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
  description?: ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  variant?: "plain" | "inline" | "card";
};

export function Checkbox({
  label,
  description,
  className,
  containerClassName,
  labelClassName,
  variant = "plain",
  ...props
}: CheckboxProps) {
  const input = (
    <input
      type="checkbox"
      className={cn("h-4 w-4 rounded border-border text-primary focus:ring-primary-subtle", className)}
      {...props}
    />
  );

  if (!label && !description && variant === "plain") {
    return input;
  }

  if (variant === "card") {
    return (
      <label className={cn("choice-control", containerClassName)}>
        {input}
        <span className={cn("min-w-0", labelClassName)}>{label}</span>
      </label>
    );
  }

  return (
    <label className={cn("inline-flex items-center gap-2 text-body text-text-primary", containerClassName)}>
      {input}
      <span className={cn("min-w-0", labelClassName)}>{label}</span>
      {description ? <span className="text-small text-text-muted">{description}</span> : null}
    </label>
  );
}
