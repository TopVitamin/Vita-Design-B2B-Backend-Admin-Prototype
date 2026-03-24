import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type RadioOption = {
  label: ReactNode;
  value: string;
};

type RadioGroupProps = {
  name?: string;
  value: string;
  options: RadioOption[];
  className?: string;
  optionClassName?: string;
  direction?: "vertical" | "horizontal";
  variant?: "plain" | "card";
  onValueChange: (value: string) => void;
};

export function RadioGroup({
  name,
  value,
  options,
  className,
  optionClassName,
  direction = "vertical",
  variant = "plain",
  onValueChange,
}: RadioGroupProps) {
  return (
    <div className={cn(direction === "vertical" ? "space-y-2" : "flex flex-wrap gap-3", className)}>
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              variant === "card"
                ? "inline-flex items-center gap-2 rounded-sm border border-border bg-white px-3 py-2 text-small text-text-secondary"
                : "inline-flex items-center gap-2 text-body text-text-primary",
              checked && variant === "card" && "border-primary-subtle bg-primary-subtle text-primary",
              optionClassName,
            )}
          >
            <input
              type="radio"
              name={name}
              checked={checked}
              onChange={() => onValueChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
