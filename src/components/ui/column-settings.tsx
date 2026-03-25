import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, GripVertical, Pin, RotateCcw } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "./button";
import { Modal } from "./modal";
import { SegmentedControl } from "./segmented-control";

export type TableDensity = "compact" | "medium" | "relaxed";

export type ColumnSettingsField = {
  id: string;
  label: string;
  group: string;
  width?: number;
  required?: boolean;
  defaultVisible?: boolean;
  defaultFixed?: boolean;
};

export type ColumnSettingsState = {
  order: string[];
  visible: string[];
  fixed: string[];
  density: TableDensity;
  widths: Record<string, number>;
};

type PersistedColumnSettingsOptions = {
  storageKey: string;
  fields: ColumnSettingsField[];
  defaultDensity?: TableDensity;
  maxFixedCount?: number;
};

type ColumnSettingsModalProps = {
  open: boolean;
  title: string;
  fields: ColumnSettingsField[];
  state: ColumnSettingsState;
  defaultState: ColumnSettingsState;
  onClose: () => void;
  onApply: (state: ColumnSettingsState) => void;
  maxFixedCount?: number;
  densityLabel?: string;
};

const densityOptions: Array<{ label: string; value: TableDensity }> = [
  { label: "紧凑", value: "compact" },
  { label: "中等", value: "medium" },
  { label: "宽松", value: "relaxed" },
];

function uniqueIds(values: string[]) {
  return Array.from(new Set(values));
}

function buildDefaultVisibleIds(fields: ColumnSettingsField[]) {
  return fields.filter((field) => field.required || field.defaultVisible !== false).map((field) => field.id);
}

function buildDefaultFixedIds(fields: ColumnSettingsField[], visibleIds: string[], maxFixedCount: number) {
  const visibleSet = new Set(visibleIds);
  const defaultFixedSet = new Set(fields.filter((field) => field.defaultFixed).map((field) => field.id));
  const leadingVisible = fields
    .map((field) => field.id)
    .filter((id) => visibleSet.has(id));

  let fixedCount = 0;
  for (const id of leadingVisible) {
    if (defaultFixedSet.has(id) && fixedCount < maxFixedCount) {
      fixedCount += 1;
      continue;
    }
    break;
  }

  return leadingVisible.slice(0, fixedCount);
}

function buildDefaultWidths(fields: ColumnSettingsField[]) {
  return Object.fromEntries(
    fields
      .filter((field) => typeof field.width === "number" && Number.isFinite(field.width))
      .map((field) => [field.id, Math.max(80, Math.round(field.width as number))]),
  );
}

export function getDefaultColumnSettings(
  fields: ColumnSettingsField[],
  defaultDensity: TableDensity = "medium",
  maxFixedCount = 7,
): ColumnSettingsState {
  const order = fields.map((field) => field.id);
  const visible = buildDefaultVisibleIds(fields);
  const fixed = buildDefaultFixedIds(fields, visible, maxFixedCount);

  return {
    order,
    visible,
    fixed,
    density: defaultDensity,
    widths: buildDefaultWidths(fields),
  };
}

export function normalizeColumnSettings(
  state: ColumnSettingsState,
  fields: ColumnSettingsField[],
  defaultDensity: TableDensity = "medium",
  maxFixedCount = 7,
) {
  const fieldIds = fields.map((field) => field.id);
  const fieldIdSet = new Set(fieldIds);
  const requiredIds = fields.filter((field) => field.required).map((field) => field.id);
  const defaultState = getDefaultColumnSettings(fields, defaultDensity, maxFixedCount);

  const order = uniqueIds((state.order ?? []).filter((id) => fieldIdSet.has(id)));
  for (const id of fieldIds) {
    if (!order.includes(id)) {
      order.push(id);
    }
  }

  const requestedVisible = uniqueIds((state.visible ?? []).filter((id) => fieldIdSet.has(id)));
  const visible = requestedVisible.length > 0 ? requestedVisible : defaultState.visible;
  for (const id of requiredIds) {
    if (!visible.includes(id)) {
      visible.push(id);
    }
  }

  const selectedOrder = order.filter((id) => visible.includes(id));
  const requestedFixed = uniqueIds((state.fixed ?? []).filter((id) => selectedOrder.includes(id)));
  let fixedCount = 0;
  for (const id of selectedOrder) {
    if (requestedFixed.includes(id) && fixedCount < maxFixedCount) {
      fixedCount += 1;
      continue;
    }
    break;
  }

  const defaultWidths = buildDefaultWidths(fields);
  const widths = Object.entries(state.widths ?? {}).reduce<Record<string, number>>((result, [id, width]) => {
    if (!fieldIdSet.has(id)) {
      return result;
    }

    const numericWidth = typeof width === "number" ? width : Number(width);
    if (!Number.isFinite(numericWidth)) {
      return result;
    }

    result[id] = Math.max(80, Math.round(numericWidth));
    return result;
  }, {});

  for (const [id, width] of Object.entries(defaultWidths)) {
    if (!(id in widths)) {
      widths[id] = width;
    }
  }

  return {
    order,
    visible,
    fixed: selectedOrder.slice(0, fixedCount),
    density: state.density ?? defaultDensity,
    widths,
  } satisfies ColumnSettingsState;
}

