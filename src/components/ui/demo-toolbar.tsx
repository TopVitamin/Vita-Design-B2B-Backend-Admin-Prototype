import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type DemoToolbarProps<T extends string> = {
  label: string;
  items: ReadonlyArray<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
  description?: string;
};

type ToolbarPosition = {
  left: number;
  top: number;
};

function clampPosition(position: ToolbarPosition, panel: HTMLDivElement | null) {
  if (typeof window === "undefined") {
    return position;
  }

  const width = panel?.offsetWidth ?? 360;
  const height = panel?.offsetHeight ?? 148;
  const minLeft = 12;
  const minTop = 12;
  const maxLeft = Math.max(minLeft, window.innerWidth - width - 12);
  const maxTop = Math.max(minTop, window.innerHeight - height - 12);

  return {
    left: Math.min(Math.max(position.left, minLeft), maxLeft),
    top: Math.min(Math.max(position.top, minTop), maxTop),
  };
}

export function DemoToolbar<T extends string>({
  label,
  items,
  value,
  onChange,
  description = "仅用于切换展示状态",
}: DemoToolbarProps<T>) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const [position, setPosition] = useState<ToolbarPosition | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function ensurePosition() {
      if (!panelRef.current) {
        return;
      }

      setPosition((current) => {
        if (!current) {
          return clampPosition(
            {
              left: window.innerWidth - panelRef.current!.offsetWidth - 24,
              top: window.innerHeight - panelRef.current!.offsetHeight - 24,
            },
            panelRef.current,
          );
        }

        return clampPosition(current, panelRef.current);
      });
    }

    ensurePosition();
    window.addEventListener("resize", ensurePosition);
    return () => window.removeEventListener("resize", ensurePosition);
  }, []);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (!dragRef.current || !panelRef.current) {
        return;
      }

      setPosition(
        clampPosition(
          {
            left: event.clientX - dragRef.current.offsetX,
            top: event.clientY - dragRef.current.offsetY,
          },
          panelRef.current,
        ),
      );
    }

    function handlePointerUp() {
      dragRef.current = null;
      setDragging(false);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!panelRef.current) {
      return;
    }

    const rect = panelRef.current.getBoundingClientRect();
    dragRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    setDragging(true);
  }

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={panelRef}
      className={`demo-toolbar ${dragging ? "is-dragging" : ""}`}
      style={position ? { left: position.left, top: position.top, right: "auto", bottom: "auto" } : undefined}
    >
      <div className="demo-toolbar-header demo-toolbar-drag-handle" onPointerDown={handlePointerDown}>
        <span className="demo-toolbar-title">样例调试面板</span>
        <span className="demo-toolbar-desc">{description}</span>
      </div>
      <div className="demo-scenario-toggle">
        <span className="demo-scenario-label">{label}</span>
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`demo-scenario-chip ${item.value === value ? "is-active" : ""}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
}
