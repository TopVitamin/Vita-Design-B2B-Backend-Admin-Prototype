import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  type ColumnSettingsField,
  ColumnSettingsModal,
  getDensityClassName,
  usePersistedColumnSettings,
} from "../components/ui/column-settings";
import { DemoToolbar } from "../components/ui/demo-toolbar";
import type { FloatingAlertInput } from "../components/ui/floating-alert";
import { IconActionButton } from "../components/ui/icon-action-button";
import { Select } from "../components/ui/select";
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

const pageSizeOptions = [
  { label: "20条", value: "20" },
  { label: "50条", value: "50" },
  { label: "100条", value: "100" },
];

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

function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {description ? <div className="mt-2 text-small text-text-muted">{description}</div> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </div>
  );
}

function PaginationBar({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  jumpPage,
  onPageChange,
  onPageSizeChange,
  onJumpPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  jumpPage: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onJumpPageChange: (value: string) => void;
}) {
  function goToPage(value: string) {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return;
    }

    const normalized = Math.min(Math.max(parsed, 1), totalPages);
    onPageChange(normalized);
    onJumpPageChange(String(normalized));
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-actions border-t border-border px-4 py-3 text-small text-text-muted">
      <span>共{totalCount}条</span>
      <div className="flex flex-wrap items-center gap-actions">
        <label className="flex items-center gap-control">
          <span>每页</span>
          <Select
            className="h-input-sm w-[92px] bg-white"
            value={String(pageSize)}
            onValueChange={(nextValue) => onPageSizeChange(Number(nextValue))}
            options={pageSizeOptions}
          />
        </label>
        <span>
          {currentPage}/{totalPages}页
        </span>
        <Button size="sm" disabled={currentPage === 1} onClick={() => goToPage(String(Math.max(currentPage - 1, 1)))}>
          上一页
        </Button>
        <Button size="sm" disabled={currentPage === totalPages} onClick={() => goToPage(String(Math.min(currentPage + 1, totalPages)))}>
          下一页
        </Button>
        <label className="flex items-center gap-control">
          <span>跳转</span>
          <input
            className="field-control h-input-sm w-[72px]"
            value={jumpPage}
            onChange={(event) => onJumpPageChange(event.target.value)}
            onBlur={(event) => goToPage(event.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

export function InventoryQueryPage({
  onShowAlert,
}: {
  onShowAlert: (notice: FloatingAlertInput) => void;
}) {
  const [draftFilters, setDraftFilters] = useState<InventoryQueryFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<InventoryQueryFilters>(defaultFilters);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [jumpPage, setJumpPage] = useState("1");
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [scenario, setScenario] = useState<InventoryQueryScenario>("normal");

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
        { id: "totalQty", label: "总数量", group: "数量信息", width: 108, defaultFixed: true },
        { id: "availableQty", label: "可用数量", group: "数量信息", width: 108 },
        { id: "reservedQty", label: "预占数量", group: "数量信息", width: 108 },
        { id: "frozenQty", label: "冻结数量", group: "数量信息", width: 108 },
      ] satisfies Array<ColumnSettingsField & { id: InventoryColumnId; width: number }>,
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
      left += column.width;
    });

    return leftMap;
  }, [inventoryColumnState.fixed, visibleColumns]);

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

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const normalizedPage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice((normalizedPage - 1) * pageSize, normalizedPage * pageSize);

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
    setJumpPage("1");
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
    setPage(1);
    setJumpPage("1");
    setScenario("normal");
  }

  function handleExport() {
    onShowAlert({
      tone: "success",
      title: "导出任务已创建",
      description: `已按当前筛选条件创建导出任务，共${filteredRows.length}条库存记录。`,
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

      <Card title="查询筛选区">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div>
            <div className="field-label">货主</div>
            <Select value={draftFilters.owner} onValueChange={(value) => updateFilter("owner", value)} options={ownerOptions} />
          </div>
          <div>
            <div className="field-label">仓库</div>
            <Select value={draftFilters.warehouse} onValueChange={(value) => updateFilter("warehouse", value)} options={warehouseOptions} />
          </div>
          <div>
            <div className="field-label">商品编码</div>
            <input
              className="field-control"
              value={draftFilters.itemCode}
              onChange={(event) => updateFilter("itemCode", event.target.value)}
              placeholder="请输入"
            />
          </div>
          <div>
            <div className="field-label">商品条码</div>
            <input
              className="field-control"
              value={draftFilters.barcode}
              onChange={(event) => updateFilter("barcode", event.target.value)}
              placeholder="请输入"
            />
          </div>
          <div>
            <div className="field-label">商品名称</div>
            <input
              className="field-control"
              value={draftFilters.itemName}
              onChange={(event) => updateFilter("itemName", event.target.value)}
              placeholder="请输入"
            />
          </div>
          <div>
            <div className="field-label">商品大类</div>
            <Select
              value={draftFilters.categoryLarge}
              onValueChange={(value) => updateFilter("categoryLarge", value)}
              options={largeCategoryOptions}
            />
          </div>
          <div>
            <div className="field-label">商品中类</div>
            <Select
              value={draftFilters.categoryMedium}
              onValueChange={(value) => updateFilter("categoryMedium", value)}
              options={mediumCategoryOptions}
            />
          </div>
          <div>
            <div className="field-label">商品小类</div>
            <Select
              value={draftFilters.categorySmall}
              onValueChange={(value) => updateFilter("categorySmall", value)}
              options={smallCategoryOptions}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-end gap-actions">
          <Button onClick={handleReset}>重置</Button>
          <Button variant="primary" onClick={handleQuery}>
            查询
          </Button>
        </div>
      </Card>

      {scenario === "no-auth" ? (
        <Card title="无权限">
          <div className="rounded-sm border border-danger bg-danger-subtle p-4 text-body text-danger">
            当前用户无即时库存查询权限。请联系管理员开通库存查询菜单和数据范围权限。
          </div>
        </Card>
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
        <Card title="查询结果">
          <div className="rounded-sm border border-dashed border-border p-8 text-center text-text-muted">
            当前筛选条件下没有命中库存记录，请调整货主、仓库或商品条件后重试。
          </div>
        </Card>
      ) : null}

      {scenario === "normal" && filteredRows.length > 0 ? (
        <div className="list-page-main-card">
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
          <div className="table-toolbar justify-end border-b border-border px-4 py-3">
            <div className="flex items-center gap-actions">
              <IconActionButton label="列设置" onClick={() => setColumnSettingsOpen(true)}>
                <Settings2 aria-hidden="true" strokeWidth={1.8} className="h-4 w-4" />
              </IconActionButton>
            </div>
          </div>
          <div className={`overflow-x-auto ${getDensityClassName(inventoryColumnState.density)}`}>
            <table>
              <thead>
                <tr>
                  {visibleColumns.map((column) => {
                    const left = fixedLeftMap.get(column.id);
                    const isFixed = left !== undefined;
                    const alignRight = column.id.endsWith("Qty");

                    return (
                      <th
                        key={column.id}
                        className={`${alignRight ? "text-right" : ""} ${isFixed ? "table-fixed-cell is-header" : ""}`}
                        style={{
                          width: column.width,
                          minWidth: column.width,
                          left,
                        }}
                      >
                        {column.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr key={row.id}>
                    {visibleColumns.map((column) => {
                      const left = fixedLeftMap.get(column.id);
                      const isFixed = left !== undefined;
                      const alignRight = column.id.endsWith("Qty");

                      return (
                        <td
                          key={column.id}
                          className={`${alignRight ? "text-right" : ""} ${isFixed ? "table-fixed-cell is-body" : ""}`}
                          style={{
                            width: column.width,
                            minWidth: column.width,
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
          </div>
          <PaginationBar
            currentPage={normalizedPage}
            totalPages={totalPages}
            totalCount={filteredRows.length}
            pageSize={pageSize}
            jumpPage={jumpPage}
            onPageChange={(value) => {
              setPage(value);
              setJumpPage(String(value));
            }}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
              setJumpPage("1");
            }}
            onJumpPageChange={setJumpPage}
          />
        </div>
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