export function usePersistedColumnSettings({
  storageKey,
  fields,
  defaultDensity = "medium",
  maxFixedCount = 7,
}: PersistedColumnSettingsOptions) {
  const defaultState = useMemo(
    () => getDefaultColumnSettings(fields, defaultDensity, maxFixedCount),
    [defaultDensity, fields, maxFixedCount],
  );
  const [state, setState] = useState<ColumnSettingsState>(defaultState);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setState(defaultState);
        return;
      }

      const parsed = JSON.parse(raw) as ColumnSettingsState;
      setState(normalizeColumnSettings(parsed, fields, defaultDensity, maxFixedCount));
    } catch {
      setState(defaultState);
    }
  }, [defaultDensity, defaultState, fields, maxFixedCount, storageKey]);

  const applyState = useCallback(
    (nextState: ColumnSettingsState) => {
      const normalized = normalizeColumnSettings(nextState, fields, defaultDensity, maxFixedCount);
      setState(normalized);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, JSON.stringify(normalized));
      }
    },
    [defaultDensity, fields, maxFixedCount, storageKey],
  );

  const resetState = useCallback(() => {
    applyState(defaultState);
  }, [applyState, defaultState]);

  return {
    state,
    defaultState,
    applyState,
    resetState,
  };
}

export function getDensityClassName(density: TableDensity) {
  if (density === "compact") {
    return "table-density-compact";
  }
  if (density === "relaxed") {
    return "table-density-relaxed";
  }
  return "table-density-medium";
}

export function getColumnWidth(field: ColumnSettingsField, state: ColumnSettingsState) {
  return state.widths[field.id] ?? field.width ?? 120;
}

