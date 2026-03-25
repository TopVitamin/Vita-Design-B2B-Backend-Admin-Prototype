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
import { inventoryQueryRecords, type InventoryQueryRecord } from "../data/inventory-query";

type InventoryQueryFilters = {
  owner: string;
  warehouse: string;
  itemCode: string;
  barcode: string;
  itemName: string;
  categoryLarge: string;
  categoryMedium: string;
  categorySmall: string;
};

type InventoryColumnId =
  | "owner"
  | "warehouse"
  | "itemCode"
  | "barcodes"
  | "itemName"
  | "categoryLarge"
  | "categoryMedium"
  | "categorySmall"
  | "totalQty"
  | "availableQty"
  | "reservedQty"
  | "frozenQty";

type InventoryQueryScenario = "normal" | "loading" | "no-result" | "no-auth";

type InventoryQueryFieldKey =
  | "owner"
  | "warehouse"
  | "itemCode"
  | "barcode"
  | "itemName"
  | "categoryLarge"
  | "categoryMedium"
  | "categorySmall";

const defaultFilters: InventoryQueryFilters = {
  owner: "全部",
  warehouse: "全部",
  itemCode: "",
  barcode: "",
  itemName: "",
  categoryLarge: "全部",
  categoryMedium: "全部",
  categorySmall: "全部",
};

const pageSizeOptions = [20, 50, 100];

const inventoryQueryTabs = [
  { label: "正常", value: "normal" },
  { label: "加载中", value: "loading" },
  { label: "查询无结果", value: "no-result" },
  { label: "无权限", value: "no-auth" },
] as const;

function buildOptions(values: string[]) {
  return [{ label: "全部", value: "全部" }, ...values.map((value) => ({ label: value, value }))];
}

function numberText(value: number) {
  return value.toLocaleString("zh-CN");
}

function includesText(source: string, target: string) {
  if (!target.trim()) {
    return true;
  }

  return source.toLowerCase().includes(target.trim().toLowerCase());
}

