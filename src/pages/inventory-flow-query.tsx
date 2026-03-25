import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ChevronDown, Settings2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  type ColumnSettingsField,
  ColumnSettingsModal,
  getDensityClassName,
  usePersistedColumnSettings,
} from "../components/ui/column-settings";
import { ExceptionState } from "../components/ui/exception-state";
import { HorizontalScrollArea } from "../components/ui/horizontal-scroll-area";
import { DemoToolbar } from "../components/ui/demo-toolbar";
import { IconActionButton } from "../components/ui/icon-action-button";
import { Input } from "../components/ui/input";
import { ListPageMainCard, ListPageToolbar } from "../components/ui/list-page-layout";
import { Pagination } from "../components/ui/pagination";
import { PageHeader } from "../components/ui/page-header";
import { getVisibleQuerySectionItems, hasCollapsedQuerySectionItems } from "../components/ui/query-section";
import { Select } from "../components/ui/select";
import {
  getNextTableSortState,
  sortTableRows,
  TableHeaderCell,
  type TableSortConfig,
  type TableSortState,
  type TableSortType,
  useTableColumnResize,
} from "../components/ui/table-interactions";
import { inventoryFlowRecords, type InventoryFlowActionType, type InventoryFlowRecord } from "../data/inventory-flow-query";

type InventoryFlowFilters = {
  startTime: string;
  endTime: string;
  operator: string;
  owner: string;
  warehouse: string;
  itemCode: string;
  barcode: string;
  itemName: string;
  categoryLarge: string;
  categoryMedium: string;
  categorySmall: string;
  businessNo: string;
  documentType: string;
  actionType: string;
};

type InventoryFlowFilterKey =
  | "operationTime"
  | "operator"
  | "owner"
  | "warehouse"
  | "itemCode"
  | "barcode"
  | "itemName"
  | "categoryLarge"
  | "categoryMedium"
  | "categorySmall"
  | "businessNo"
  | "documentType"
  | "actionType";

type InventoryFlowColumnId =
  | "operationTime"
  | "operator"
  | "owner"
  | "warehouse"
  | "itemCode"
  | "barcodes"
  | "itemName"
  | "categoryLarge"
  | "categoryMedium"
  | "categorySmall"
  | "businessNo"
  | "documentType"
  | "actionType"
  | "totalChange"
  | "totalBefore"
  | "totalAfter"
  | "availableChange"
  | "availableBefore"
  | "availableAfter"
  | "reservedChange"
  | "reservedBefore"
  | "reservedAfter"
  | "frozenChange"
  | "frozenBefore"
  | "frozenAfter";

type InventoryFlowScenario = "normal" | "loading" | "no-result" | "no-auth";

const defaultFilters: InventoryFlowFilters = {
  startTime: "",
  endTime: "",
  operator: "",
  owner: "全部",
  warehouse: "全部",
  itemCode: "",
  barcode: "",
  itemName: "",
  categoryLarge: "全部",
  categoryMedium: "全部",
  categorySmall: "全部",
  businessNo: "",
  documentType: "全部",
  actionType: "全部",
};

const pageSizeOptions = [20, 50, 100];

const inventoryFlowTabs = [
  { label: "正常", value: "normal" },
  { label: "加载中", value: "loading" },
  { label: "查询无结果", value: "no-result" },
  { label: "无权限", value: "no-auth" },
] as const;

const inventoryFlowFilterDefinitions: Array<{ key: InventoryFlowFilterKey; queryColumns?: 1 | 2 }> = [
  { key: "operationTime", queryColumns: 2 },
  { key: "operator" },
  { key: "owner" },
  { key: "warehouse" },
  { key: "itemCode" },
  { key: "barcode" },
  { key: "itemName" },
  { key: "categoryLarge" },
  { key: "categoryMedium" },
  { key: "categorySmall" },
  { key: "businessNo" },
  { key: "documentType" },
  { key: "actionType" },
];

function buildOptions(values: string[]) {
  return [{ label: "全部", value: "全部" }, ...values.map((value) => ({ label: value, value }))];
}

function includesText(source: string, target: string) {
  if (!target.trim()) {
    return true;
  }

  return source.toLowerCase().includes(target.trim().toLowerCase());
}

