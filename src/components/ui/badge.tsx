import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type BadgeTone =
  | "draft"
  | "pending"
  | "processing"
  | "success"
  | "closed"
  | "error";

const toneClassMap: Record<BadgeTone, string> = {
  draft: "bg-tag-draft text-[var(--tag-draft-text)] border border-[var(--tag-draft-border)]",
  pending: "bg-tag-pending text-[var(--tag-pending-text)] border border-[var(--tag-pending-border)]",
  processing: "bg-tag-processing text-[var(--tag-processing-text)] border border-[var(--tag-processing-border)]",
  success: "bg-tag-success text-[var(--tag-success-text)] border border-[var(--tag-success-border)]",
  closed: "bg-tag-closed text-[var(--tag-closed-text)] border border-[var(--tag-closed-border)]",
  error: "bg-tag-error text-[var(--tag-error-text)] border border-[var(--tag-error-border)]",
};

export function Badge({
  tone,
  children,
  className,
}: {
  tone: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-tag items-center whitespace-nowrap rounded-[var(--tag-radius)] px-tag-x text-small font-tag",
        toneClassMap[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