export function InventoryQueryPage({
  onCreateExportTask,
}: {
  onCreateExportTask: (payload: { recordCount: number }) => void;
}) {
  const [draftFilters, setDraftFilters] = useState<InventoryQueryFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<InventoryQueryFilters>(defaultFilters);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [scenario, setScenario] = useState<InventoryQueryScenario>("normal");
  const [sortState, setSortState] = useState<TableSortState<InventoryColumnId>>(null);

  const inventoryColumns = useMemo(
    () =>
      [
        { id: "owner", label: "货主", group: "基础信息", required: true, defaultFixed: true, width: 220 },
        { id: "warehouse", label: "仓库", group: "基础信息", required: true, defaultFixed: true, width: 260 },
        { id: "itemCode", label: "商品编码", group: "基础信息", required: true, defaultFixed: true, width: 136 },
        { id: "barcodes", label: "商品条码", group: "基础信息", width: 180 },
        { id: "itemName", label: "商品名称", group: "基础信息", width: 180 },
        { id: "categoryLarge", label: "商品大类", group: "品类信息", width: 150 },
        { id: "categoryMedium", label: "商品中类", group: "品类信息", width: 150 },
        { id: "categorySmall", label: "商品小类", group: "品类信息", width: 150 },
        { id: "totalQty", label: "总数量", group: "数量信息", width: 108, defaultFixed: true, align: "right" as const, sortType: "number" as TableSortType, getSortValue: (row: InventoryQueryRecord) => row.totalQty },
        { id: "availableQty", label: "可用数量", group: "数量信息", width: 108, align: "right" as const, sortType: "number" as TableSortType, getSortValue: (row: InventoryQueryRecord) => row.availableQty },
        { id: "reservedQty", label: "预占数量", group: "数量信息", width: 108, align: "right" as const, sortType: "number" as TableSortType, getSortValue: (row: InventoryQueryRecord) => row.reservedQty },
        { id: "frozenQty", label: "冻结数量", group: "数量信息", width: 108, align: "right" as const, sortType: "number" as TableSortType, getSortValue: (row: InventoryQueryRecord) => row.frozenQty },
      ] satisfies Array<ColumnSettingsField & { id: InventoryColumnId; width: number; align?: "left" | "right"; sortType?: TableSortType; getSortValue?: (row: InventoryQueryRecord) => unknown }>,
    [],
  );

  const {
    state: inventoryColumnState,
    defaultState: inventoryDefaultColumnState,
    applyState: applyInventoryColumnState,
  } = usePersistedColumnSettings({
    storageKey: "column-settings:demo-user:inventory-query",
    fields: inventoryColumns,
    defaultDensity: "medium",
  });
  const { beginResize, widths: columnWidths } = useTableColumnResize({
    state: inventoryColumnState,
    applyState: applyInventoryColumnState,
  });

  const visibleColumns = useMemo(() => {
    return inventoryColumnState.order
      .filter((id) => inventoryColumnState.visible.includes(id))
      .map((id) => inventoryColumns.find((column) => column.id === id))
      .filter((column): column is (typeof inventoryColumns)[number] => Boolean(column));
  }, [inventoryColumnState.order, inventoryColumnState.visible, inventoryColumns]);

  const fixedLeftMap = useMemo(() => {
    const fixedSet = new Set(inventoryColumnState.fixed);
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
  }, [columnWidths, inventoryColumnState.fixed, visibleColumns]);

  const ownerOptions = useMemo(
    () => buildOptions(Array.from(new Set(inventoryQueryRecords.map((item) => item.owner)))),
    [],
  );
  const warehouseOptions = useMemo(
    () => buildOptions(Array.from(new Set(inventoryQueryRecords.map((item) => item.warehouse)))),
    [],
  );
  const largeCategoryOptions = useMemo(
    () => buildOptions(Array.from(new Set(inventoryQueryRecords.map((item) => item.categoryLarge)))),
    [],
  );
  const mediumCategoryOptions = useMemo(
    () => buildOptions(Array.from(new Set(inventoryQueryRecords.map((item) => item.categoryMedium)))),
    [],
  );
  const smallCategoryOptions = useMemo(
    () => buildOptions(Array.from(new Set(inventoryQueryRecords.map((item) => item.categorySmall)))),
    [],
  );
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const queryFieldDefinitions: Array<{ key: InventoryQueryFieldKey; queryColumns?: 1 | 2 }> = [
    { key: "owner" },
    { key: "warehouse" },
    { key: "itemCode" },
    { key: "barcode" },
    { key: "itemName" },
    { key: "categoryLarge" },
    { key: "categoryMedium" },
    { key: "categorySmall" },
  ];
  const visibleQueryFieldKeys = getVisibleQuerySectionItems(queryFieldDefinitions, showMoreFilters).map((field) => field.key);
  const visibleQueryFieldKeySet = new Set<InventoryQueryFieldKey>(visibleQueryFieldKeys);
  const hasCollapsedQueryFields = hasCollapsedQuerySectionItems(queryFieldDefinitions);
  const sortConfigs = useMemo(
    () =>
      inventoryColumns.reduce<Partial<Record<InventoryColumnId, TableSortConfig<InventoryQueryRecord>>>>((configs, column) => {
        if (!column.sortType || !column.getSortValue) {
          return configs;
        }

        configs[column.id] = {
          type: column.sortType,
          getValue: column.getSortValue,
        };
        return configs;
      }, {}),
    [inventoryColumns],
  );

  const filteredRows = useMemo(() => {
    return inventoryQueryRecords.filter((row) => {
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

      return (
        includesText(row.itemCode, appliedFilters.itemCode) &&
        includesText(row.barcodes, appliedFilters.barcode) &&
        includesText(row.itemName, appliedFilters.itemName)
      );
    });
  }, [appliedFilters]);

  const sortedRows = useMemo(() => sortTableRows(filteredRows, sortState, sortConfigs), [filteredRows, sortConfigs, sortState]);
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const normalizedPage = Math.min(page, totalPages);
  const pagedRows = sortedRows.slice((normalizedPage - 1) * pageSize, normalizedPage * pageSize);

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => {
        acc.totalQty += row.totalQty;
        acc.availableQty += row.availableQty;
        acc.reservedQty += row.reservedQty;
        acc.frozenQty += row.frozenQty;
        return acc;
      },
      { totalQty: 0, availableQty: 0, reservedQty: 0, frozenQty: 0 },
    );
  }, [filteredRows]);

  function handleQuery() {
    setAppliedFilters(draftFilters);
    setPage(1);
    const nextRows = inventoryQueryRecords.filter((row) => {
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

      return (
        includesText(row.itemCode, draftFilters.itemCode) &&
        includesText(row.barcodes, draftFilters.barcode) &&
        includesText(row.itemName, draftFilters.itemName)
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

  function updateFilter<K extends keyof InventoryQueryFilters>(key: K, value: InventoryQueryFilters[K]) {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  }

  function renderInventoryCell(row: InventoryQueryRecord, columnId: InventoryColumnId) {
    if (columnId === "owner") {
      return (
        <div className="max-w-[220px] truncate" title={row.owner}>
          {row.owner}
        </div>
      );
    }

    if (columnId === "warehouse") {
      return (
        <div className="max-w-[260px] truncate" title={row.warehouse}>
          {row.warehouse}
        </div>
      );
    }

    if (columnId === "itemCode") {
      return <span className="tabular-nums text-text-primary">{row.itemCode}</span>;
    }

    if (columnId === "barcodes") {
      return (
        <div className="max-w-[180px] truncate" title={row.barcodes}>
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

    if (columnId === "totalQty") {
      return <span className="tabular-nums">{numberText(row.totalQty)}</span>;
    }

    if (columnId === "availableQty") {
      return <span className="tabular-nums text-success">{numberText(row.availableQty)}</span>;
    }

    if (columnId === "reservedQty") {
      return <span className="tabular-nums text-warning">{numberText(row.reservedQty)}</span>;
    }

    return <span className="tabular-nums text-danger">{numberText(row.frozenQty)}</span>;
  }

  return (
    <div className="space-y-page-block">
      <DemoToolbar label="列表页" items={inventoryQueryTabs} value={scenario} onChange={setScenario} />
      <PageHeader
        title="即时库存查询"
        description="按货主、仓库、商品和品类组合查询当前库存结果，重点查看总数量、可用数量、预占数量和冻结数量。"
        actions={
          <Button variant="primary" disabled={filteredRows.length === 0} onClick={handleExport}>
            导出
          </Button>
        }
      />

      <Card>
        <div className="query-section-grid">
          {visibleQueryFieldKeySet.has("owner") ? (
            <div>
              <div className="field-label">货主</div>
              <Select value={draftFilters.owner} onValueChange={(value) => updateFilter("owner", value)} options={ownerOptions} />
            </div>
          ) : null}
          {visibleQueryFieldKeySet.has("warehouse") ? (
            <div>
              <div className="field-label">仓库</div>
              <Select value={draftFilters.warehouse} onValueChange={(value) => updateFilter("warehouse", value)} options={warehouseOptions} />
            </div>
          ) : null}
          {visibleQueryFieldKeySet.has("itemCode") ? (
            <div>
              <div className="field-label">商品编码</div>
              <Input value={draftFilters.itemCode} onChange={(event) => updateFilter("itemCode", event.target.value)} placeholder="请输入" />
            </div>
          ) : null}
          {visibleQueryFieldKeySet.has("barcode") ? (
            <div>
              <div className="field-label">商品条码</div>
              <Input value={draftFilters.barcode} onChange={(event) => updateFilter("barcode", event.target.value)} placeholder="请输入" />
            </div>
          ) : null}
          {visibleQueryFieldKeySet.has("itemName") ? (
            <div>
              <div className="field-label">商品名称</div>
              <Input value={draftFilters.itemName} onChange={(event) => updateFilter("itemName", event.target.value)} placeholder="请输入" />
            </div>
          ) : null}
          {visibleQueryFieldKeySet.has("categoryLarge") ? (
            <div>
              <div className="field-label">商品大类</div>
              <Select
                value={draftFilters.categoryLarge}
                onValueChange={(value) => updateFilter("categoryLarge", value)}
                options={largeCategoryOptions}
              />
            </div>
          ) : null}
          {visibleQueryFieldKeySet.has("categoryMedium") ? (
            <div>
              <div className="field-label">商品中类</div>
              <Select
                value={draftFilters.categoryMedium}
                onValueChange={(value) => updateFilter("categoryMedium", value)}
                options={mediumCategoryOptions}
              />
            </div>
          ) : null}
          {visibleQueryFieldKeySet.has("categorySmall") ? (
            <div>
              <div className="field-label">商品小类</div>
              <Select
                value={draftFilters.categorySmall}
                onValueChange={(value) => updateFilter("categorySmall", value)}
                options={smallCategoryOptions}
              />
            </div>
          ) : null}
        </div>
        <div className="query-section-actions">
          {hasCollapsedQueryFields ? (
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
      </Card>

      {scenario === "no-auth" ? (
        <ExceptionState
          variant="403"
          description="当前用户无即时库存查询权限。请联系管理员开通库存查询菜单和数据范围权限。"
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
          description="当前筛选条件下没有命中库存记录，请调整货主、仓库或商品条件后重试。"
          primaryAction={<Button variant="primary" onClick={handleReset}>重置条件</Button>}
          secondaryAction={<Button onClick={handleQuery}>重新查询</Button>}
        />
      ) : null}

      {scenario === "normal" && filteredRows.length > 0 ? (
        <ListPageMainCard>
          <div className="border-b border-border bg-bg-subtle px-4 py-3">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-sm border border-border bg-white px-3 py-3">
                <div className="text-small text-text-muted">总数量</div>
                <div className="mt-2 text-section-title font-section-title text-text-primary">{numberText(summary.totalQty)}</div>
              </div>
              <div className="rounded-sm border border-border bg-white px-3 py-3">
                <div className="text-small text-text-muted">可用数量</div>
                <div className="mt-2 text-section-title font-section-title text-success">{numberText(summary.availableQty)}</div>
              </div>
              <div className="rounded-sm border border-border bg-white px-3 py-3">
                <div className="text-small text-text-muted">预占数量</div>
                <div className="mt-2 text-section-title font-section-title text-warning">{numberText(summary.reservedQty)}</div>
              </div>
              <div className="rounded-sm border border-border bg-white px-3 py-3">
                <div className="text-small text-text-muted">冻结数量</div>
                <div className="mt-2 text-section-title font-section-title text-danger">{numberText(summary.frozenQty)}</div>
              </div>
            </div>
          </div>
          <ListPageToolbar className="justify-end">
            <div className="list-toolbar-group">
              <IconActionButton label="列设置" onClick={() => setColumnSettingsOpen(true)}>
                <Settings2 aria-hidden="true" strokeWidth={1.8} className="h-4 w-4" />
              </IconActionButton>
            </div>
          </ListPageToolbar>
          <HorizontalScrollArea viewportClassName={getDensityClassName(inventoryColumnState.density)}>
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
                          {renderInventoryCell(row, column.id)}
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
        title="即时库存列设置"
        fields={inventoryColumns}
        state={inventoryColumnState}
        defaultState={inventoryDefaultColumnState}
        onClose={() => setColumnSettingsOpen(false)}
        onApply={applyInventoryColumnState}
      />
    </div>
  );
}
