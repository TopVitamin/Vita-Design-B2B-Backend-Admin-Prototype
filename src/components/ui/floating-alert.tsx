import { createPortal } from "react-dom";

export type FloatingAlertTone = "success" | "info" | "warning" | "error";

export type FloatingAlertInput = {
  tone: FloatingAlertTone;
  title: string;
  description?: string;
};

export function FloatingAlert({ notice }: { notice: FloatingAlertInput | null }) {
  if (!notice || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="floating-alert-region" aria-live="polite">
      <div className={`floating-alert is-${notice.tone}`} role="alert">
        <div className="font-body-strong">{notice.title}</div>
        {notice.description ? <div className="mt-1 text-small text-text-secondary">{notice.description}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