function numberText(value: number) {
  return value.toLocaleString("zh-CN");
}

function signedNumberText(value: number) {
  if (value > 0) {
    return `+${numberText(value)}`;
  }
  if (value < 0) {
    return `-${numberText(Math.abs(value))}`;
  }
  return "0";
}

function toDateTimeValue(value: string) {
  return value ? value.replace(" ", "T").slice(0, 16) : "";
}

function toTimestampValue(value: string) {
  return value ? `${value.replace("T", " ")}:00` : "";
}

function isInTimeRange(operationTime: string, startTime: string, endTime: string) {
  if (!startTime && !endTime) {
    return true;
  }

  const current = new Date(operationTime.replace(" ", "T"));
  if (Number.isNaN(current.getTime())) {
    return false;
  }

  if (startTime) {
    const start = new Date(startTime.replace(" ", "T"));
    if (current < start) {
      return false;
    }
  }

  if (endTime) {
    const end = new Date(endTime.replace(" ", "T"));
    if (current > end) {
      return false;
    }
  }

  return true;
}

function actionToneClass(actionType: InventoryFlowActionType) {
  if (actionType === "增加" || actionType === "释放" || actionType === "解冻") {
    return "text-success";
  }
  if (actionType === "预占" || actionType === "冻结") {
    return "text-warning";
  }
  return "text-danger";
}

function signedToneClass(value: number) {
  if (value > 0) {
    return "text-success";
  }
  if (value < 0) {
    return "text-danger";
  }
  return "text-text-secondary";
}

