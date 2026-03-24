import type { CSSProperties } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  menuDensity?: "default" | "compact";
  menuPlacement?: "auto" | "top" | "bottom";
  onValueChange?: (value: string) => void;
};

export function Select({
  options,
  value,
  defaultValue,
  placeholder = "请选择",
  className,
  disabled = false,
  menuDensity = "default",
  menuPlacement = "auto",
  onValueChange,
}: SelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined;
  const [open, setOpen] = useState(false);
  const [innerValue, setInnerValue] = useState(defaultValue ?? "");
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({
    position: "fixed",
    top: 0,
    left: 0,
    opacity: 0,
    pointerEvents: "none",
  });
  const [menuMaxHeight, setMenuMaxHeight] = useState(240);

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

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function updateMenuPosition() {
      const trigger = triggerRef.current;
      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const viewportPadding = 8;
      const menuOffset = 4;
      const estimatedMenuHeight = menuRef.current?.offsetHeight ?? Math.min(options.length * 40 + 16, 240);
      const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
      const spaceAbove = rect.top - viewportPadding;
      const resolvedPlacement =
        menuPlacement === "auto"
          ? spaceBelow >= estimatedMenuHeight || spaceBelow >= spaceAbove
            ? "bottom"
            : "top"
          : menuPlacement;
      const availableHeight = Math.max(
        96,
        (resolvedPlacement === "bottom" ? spaceBelow : spaceAbove) - menuOffset,
      );
      const menuHeight = Math.min(estimatedMenuHeight, availableHeight);
      const width = rect.width;
      const maxLeft = Math.max(viewportPadding, window.innerWidth - viewportPadding - width);
      const left = Math.min(Math.max(rect.left, viewportPadding), maxLeft);
      const top =
        resolvedPlacement === "bottom"
          ? rect.bottom + menuOffset
          : rect.top - menuOffset - menuHeight;

      setMenuMaxHeight(availableHeight);
      setMenuStyle({
        position: "fixed",
        top: Math.max(viewportPadding, top),
        left,
        width,
        zIndex: 70,
        opacity: 1,
        pointerEvents: "auto",
      });
    }

    updateMenuPosition();
    const frameId = window.requestAnimationFrame(updateMenuPosition);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [menuPlacement, open, options.length]);

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
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "field-control flex min-w-0 items-center justify-between gap-2 pr-10 text-left",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        onClick={() => {
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
      >
        <span
          className={cn(
            "block min-w-0 flex-1 truncate whitespace-nowrap",
            selectedOption ? "text-text-primary" : "text-text-placeholder",
          )}
          title={selectedOption?.label ?? placeholder}
        >
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

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              style={menuStyle}
              className="rounded-sm border border-border bg-white p-1 shadow-md"
            >
              <div
                role="listbox"
                className={cn("overflow-auto", menuDensity === "compact" ? "py-0.5" : "py-1")}
                style={{ maxHeight: menuMaxHeight }}
              >
                {options.map((option) => {
                  const active = option.value === currentValue;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={active}
                      disabled={option.disabled}
                      title={option.label}
                      className={cn(
                        "flex w-full min-w-0 items-center gap-2 rounded-sm text-text-primary transition hover:bg-bg-hover",
                        menuDensity === "compact" ? "h-8 px-3 text-small" : "h-9 px-3 text-body",
                        active && "bg-primary-subtle text-primary",
                        option.disabled && "cursor-not-allowed opacity-50",
                      )}
                      onClick={() => handleSelect(option.value)}
                    >
                      <span className="inline-flex w-4 items-center justify-center">
                        {active ? <Check aria-hidden="true" className="h-4 w-4" /> : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate whitespace-nowrap text-left leading-none">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
