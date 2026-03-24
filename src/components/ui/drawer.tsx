import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type DrawerProps = {
  open: boolean;
  title?: string;
  widthClassName?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  headerExtra?: ReactNode;
  maskClosable?: boolean;
};

export function Drawer({
  open,
  title,
  widthClassName = "w-[min(42vw,720px)] min-w-[480px] max-w-[var(--drawer-width-lg)]",
  onClose,
  children,
  footer,
  headerExtra,
  maskClosable = true,
}: DrawerProps) {
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
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={maskClosable ? onClose : undefined}
      />
      <aside
        className={`absolute inset-y-0 right-0 flex flex-col border-l border-border bg-white shadow-md ${widthClassName}`}
      >
        <div className="flex h-[56px] items-center justify-between border-b border-border px-section">
          <div className="min-w-0">
            {title ? <div className="truncate text-section-title font-section-title text-text-primary">{title}</div> : null}
          </div>
          <div className="flex items-center gap-2">
            {headerExtra}
            <button
              type="button"
              aria-label="关闭抽屉"
              onClick={onClose}
              className="inline-flex h-btn-sm w-btn-sm items-center justify-center rounded-sm text-text-muted transition hover:bg-bg-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-subtle focus-visible:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-drawer py-drawer">{children}</div>

        {footer ? <div className="border-t border-border px-drawer py-section-tight">{footer}</div> : null}
      </aside>
    </div>,
    document.body,
  );
}
