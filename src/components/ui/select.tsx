import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/cn";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectProps = {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
};

export function Select({
  options,
  value,
  defaultValue,
  placeholder = "请选择",
  className,
  disabled = false,
  onValueChange,
}: SelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined;
  const [open, setOpen] = useState(false);
  const [innerValue, setInnerValue] = useState(defaultValue ?? "");

  const currentValue = isControlled ? value : innerValue;
  const selectedOption = useMemo(
    () => options.find((option) => option.value === currentValue),
    [currentValue, options],
  );

  useEffect(() => {
    if (!isControlled) {
      setInnerValue(defaultValue ?? "");
    }
  }, [defaultValue, isControlled]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function handleSelect(nextValue: string) {
    if (!isControlled) {
      setInnerValue(nextValue);
    }
    onValueChange?.(nextValue);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "field-control flex items-center justify-between gap-2 pr-10 text-left",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        onClick={() => {
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
      >
        <span className={selectedOption ? "text-text-primary" : "text-text-placeholder"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 rounded-sm border border-border bg-white p-1 shadow-md">
          <div role="listbox" className="max-h-60 overflow-auto py-1">
            {options.map((option) => {
              const active = option.value === currentValue;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={option.disabled}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-3 py-2 text-body text-text-primary transition hover:bg-bg-hover",
                    active && "bg-primary-subtle text-primary",
                    option.disabled && "cursor-not-allowed opacity-50",
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <span className="inline-flex w-4 items-center justify-center">
                    {active ? <Check aria-hidden="true" className="h-4 w-4" /> : null}
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
