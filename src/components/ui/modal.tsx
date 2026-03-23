import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  title: string;
  widthClassName?: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({
  open,
  title,
  widthClassName = "max-w-[min(100%,var(--modal-width-lg))] w-full",
  onClose,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-black/30">
      <div className="flex min-h-full items-center justify-center p-section">
        <div className={`flex w-full max-h-[90vh] flex-col overflow-hidden rounded-md bg-bg-container shadow-md ${widthClassName}`}>
          <div className="flex items-center justify-between border-b border-border px-modal py-section-tight">
            <h2 className="text-section-title font-section-title text-text-primary">{title}</h2>
            <button
              aria-label="关闭弹窗"
              className="inline-flex h-btn-sm w-btn-sm items-center justify-center rounded-sm text-text-muted transition hover:bg-bg-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-subtle focus-visible:ring-offset-2"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 overflow-auto p-modal">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
