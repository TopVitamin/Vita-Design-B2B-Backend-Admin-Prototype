import { cn } from "../../lib/cn";

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: Array<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("segmented-control", className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn("segmented-control-item", active && "is-active")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
