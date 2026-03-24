import { Download, FileText, RotateCw, Trash2, UploadCloud } from "lucide-react";
import { Button } from "./button";

export type AttachmentItem = {
  id: string;
  name: string;
  size: string;
  status: "uploaded" | "uploading" | "failed";
};

export function AttachmentPanel({
  items,
  onUpload,
  onDownload,
  onDelete,
  onRetry,
  readonly = false,
}: {
  items: AttachmentItem[];
  onUpload: () => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
  onRetry?: (id: string) => void;
  readonly?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-small text-text-muted">支持上传合同、报价单、附件说明等业务文件。</div>
        {readonly ? null : (
          <Button size="sm" onClick={onUpload}>
            <UploadCloud aria-hidden="true" className="h-4 w-4" />
            上传附件
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-sm border border-border bg-white px-3 py-2">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-bg-subtle text-text-muted">
                <FileText aria-hidden="true" className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-body text-text-primary">{item.name}</div>
                <div className="mt-1 text-small text-text-muted">
                  {item.size} · {item.status === "uploaded" ? "已上传" : item.status === "uploading" ? "上传中" : "上传失败"}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {item.status === "uploaded" ? (
                <button className="text-link" type="button" onClick={() => onDownload(item.id)}>
                  <Download aria-hidden="true" className="h-4 w-4" />
                </button>
              ) : null}
              {item.status === "failed" && onRetry && !readonly ? (
                <button className="text-link" type="button" onClick={() => onRetry(item.id)}>
                  <RotateCw aria-hidden="true" className="h-4 w-4" />
                </button>
              ) : null}
              {readonly ? null : (
                <button className="text-link" type="button" onClick={() => onDelete(item.id)}>
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
