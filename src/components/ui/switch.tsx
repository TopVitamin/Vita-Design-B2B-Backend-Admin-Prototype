import { cn } from "../../lib/cn";

type SwitchProps = {
  checked: boolean;
  checkedLabel?: string;
  uncheckedLabel?: string;
  className?: string;
  onCheckedChange: (checked: boolean) => void;
};

export function Switch({
  checked,
  checkedLabel = "已启用",
  uncheckedLabel = "已关闭",
  className,
  onCheckedChange,
}: SwitchProps) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      className={cn("switch-control", checked && "is-on", className)}
      onClick={() => onCheckedChange(!checked)}
    >
      <span className="switch-track">
        <span className="switch-thumb" />
      </span>
      <span>{checked ? checkedLabel : uncheckedLabel}</span>
    </button>
  );
}
