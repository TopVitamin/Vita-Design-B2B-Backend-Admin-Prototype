import { cn } from "../../lib/cn";

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  showDivider = true,
  showIndicator = true,
}: {
  items: Array<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
  showDivider?: boolean;
  showIndicator?: boolean;
}) {
  return (
    <div className={cn("linear-tabs", !showDivider && "is-dividerless")}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            className={cn("linear-tab", active && "is-active", active && !showIndicator && "is-active-no-indicator")}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
