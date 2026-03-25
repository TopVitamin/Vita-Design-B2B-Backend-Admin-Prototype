import { ChevronDown, ChevronUp } from "lucide-react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import type { ColumnSettingsField, ColumnSettingsState } from "./column-settings";

export type TableSortDirection = "asc" | "desc";

export type TableSortState<ColumnId extends string = string> = {
  columnId: ColumnId;
  direction: TableSortDirection;
} | null;

export type TableSortType = "text" | "number" | "currency" | "date" | "datetime";

export type TableSortConfig<Row> = {
  type: TableSortType;
  getValue: (row: Row) => unknown;
};

function normalizeNumericValue(value: unknown, type: "number" | "currency") {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = type === "currency" ? value.replace(/[^\d.-]/g, "") : value.replace(/,/g, "");
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDateValue(value: unknown) {
  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    const [hourText, minuteText, secondText = "0"] = trimmed.split(":");
    return Number(hourText) * 3600 + Number(minuteText) * 60 + Number(secondText);
  }

  const normalized = trimmed.includes(" ") ? trimmed.replace(" ", "T") : trimmed;
  const parsed = Date.parse(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeTextValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function compareValues(left: unknown, right: unknown, type: TableSortType) {
  if (type === "text") {
    return normalizeTextValue(left).localeCompare(normalizeTextValue(right), "zh-CN", {
      numeric: true,
      sensitivity: "base",
    });
  }

  const normalizedLeft =
    type === "number" || type === "currency" ? normalizeNumericValue(left, type) : normalizeDateValue(left);
  const normalizedRight =
    type === "number" || type === "currency" ? normalizeNumericValue(right, type) : normalizeDateValue(right);

  if (normalizedLeft === null && normalizedRight === null) {
    return 0;
  }
  if (normalizedLeft === null) {
    return 1;
  }
  if (normalizedRight === null) {
    return -1;
  }

  return normalizedLeft - normalizedRight;
}

export function getNextTableSortState<ColumnId extends string>(
  current: TableSortState<ColumnId>,
  columnId: ColumnId,
): TableSortState<ColumnId> {
  if (!current || current.columnId !== columnId) {
    return { columnId, direction: "asc" };
  }

  return {
    columnId,
    direction: current.direction === "asc" ? "desc" : "asc",
  };
}

export function sortTableRows<Row, ColumnId extends string>(
  rows: Row[],
  sortState: TableSortState<ColumnId>,
  sortConfigs: Partial<Record<ColumnId, TableSortConfig<Row>>>,
) {
  if (!sortState) {
    return rows;
  }

  const sortConfig = sortConfigs[sortState.columnId];
  if (!sortConfig) {
    return rows;
  }

  return rows
    .map((row, index) => ({ row, index }))
    .sort((left, right) => {
      const comparison = compareValues(sortConfig.getValue(left.row), sortConfig.getValue(right.row), sortConfig.type);
      if (comparison === 0) {
        return left.index - right.index;
      }

      return sortState.direction === "asc" ? comparison : -comparison;
    })
    .map((item) => item.row);
}

export function useTableColumnResize({
  state,
  applyState,
  minWidth = 80,
}: {
  state: ColumnSettingsState;
  applyState: (state: ColumnSettingsState) => void;
  minWidth?: number;
}) {
  const latestStateRef = useRef(state);
  const resizeSessionRef = useRef<{ columnId: string; startX: number; startWidth: number } | null>(null);
  const [dragWidths, setDragWidths] = useState<Record<string, number>>({});
  const dragWidthsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  useEffect(() => {
    dragWidthsRef.current = dragWidths;
  }, [dragWidths]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  function finishResize(columnId: string, width: number) {
    applyState({
      ...latestStateRef.current,
      widths: {
        ...latestStateRef.current.widths,
        [columnId]: Math.max(minWidth, Math.round(width)),
      },
    });
    setDragWidths((current) => {
      const next = { ...current };
      delete next[columnId];
      return next;
    });
  }

  function beginResize(event: ReactMouseEvent<HTMLDivElement>, columnId: string, currentWidth: number) {
    event.preventDefault();
    event.stopPropagation();

    resizeSessionRef.current = {
      columnId,
      startX: event.clientX,
      startWidth: currentWidth,
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handlePointerMove = (moveEvent: MouseEvent) => {
      const session = resizeSessionRef.current;
      if (!session) {
        return;
      }

      const nextWidth = Math.max(minWidth, session.startWidth + moveEvent.clientX - session.startX);
      setDragWidths((current) => ({
        ...current,
        [session.columnId]: Math.round(nextWidth),
      }));
    };

    const handlePointerUp = () => {
      const session = resizeSessionRef.current;
      resizeSessionRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);

      if (!session) {
        return;
      }

      const finalWidth = dragWidthsRef.current[session.columnId] ?? session.startWidth;
      finishResize(session.columnId, finalWidth);
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
  }

  function getWidth(field: ColumnSettingsField) {
    return dragWidths[field.id] ?? state.widths[field.id] ?? field.width ?? minWidth;
  }

  return {
    beginResize,
    getWidth,
    widths: {
      ...state.widths,
      ...dragWidths,
    },
  };
}

export function TableHeaderCell({
  label,
  width,
  left,
  isFixed,
  align = "left",
  sortable = false,
  showDivider = true,
  sortDirection,
  onToggleSort,
  onResizeStart,
}: {
  label: string;
  width: number;
  left?: number;
  isFixed: boolean;
  align?: "left" | "right";
  sortable?: boolean;
  showDivider?: boolean;
  sortDirection?: TableSortDirection;
  onToggleSort?: () => void;
  onResizeStart?: (event: ReactMouseEvent<HTMLDivElement>) => void;
}) {
  return (
    <th
      className={cn(align === "right" && "text-right", isFixed && "table-fixed-cell is-header")}
      style={{
        width,
        minWidth: width,
        left,
      }}
      aria-sort={!sortable ? undefined : sortDirection === "asc" ? "ascending" : sortDirection === "desc" ? "descending" : "none"}
    >
      <div className={cn("table-header-cell", align === "right" && "is-right")}>
        {sortable ? (
          <button type="button" className={cn("table-sort-trigger", align === "right" && "is-right")} onClick={onToggleSort}>
            <span className="truncate">{label}</span>
            <span className="table-sort-icons" aria-hidden="true">
              <ChevronUp className={cn("h-3.5 w-3.5 -mb-0.5", sortDirection === "asc" ? "text-primary" : "text-text-placeholder")} strokeWidth={2.1} />
              <ChevronDown className={cn("h-3.5 w-3.5 -mt-0.5", sortDirection === "desc" ? "text-primary" : "text-text-placeholder")} strokeWidth={2.1} />
            </span>
          </button>
        ) : (
          <div className={cn("table-sort-trigger pointer-events-none", align === "right" && "is-right")}>
            <span className="truncate">{label}</span>
          </div>
        )}
        {onResizeStart ? (
          <div
            role="separator"
            aria-orientation="vertical"
            className="table-resize-handle"
            onMouseDown={onResizeStart}
          />
        ) : null}
      </div>
    </th>
  );
}