export function InventoryFlowQueryPage({
  onCreateExportTask,
}: {
  onCreateExportTask: (payload: { recordCount: number }) => void;
}) {
  const [draftFilters, setDraftFilters] = useState<InventoryFlowFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<InventoryFlowFilters>(defaultFilters);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [scenario, setScenario] = useState<InventoryFlowScenario>("normal");
  const [sortState, setSortState] = useState<TableSortState<InventoryFlowColumnId>>({
    columnId: "operationTime",
    direction: "desc",
  });

  const inventoryFlowColumns = useMemo(
    () =>
      [
        { id: "operationTime", label: "操作时间", group: "基础信息", required: true, defaultFixed: true, width: 168, sortType: "datetime" as TableSortType, getSortValue: (row: InventoryFlowRecord) => row.operationTime },
        { id: "operator", label: "操作人", group: "基础信息", required: true, defaultFixed: true, width: 100 },
        { id: "owner", label: "货主", group: "基础信息", required: true, defaultFixed: true, width: 280 },
        { id: "warehouse", label: "仓库", group: "基础信息", required: true, width: 320 },
        { id: "itemCode", label: "商品编码", group: "商品信息", width: 140 },
        { id: "barcodes", label: "商品条码", group: "商品信息", width: 220 },
        { id: "itemName", label: "商品名称", group: "商品信息", width: 180 },
        { id: "categoryLarge", label: "商品大类", group: "商品信息", width: 160 },
        { id: "categoryMedium", label: "商品中类", group: "商品信息", width: 160 },
        { id: "categorySmall", label: "商品小类", group: "商品信息", width: 160 },
        { id: "businessNo", label: "业务单号", group: "业务信息", width: 170 },
        { id: "documentType", label: "单据类型", group: "业务信息", width: 140 },
        { id: "actionType", label: "动作类型", group: "业务信息", width: 100 },
        { id: "totalChange", label: "总库存变动", group: "数量信息", width: 126, align: "right" as const, sortType: "number" as TableSortType, getSortValue: (row: InventoryFlowRecord) => row.totalChange },
        { id: "totalBefore", label: "总库存变动前", group: "数量信息", width: 136, align: "right" as const, sortType: "number" as TableSortType, getSortValue: (row: InventoryFlowRecord) => row.totalBefore },
        { id: "totalAfter", label: "总库存变动后", group: "数量信息", width: 136, align: "right" as const, sortType: "number" as TableSortType, getSortValue: (row: InventoryFlowRecord) => row.totalAfter },
        { id: "availableChange", label: "可用库存变动", group: "数量信息", width: 126, align: "right" as const, sortType: "number" as TableSortType, getSortValue: (row: InventoryFlowRecord) => row.availableChange },
        { id: "availableBefore", label: "可用库存变动前", group: "数量信息", width: 136, align: "right" as const, sortType: "number" as TableSortType, getSortValue: (row: InventoryFlowRecord) => row.availableBefore },
        { id: "availableAfter", label: "可用库存变动后", group: "数量信息", width: 136, align: "right" as const, sortType: "number" as TableSortType, getSortValue: (row: InventoryFlowRecord) => row.availableAfter },
        { id: "reservedChange", label: "预占库存变动", group: "数量信息", width: 126, align: "right" as const, sortType: "number" as TableSortType, getSortValue: (row: InventoryFlowRecord) => row.reservedChange },
        { id: "reservedBefore", label: "预占库存变动前", group: "数量信息", width: 136, align: "right" as const, sortType: "number" as TableSortType, getSortValue: (row: InventoryFlowRecord) => row.reservedBefore },
        { id: "reservedAfter", label: "预占库存变动后", group: "数量信息", width: 136, align: "right" as const, sortType: "number" as TableSortType, getSortValue: (row: InventoryFlowRecord) => row.reservedAfter },
        { id: "frozenChange", label: "冻结库存变动", group: "数量信息", width: 126, align: "right" as const, sortType: "number" as TableSortType, getSortValue: (row: InventoryFlowRecord) => row.frozenChange },
        { id: "frozenBefore", label: "冻结库存变动前", group: "数量信息", width: 136, align: "right" as const, sortType: "number" as TableSortType, getSortValue: (row: InventoryFlowRecord) => row.frozenBefore },
        { id: "frozenAfter", label: "冻结库存变动后", group: "数量信息", width: 136, align: "right" as const, sortType: "number" as TableSortType, getSortValue: (row: InventoryFlowRecord) => row.frozenAfter },
      ] satisfies Array<ColumnSettingsField & { id: InventoryFlowColumnId; width: number; align?: "left" | "right"; sortType?: TableSortType; getSortValue?: (row: InventoryFlowRecord) => unknown }>,
    [],
  );

  const {
    state: inventoryFlowColumnState,
    defaultState: inventoryFlowDefaultColumnState,
    applyState: applyInventoryFlowColumnState,
  } = usePersistedColumnSettings({
    storageKey: "column-settings:demo-user:inventory-flow-query",
    fields: inventoryFlowColumns,
    defaultDensity: "medium",
  });
  const { beginResize, widths: columnWidths } = useTableColumnResize({
    state: inventoryFlowColumnState,
    applyState: applyInventoryFlowColumnState,
  });

  const visibleColumns = useMemo(() => {
    return inventoryFlowColumnState.order
      .filter((id) => inventoryFlowColumnState.visible.includes(id))
      .map((id) => inventoryFlowColumns.find((column) => column.id === id))
      .filter((column): column is (typeof inventoryFlowColumns)[number] => Boolean(column));
  }, [inventoryFlowColumnState.order, inventoryFlowColumnState.visible, inventoryFlowColumns]);

  const fixedLeftMap = useMemo(() => {
    const fixedSet = new Set(inventoryFlowColumnState.fixed);
    const leftMap = new Map<string, number>();
    let left = 0;

    visibleColumns.forEach((column) => {
      if (!fixedSet.has(column.id)) {
        return;
      }

      leftMap.set(column.id, left);
      left += columnWidths[column.id] ?? column.width;
    });

    return leftMap;
  }, [columnWidths, inventoryFlowColumnState.fixed, visibleColumns]);

  const ownerOptions = useMemo(
    () => buildOptions(Array.from(new Set(inventoryFlowRecords.map((item) => item.owner)))),
    [],
  );
  const warehouseOptions = useMemo(
    () => buildOptions(Array.from(new Set(inventoryFlowRecords.map((item) => item.warehouse)))),
    [],
  );
  const largeCategoryOptions = useMemo(
    () => buildOptions(Array.from(new Set(inventoryFlowRecords.map((item) => item.categoryLarge)))),
    [],
  );
  const mediumCategoryOptions = useMemo(
    () => buildOptions(Array.from(new Set(inventoryFlowRecords.map((item) => item.categoryMedium)))),
    [],
  );
  const smallCategoryOptions = useMemo(
    () => buildOptions(Array.from(new Set(inventoryFlowRecords.map((item) => item.categorySmall)))),
    [],
  );
  const documentTypeOptions = useMemo(
    () => buildOptions(Array.from(new Set(inventoryFlowRecords.map((item) => item.documentType)))),
    [],
  );
  const actionTypeOptions = useMemo(
    () => buildOptions(Array.from(new Set(inventoryFlowRecords.map((item) => item.actionType)))),
    [],
  );

  const visibleFilterKeys = getVisibleQuerySectionItems(inventoryFlowFilterDefinitions, showMoreFilters).map((filter) => filter.key);
  const visibleFilterKeySet = new Set<InventoryFlowFilterKey>(visibleFilterKeys);
  const hasCollapsedFilters = hasCollapsedQuerySectionItems(inventoryFlowFilterDefinitions);
  const sortConfigs = useMemo(
    () =>
      inventoryFlowColumns.reduce<Partial<Record<InventoryFlowColumnId, TableSortConfig<InventoryFlowRecord>>>>((configs, column) => {
        if (!column.sortType || !column.getSortValue) {
          return configs;
        }

        configs[column.id] = {
          type: column.sortType,
          getValue: column.getSortValue,
        };
        return configs;
      }, {}),
    [inventoryFlowColumns],
  );

  const filteredRows = useMemo(() => {
    return inventoryFlowRecords.filter((row) => {
      if (!isInTimeRange(row.operationTime, appliedFilters.startTime, appliedFilters.endTime)) {
        return false;
      }
      if (appliedFilters.owner !== "全部" && row.owner !== appliedFilters.owner) {
        return false;
      }
      if (appliedFilters.warehouse !== "全部" && row.warehouse !== appliedFilters.warehouse) {
        return false;
      }
      if (appliedFilters.categoryLarge !== "全部" && row.categoryLarge !== appliedFilters.categoryLarge) {
        return false;
      }
      if (appliedFilters.categoryMedium !== "全部" && row.categoryMedium !== appliedFilters.categoryMedium) {
        return false;
      }
      if (appliedFilters.categorySmall !== "全部" && row.categorySmall !== appliedFilters.categorySmall) {
        return false;
      }
      if (appliedFilters.documentType !== "全部" && row.documentType !== appliedFilters.documentType) {
        return false;
      }
      if (appliedFilters.actionType !== "全部" && row.actionType !== appliedFilters.actionType) {
        return false;
      }

      return (
        includesText(row.operator, appliedFilters.operator) &&
        includesText(row.itemCode, appliedFilters.itemCode) &&
        includesText(row.barcodes, appliedFilters.barcode) &&
        includesText(row.itemName, appliedFilters.itemName) &&
        includesText(row.businessNo, appliedFilters.businessNo)
      );
    });
  }, [appliedFilters]);

  const sortedRows = useMemo(() => sortTableRows(filteredRows, sortState, sortConfigs), [filteredRows, sortConfigs, sortState]);
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const normalizedPage = Math.min(page, totalPages);
  const pagedRows = sortedRows.slice((normalizedPage - 1) * pageSize, normalizedPage * pageSize);

  function updateFilter<K extends keyof InventoryFlowFilters>(key: K, value: InventoryFlowFilters[K]) {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  }

  function handleQuery() {
    setAppliedFilters(draftFilters);
    setPage(1);
    const nextRows = inventoryFlowRecords.filter((row) => {
      if (!isInTimeRange(row.operationTime, draftFilters.startTime, draftFilters.endTime)) {
        return false;
      }
      if (draftFilters.owner !== "全部" && row.owner !== draftFilters.owner) {
        return false;
      }
      if (draftFilters.warehouse !== "全部" && row.warehouse !== draftFilters.warehouse) {
        return false;
      }
      if (draftFilters.categoryLarge !== "全部" && row.categoryLarge !== draftFilters.categoryLarge) {
        return false;
      }
      if (draftFilters.categoryMedium !== "全部" && row.categoryMedium !== draftFilters.categoryMedium) {
        return false;
      }
      if (draftFilters.categorySmall !== "全部" && row.categorySmall !== draftFilters.categorySmall) {
        return false;
      }
      if (draftFilters.documentType !== "全部" && row.documentType !== draftFilters.documentType) {
        return false;
      }
      if (draftFilters.actionType !== "全部" && row.actionType !== draftFilters.actionType) {
        return false;
      }

      return (
        includesText(row.operator, draftFilters.operator) &&
        includesText(row.itemCode, draftFilters.itemCode) &&
        includesText(row.barcodes, draftFilters.barcode) &&
        includesText(row.itemName, draftFilters.itemName) &&
        includesText(row.businessNo, draftFilters.businessNo)
      );
    });
    setScenario(nextRows.length > 0 ? "normal" : "no-result");
  }

  function handleReset() {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setShowMoreFilters(false);
    setPage(1);
    setScenario("normal");
  }

  function handleExport() {
    onCreateExportTask({
      recordCount: filteredRows.length,
    });
  }

  function renderFlowCell(row: InventoryFlowRecord, columnId: InventoryFlowColumnId) {
    if (columnId === "operationTime") {
      return <span className="tabular-nums text-text-secondary">{row.operationTime}</span>;
    }
    if (columnId === "operator") {
      return row.operator;
    }
    if (columnId === "owner") {
      return (
        <div className="max-w-[280px] truncate" title={row.owner}>
          {row.owner}
        </div>
      );
    }
    if (columnId === "warehouse") {
      return (
        <div className="max-w-[320px] truncate" title={row.warehouse}>
          {row.warehouse}
        </div>
      );
    }
    if (columnId === "itemCode") {
      return <span className="tabular-nums text-text-primary">{row.itemCode}</span>;
    }
    if (columnId === "barcodes") {
      return (
        <div className="max-w-[220px] truncate" title={row.barcodes}>
          {row.barcodes}
        </div>
      );
    }
    if (columnId === "itemName") {
      return row.itemName;
    }
    if (columnId === "categoryLarge") {
      return row.categoryLarge;
    }
    if (columnId === "categoryMedium") {
      return row.categoryMedium;
    }
    if (columnId === "categorySmall") {
      return row.categorySmall;
    }
    if (columnId === "businessNo") {
      return <span className="tabular-nums">{row.businessNo}</span>;
    }
    if (columnId === "documentType") {
      return row.documentType;
    }
    if (columnId === "actionType") {
      return <span className={actionToneClass(row.actionType)}>{row.actionType}</span>;
    }
    if (columnId === "totalChange") {
      return <span className={`tabular-nums ${signedToneClass(row.totalChange)}`}>{signedNumberText(row.totalChange)}</span>;
    }
    if (columnId === "totalBefore") {
      return <span className="tabular-nums">{numberText(row.totalBefore)}</span>;
    }
    if (columnId === "totalAfter") {
      return <span className="tabular-nums">{numberText(row.totalAfter)}</span>;
    }
    if (columnId === "availableChange") {
      return <span className={`tabular-nums ${signedToneClass(row.availableChange)}`}>{signedNumberText(row.availableChange)}</span>;
    }
    if (columnId === "availableBefore") {
      return <span className="tabular-nums">{numberText(row.availableBefore)}</span>;
    }
    if (columnId === "availableAfter") {
      return <span className="tabular-nums">{numberText(row.availableAfter)}</span>;
    }
    if (columnId === "reservedChange") {
      return <span className={`tabular-nums ${signedToneClass(row.reservedChange)}`}>{signedNumberText(row.reservedChange)}</span>;
    }
    if (columnId === "reservedBefore") {
      return <span className="tabular-nums">{numberText(row.reservedBefore)}</span>;
    }
    if (columnId === "reservedAfter") {
      return <span className="tabular-nums">{numberText(row.reservedAfter)}</span>;
    }
    if (columnId === "frozenChange") {
      return <span className={`tabular-nums ${signedToneClass(row.frozenChange)}`}>{signedNumberText(row.frozenChange)}</span>;
    }
    if (columnId === "frozenBefore") {
      return <span className="tabular-nums">{numberText(row.frozenBefore)}</span>;
    }

    return <span className="tabular-nums">{numberText(row.frozenAfter)}</span>;
  }

  return (
    <div className="space-y-page-block">
      <DemoToolbar label="列表页" items={inventoryFlowTabs} value={scenario} onChange={setScenario} />
      <PageHeader
        title="库存流水查询"
        description="按操作时间、货主、仓库、商品和业务单号组合查询库存变动流水，重点查看总库存、可用库存、预占库存和冻结库存的变动前后。"
        actions={
          <Button variant="primary" disabled={filteredRows.length === 0} onClick={handleExport}>
            导出
          </Button>
        }
      />

      <Card>
        <div className="query-section-grid">
          {visibleFilterKeySet.has("operationTime") ? (
            <div className="xl:col-span-2">
              <div className="field-label">操作时间</div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="datetime-local"
                  value={toDateTimeValue(draftFilters.startTime)}
                  onChange={(event) => updateFilter("startTime", toTimestampValue(event.target.value))}
                />
                <Input
                  type="datetime-local"
                  value={toDateTimeValue(draftFilters.endTime)}
                  onChange={(event) => updateFilter("endTime", toTimestampValue(event.target.value))}
                />
              </div>
            </div>
          ) : null}
          {visibleFilterKeySet.has("operator") ? (
            <div>
              <div className="field-label">操作人</div>
              <Input value={draftFilters.operator} onChange={(event) => updateFilter("operator", event.target.value)} placeholder="请输入" />
            </div>
          ) : null}
          {visibleFilterKeySet.has("owner") ? (
            <div>
              <div className="field-label">货主</div>
              <Select value={draftFilters.owner} onValueChange={(value) => updateFilter("owner", value)} options={ownerOptions} />
            </div>
          ) : null}
          {visibleFilterKeySet.has("warehouse") ? (
            <div>
              <div className="field-label">仓库</div>
              <Select value={draftFilters.warehouse} onValueChange={(value) => updateFilter("warehouse", value)} options={warehouseOptions} />
            </div>
          ) : null}
          {visibleFilterKeySet.has("itemCode") ? (
            <div>
              <div className="field-label">商品编码</div>
              <Input value={draftFilters.itemCode} onChange={(event) => updateFilter("itemCode", event.target.value)} placeholder="请输入" />
            </div>
          ) : null}
          {visibleFilterKeySet.has("barcode") ? (
            <div>
              <div className="field-label">商品条码</div>
              <Input value={draftFilters.barcode} onChange={(event) => updateFilter("barcode", event.target.value)} placeholder="请输入" />
            </div>
          ) : null}
          {visibleFilterKeySet.has("itemName") ? (
            <div>
              <div className="field-label">商品名称</div>
              <Input value={draftFilters.itemName} onChange={(event) => updateFilter("itemName", event.target.value)} placeholder="请输入" />
            </div>
          ) : null}
          {visibleFilterKeySet.has("categoryLarge") ? (
            <div>
              <div className="field-label">商品大类</div>
              <Select
                value={draftFilters.categoryLarge}
                onValueChange={(value) => updateFilter("categoryLarge", value)}
                options={largeCategoryOptions}
              />
            </div>
          ) : null}
          {visibleFilterKeySet.has("categoryMedium") ? (
            <div>
              <div className="field-label">商品中类</div>
              <Select
                value={draftFilters.categoryMedium}
                onValueChange={(value) => updateFilter("categoryMedium", value)}
                options={mediumCategoryOptions}
              />
            </div>
          ) : null}
          {visibleFilterKeySet.has("categorySmall") ? (
            <div>
              <div className="field-label">商品小类</div>
              <Select
                value={draftFilters.categorySmall}
                onValueChange={(value) => updateFilter("categorySmall", value)}
                options={smallCategoryOptions}
              />
            </div>
          ) : null}
          {visibleFilterKeySet.has("businessNo") ? (
            <div>
              <div className="field-label">业务单号</div>
              <Input value={draftFilters.businessNo} onChange={(event) => updateFilter("businessNo", event.target.value)} placeholder="请输入" />
            </div>
          ) : null}
          {visibleFilterKeySet.has("documentType") ? (
            <div>
              <div className="field-label">单据类型</div>
              <Select
                value={draftFilters.documentType}
                onValueChange={(value) => updateFilter("documentType", value)}
                options={documentTypeOptions}
              />
            </div>
          ) : null}
          {visibleFilterKeySet.has("actionType") ? (
            <div>
              <div className="field-label">动作类型</div>
              <Select
                value={draftFilters.actionType}
                onValueChange={(value) => updateFilter("actionType", value)}
                options={actionTypeOptions}
              />
            </div>
          ) : null}
        </div>
        <div className="query-section-actions">
          <div className="query-section-action-group">
            {hasCollapsedFilters ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-small text-link transition hover:text-link-hover"
                onClick={() => setShowMoreFilters((value) => !value)}
              >
                <ChevronDown
                  aria-hidden="true"
                  strokeWidth={1.8}
                  className={`h-4 w-4 transition-transform ${showMoreFilters ? "rotate-180" : ""}`}
                />
                {showMoreFilters ? "收起" : "展开"}
              </button>
            ) : null}
            <Button onClick={handleReset}>重置</Button>
            <Button variant="primary" onClick={handleQuery}>
              查询
            </Button>
          </div>
        </div>
      </Card>

      {scenario === "no-auth" ? (
        <ExceptionState
          variant="403"
          description="当前用户无库存流水查询权限。请联系管理员开通库存流水菜单和数据范围权限。"
          primaryAction={<Button variant="primary">联系管理员</Button>}
          secondaryAction={<Button>返回首页</Button>}
        />
      ) : null}

      {scenario === "loading" ? (
        <Card title="加载中">
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-sm bg-bg-subtle" />
            ))}
          </div>
        </Card>
      ) : null}

      {scenario === "no-result" ? (
        <ExceptionState
          variant="404"
          title="查询无结果"
          description="当前筛选条件下没有命中库存流水记录，请调整操作时间、商品或业务单号条件后重试。"
          primaryAction={<Button variant="primary" onClick={handleReset}>重置条件</Button>}
          secondaryAction={<Button onClick={handleQuery}>重新查询</Button>}
        />
      ) : null}

      {scenario === "normal" && filteredRows.length > 0 ? (
        <ListPageMainCard>
          <ListPageToolbar className="justify-end">
            <div className="list-toolbar-group">
              <IconActionButton label="列设置" onClick={() => setColumnSettingsOpen(true)}>
                <Settings2 aria-hidden="true" strokeWidth={1.8} className="h-4 w-4" />
              </IconActionButton>
            </div>
          </ListPageToolbar>
          <HorizontalScrollArea viewportClassName={getDensityClassName(inventoryFlowColumnState.density)}>
            <table>
              <thead>
                <tr>
                  {visibleColumns.map((column, index) => {
                    const left = fixedLeftMap.get(column.id);
                    const isFixed = left !== undefined;
                    const width = columnWidths[column.id] ?? column.width;

                    return (
                      <TableHeaderCell
                        key={column.id}
                        label={column.label}
                        width={width}
                        left={left}
                        isFixed={isFixed}
                        align={column.align}
                        sortable={Boolean(column.sortType && column.getSortValue)}
                        showDivider={index < visibleColumns.length - 1}
                        sortDirection={sortState?.columnId === column.id ? sortState.direction : undefined}
                        onToggleSort={() => {
                          setSortState((current) => getNextTableSortState(current, column.id));
                          setPage(1);
                        }}
                        onResizeStart={index < visibleColumns.length - 1 ? (event) => beginResize(event, column.id, width) : undefined}
                      />
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr key={row.id}>
                    {visibleColumns.map((column, index) => {
                      const left = fixedLeftMap.get(column.id);
                      const isFixed = left !== undefined;
                      const width = columnWidths[column.id] ?? column.width;

                      return (
                        <td
                          key={column.id}
                          className={`${column.align === "right" ? "text-right" : ""} ${isFixed ? "table-fixed-cell is-body" : ""}`}
                          style={{
                            width,
                            minWidth: width,
                            left,
                          }}
                        >
                          {renderFlowCell(row, column.id)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </HorizontalScrollArea>
          <Pagination
            currentPage={normalizedPage}
            totalPages={totalPages}
            totalCount={sortedRows.length}
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            showTopBorder
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
          />
        </ListPageMainCard>
      ) : null}

      <ColumnSettingsModal
        open={columnSettingsOpen}
        title="库存流水列设置"
        fields={inventoryFlowColumns}
        state={inventoryFlowColumnState}
        defaultState={inventoryFlowDefaultColumnState}
        onClose={() => setColumnSettingsOpen(false)}
        onApply={applyInventoryFlowColumnState}
      />
    </div>
  );
}
