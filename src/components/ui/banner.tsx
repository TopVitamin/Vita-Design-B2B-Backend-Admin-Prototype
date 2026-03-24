import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type BannerTone = "success" | "info" | "warning" | "error";

type BannerProps = {
  tone: BannerTone;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

const toneClassMap: Record<BannerTone, string> = {
  success: "border-success bg-success-subtle text-success",
  info: "border-info bg-info-subtle text-info",
  warning: "border-warning bg-warning-subtle text-warning",
  error: "border-danger bg-danger-subtle text-danger",
};

export function Banner({
  tone,
  title,
  description,
  action,
  className,
}: BannerProps) {
  return (
    <div className={cn("state-banner", toneClassMap[tone], className)}>
      <div className="min-w-0 flex-1">
        <div className="text-body font-body-strong leading-ui-tight">{title}</div>
        {description ? <div className="mt-1 text-small leading-ui-relaxed text-text-secondary">{description}</div> : null}
      </div>
      {action ? <div className="shrink-0 self-center">{action}</div> : null}
    </div>
  );
}