export function ColumnSettingsModal({
  open,
  title,
  fields,
  state,
  defaultState,
  onClose,
  onApply,
  maxFixedCount = 7,
  densityLabel = "表格行高",
}: ColumnSettingsModalProps) {
  const [draft, setDraft] = useState<ColumnSettingsState>(state);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraft(state);
    setDraggingId(null);
  }, [open, state]);

  const normalizedDraft = useMemo(
    () => normalizeColumnSettings(draft, fields, draft.density, maxFixedCount),
    [draft, fields, maxFixedCount],
  );

  const fieldMap = useMemo(() => new Map(fields.map((field) => [field.id, field])), [fields]);
  const groupedFields = useMemo(() => {
    const groups = new Map<string, ColumnSettingsField[]>();
    const fallbackGroup = fields.find((field) => field.group !== "系统字段")?.group ?? "默认字段";

    fields.forEach((field) => {
      const groupName = field.group === "系统字段" ? fallbackGroup : field.group;
      const bucket = groups.get(groupName) ?? [];
      bucket.push(field);
      groups.set(groupName, bucket);
    });

    return Array.from(groups.entries()).map(([group, items]) => ({ group, items }));
  }, [fields]);

  const visibleSet = new Set(normalizedDraft.visible);
  const selectedOrder = normalizedDraft.order.filter((id) => visibleSet.has(id));
  const fixedSet = new Set(normalizedDraft.fixed);
  const optionalFields = fields.filter((field) => !field.required);
  const allOptionalSelected = optionalFields.every((field) => visibleSet.has(field.id));

  function updateDraft(nextState: ColumnSettingsState) {
    setDraft(normalizeColumnSettings(nextState, fields, nextState.density, maxFixedCount));
  }

  function updateVisible(fieldId: string, checked: boolean) {
    updateDraft({
      ...normalizedDraft,
      visible: checked
        ? [...normalizedDraft.visible, fieldId]
        : normalizedDraft.visible.filter((id) => id !== fieldId),
    });
  }

  function toggleAll() {
    updateDraft({
      ...normalizedDraft,
      visible: allOptionalSelected ? fields.filter((field) => field.required).map((field) => field.id) : fields.map((field) => field.id),
    });
  }

  function toggleGroup(groupItems: ColumnSettingsField[]) {
    const optionalGroupIds = groupItems.filter((field) => !field.required).map((field) => field.id);
    const allSelected = optionalGroupIds.every((id) => visibleSet.has(id));
    const nextVisibleSet = new Set(normalizedDraft.visible);

    optionalGroupIds.forEach((id) => {
      if (allSelected) {
        nextVisibleSet.delete(id);
      } else {
        nextVisibleSet.add(id);
      }
    });

    updateDraft({
      ...normalizedDraft,
      visible: Array.from(nextVisibleSet),
    });
  }

  function moveItem(dragId: string, targetId: string) {
    if (dragId === targetId) {
      return;
    }

    const nextOrder = normalizedDraft.order.filter((id) => id !== dragId);
    const targetIndex = nextOrder.indexOf(targetId);
    nextOrder.splice(targetIndex, 0, dragId);

    updateDraft({
      ...normalizedDraft,
      order: nextOrder,
    });
  }

  function setFixedCount(nextCount: number) {
    updateDraft({
      ...normalizedDraft,
      fixed: selectedOrder.slice(0, Math.min(Math.max(nextCount, 0), maxFixedCount)),
    });
  }

  function toggleFixed(fieldId: string) {
    const index = selectedOrder.indexOf(fieldId);
    const currentFixedCount = normalizedDraft.fixed.length;

    if (index === -1) {
      return;
    }

    if (index < currentFixedCount) {
      setFixedCount(index);
      return;
    }

    setFixedCount(index + 1);
  }

  function restoreDefault() {
    setDraft(defaultState);
  }

  return (
    <Modal
      open={open}
      title={title}
      widthClassName="w-full max-w-[min(100%,940px)] max-h-[78vh]"
      onClose={onClose}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-small text-text-muted">{densityLabel}</div>
            <SegmentedControl
              items={densityOptions}
              value={normalizedDraft.density}
              onChange={(value) => updateDraft({ ...normalizedDraft, density: value })}
            />
          </div>
        </div>

        <div className="column-settings-layout">
          <div className="column-settings-main">
            <div className="column-settings-bulk-bar">
              <label className="flex items-center gap-2 text-body text-text-primary">
                <input checked={allOptionalSelected} onChange={toggleAll} type="checkbox" />
                全选
              </label>
              <span className="text-small text-text-muted">已显示{selectedOrder.length}项</span>
            </div>

            <div className="mt-4 space-y-5">
              {groupedFields.map((group) => {
                const optionalGroupIds = group.items.filter((field) => !field.required).map((field) => field.id);
                const allGroupSelected = optionalGroupIds.length > 0 && optionalGroupIds.every((id) => visibleSet.has(id));

                return (
                  <section key={group.group} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-2 w-2 rounded-full bg-border-strong" />
                      <span className="text-body text-text-primary">{group.group}</span>
                      {optionalGroupIds.length > 0 ? (
                        <button
                          type="button"
                          className="text-link text-small hover:text-link-hover"
                          onClick={() => toggleGroup(group.items)}
                        >
                          {allGroupSelected ? "取消全选" : "全选"}
                        </button>
                      ) : null}
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                      {group.items.map((field) => {
                        const checked = visibleSet.has(field.id);
                        return (
                          <label key={field.id} className="column-settings-option">
                            <input
                              checked={checked}
                              disabled={field.required}
                              type="checkbox"
                              onChange={(event) => updateVisible(field.id, event.target.checked)}
                            />
                            <span className="truncate">{field.label}</span>
                            {field.required ? <span className="text-mini text-text-muted">必选</span> : null}
                          </label>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>

          <aside className="column-settings-sidebar">
            <div>
              <div>
                <div className="text-section-title font-section-title text-text-primary">已选({selectedOrder.length})</div>
                <div className="mt-1 text-small text-text-muted">最多可固定{maxFixedCount}项，固定列按左侧连续冻结。</div>
              </div>
            </div>

            <div className="column-settings-selected-list">
              {selectedOrder.map((fieldId, index) => {
                const field = fieldMap.get(fieldId);
                if (!field) {
                  return null;
                }

                const isFixed = fixedSet.has(fieldId);

                return (
                  <div
                    key={fieldId}
                    draggable
                    className={cn("column-settings-selected-item", draggingId === fieldId && "is-dragging")}
                    onDragStart={() => setDraggingId(fieldId)}
                    onDragOver={(event) => event.preventDefault()}
                    onDragEnd={() => setDraggingId(null)}
                    onDrop={() => {
                      if (draggingId) {
                        moveItem(draggingId, fieldId);
                      }
                      setDraggingId(null);
                    }}
                  >
                    <GripVertical aria-hidden="true" strokeWidth={1.8} className="h-4 w-4 text-text-muted" />
                    <span className="w-6 text-right text-small text-text-muted">{index + 1}</span>
                    <span className="flex-1 truncate text-body text-text-primary">{field.label}</span>
                    <button
                      type="button"
                      className={cn("column-settings-pin", isFixed && "is-fixed")}
                      onClick={() => toggleFixed(fieldId)}
                    >
                      <Pin aria-hidden="true" strokeWidth={1.8} className="h-3.5 w-3.5" />
                      <span>{isFixed ? "已固定" : "固定"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <Button onClick={restoreDefault}>
            <RotateCcw aria-hidden="true" strokeWidth={1.8} className="h-4 w-4" />
            恢复默认
          </Button>
          <div className="flex gap-2">
            <Button onClick={onClose}>取消</Button>
            <Button
              variant="primary"
              onClick={() => {
                onApply(normalizedDraft);
                onClose();
              }}
            >
              <Check aria-hidden="true" strokeWidth={1.8} className="h-4 w-4" />
              保存并应用
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
