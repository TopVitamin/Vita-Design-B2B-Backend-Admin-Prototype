import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type UploadDropzoneProps = {
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
};

export function UploadDropzone({
  title = "拖拽文件到此处，或点击选择文件",
  description,
  className,
}: UploadDropzoneProps) {
  return (
    <div className={cn("rounded-md border border-dashed border-border bg-bg-subtle px-4 py-6 text-center", className)}>
      <div className="text-body text-text-secondary">{title}</div>
      {description ? <div className="mt-1.5 text-small leading-ui-relaxed text-text-muted">{description}</div> : null}
    </div>
  );
}
