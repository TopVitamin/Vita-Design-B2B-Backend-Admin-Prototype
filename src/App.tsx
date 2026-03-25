import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowDownToLine, Bell, Building2, ChevronDown, CircleAlert, ClipboardList, Clock3, Download, House, LayoutGrid, Palette, Plus, ScrollText, Settings2, Users, Warehouse } from "lucide-react";
import { AppShell } from "./components/app-shell";
import { AttachmentPanel, type AttachmentItem } from "./components/ui/attachment-panel";
import { Banner } from "./components/ui/banner";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Checkbox } from "./components/ui/checkbox";
import {
  type ColumnSettingsField,
  ColumnSettingsModal,
  getDensityClassName,
  usePersistedColumnSettings,
} from "./components/ui/column-settings";
import { DemoToolbar } from "./components/ui/demo-toolbar";
import { DescriptionList } from "./components/ui/description-list";
import { ExceptionState } from "./components/ui/exception-state";
import { FloatingAlert, type FloatingAlertInput } from "./components/ui/floating-alert";
import { HorizontalScrollArea } from "./components/ui/horizontal-scroll-area";
import { IconActionButton } from "./components/ui/icon-action-button";
import { ImportLoadingState, ImportSelectStage } from "./components/ui/import-dialog-section";
import { Input } from "./components/ui/input";
import { ImportResultPanel } from "./components/ui/import-result-panel";
import { ListPageMainCard, ListPageToolbar } from "./components/ui/list-page-layout";
import { Modal } from "./components/ui/modal";
import { Pagination } from "./components/ui/pagination";
import { PageHeader } from "./components/ui/page-header";
import { getVisibleQuerySectionItems, hasCollapsedQuerySectionItems } from "./components/ui/query-section";
import { RadioGroup } from "./components/ui/radio-group";
import { SegmentedControl } from "./components/ui/segmented-control";
import { Select } from "./components/ui/select";
import { Switch } from "./components/ui/switch";
import {
  getNextTableSortState,
  sortTableRows,
  TableHeaderCell,
  type TableSortConfig,
  type TableSortState,
  type TableSortType,
  useTableColumnResize,
} from "./components/ui/table-interactions";
import { Tabs } from "./components/ui/tabs";
import { Timeline } from "./components/ui/timeline";
import { Textarea } from "./components/ui/textarea";
import {
  initialExportTaskRecords,
  type ExportTaskRecord,
  type ExportTaskStatusFilter,
  type ExportTaskTarget,
} from "./data/export-task-center";
import {
  initialMessageRecords,
  type MessageCategoryId,
  type MessageFeedTab,
  type MessageRecord,
} from "./data/message-center";
import { DesignSystemPage } from "./pages/design-system-page";
import { InventoryFlowQueryPage } from "./pages/inventory-flow-query";
import { InventoryQueryPage } from "./pages/inventory-query";
import { ExportTaskCenterPage } from "./pages/export-task-center";
import { MessageCenterPage } from "./pages/message-center";
import { ShellCapabilitiesPage } from "./pages/shell-capabilities-page";
import { SystemStatusPage } from "./pages/system-status-page";
import {
  approvalLogs,
  lineItems,
  operationLogs,
  type PurchaseOrderRow,
  purchaseOrders,
  relatedDocuments,
} from "./data/purchase-order";
import { customerRecords as initialCustomerRecords, type CustomerRecord } from "./data/customer-master";
import { supplierRecords as initialSupplierRecords, type SupplierRecord } from "./data/supplier-master";
import {
  type CustomerDetailScenario,
  type CustomerDetailTab,
  type CustomerEditScenario,
  type CustomerFormData,
  type CustomerImportStage,
  type CustomerListScenario,
  type CustomerNotice,
  CustomerDetailPage,
  CustomerEditPage,
  CustomerExportModal,
  CustomerImportModal,
  CustomerListPage,
} from "./pages/customer-master";
import {
  type SupplierDetailScenario,
  type SupplierDetailTab,
  type SupplierEditScenario,
  type SupplierFormData,
  type SupplierImportStage,
  type SupplierLifecycleMode,
  type SupplierListScenario,
  type SupplierNotice,
  SupplierDetailPage,
  SupplierEditPage,
  SupplierExportModal,
  SupplierImportModal,
  SupplierLifecycleModal,
  SupplierListPage,
} from "./pages/supplier-master";

type WorkspaceTabKey =
  | "home"
  | "design-system"
  | "shell-capabilities"
  | "system-status"
  | "export-task-center"
  | "message-center"
  | "list"
  | "create"
  | "edit"
  | "detail"
  | "supplier-list"
  | "supplier-create"
  | "supplier-edit"
  | "supplier-detail"
  | "customer-list"
  | "customer-create"
  | "customer-edit"
  | "customer-detail"
  | "inventory-query"
  | "inventory-flow-query";
type EditorMode = "create" | "edit";
type ListScenario = "normal" | "loading" | "empty" | "no-result" | "no-auth" | "partial-success";
type EditScenario = "normal" | "save-failed" | "submit-failed" | "conflict" | "read-only";
type DetailScenario = "normal" | "closed" | "downstream-failed" | "no-auth";
type ImportStage = "select" | "loading" | "success" | "partial" | "file-error";
type DetailTab = "items" | "related" | "logs" | "approvals";
type FieldKind = "input" | "select" | "date" | "switch" | "checkbox";
type FieldOption = { label: string; value: string };
type RichField = {
  label: string;
  kind: FieldKind;
  queryColumns?: 1 | 2;
  value?: string;
  placeholder?: string;
  options?: FieldOption[];
  checked?: boolean;
  controlLabel?: string;
  checkedLabel?: string;
  uncheckedLabel?: string;
  readOnlyValue?: string;
};
type FloatingAlertNotice = FloatingAlertInput & {
  id: number;
};
type PurchaseLineItemRow = (typeof lineItems)[number] & {
  rowId: string;
};
type ThemeKey =
  | "classic-cloud-blue"
  | "crimson-red"
  | "nebula-purple"
  | "wechat-growth-green"
  | "aliyun-amber";
type ThemeOption = {
  key: ThemeKey;
  label: string;
  description: string;
  colors: {
    primary: string;
    hover: string;
    active: string;
    subtle: string;
    page: string;
    panel: string;
    border: string;
    hoverSurface: string;
  };
};

type TenantOption = {
  id: string;
  name: string;
  code: string;
  description: string;
};

const demoOperator = "当前用户";
const demoTimestamp = "2026-03-22 16:40:00";
const themeStorageKey = "prototype-app-theme";
const tenantOptions: TenantOption[] = [
  {
    id: "tenant-vitamin-retail",
    name: "维他命零售集团",
    code: "TENANT-001",
    description: "华东直营与电商业务",
  },
  {
    id: "tenant-sunrise-trade",
    name: "晨屿商贸有限公司",
    code: "TENANT-014",
    description: "跨境与保税仓业务",
  },
  {
    id: "tenant-cloud-fresh",
    name: "云鲜供应链平台",
    code: "TENANT-032",
    description: "生鲜采购与冷链履约",
  },
];

function formatTaskTimestamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function buildExportFileName(taskName: string, timestamp: string, format: "xlsx" | "csv") {
  const compactTime = timestamp.split("-").join("").split(":").join("").split(" ").join("").slice(0, 14);
  return `${taskName}_${compactTime}.${format}`;
}

function getSwitchLabel(field: RichField, checked: boolean) {
  if (checked) {
    return field.checkedLabel ?? field.controlLabel ?? "已开启";
  }

  return field.uncheckedLabel ?? field.controlLabel ?? "已关闭";
}

function parseNumericInput(value: string) {
  const normalized = value.replace(/,/g, "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseRateInput(value: string) {
  const normalized = value.replace("%", "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed / 100 : 0;
}

function formatDecimal(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatQuantity(value: number) {
  if (Number.isInteger(value)) {
    return value.toLocaleString("en-US");
  }

  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function calculateLineAmount(qty: string, price: string, taxRate: string) {
  return parseNumericInput(qty) * parseNumericInput(price) * (1 + parseRateInput(taxRate));
}

function calculateTaxAmount(qty: string, price: string, taxRate: string) {
  return parseNumericInput(qty) * parseNumericInput(price) * parseRateInput(taxRate);
}

function createPurchaseLineItemRow(
  rowId: string,
  overrides: Partial<Omit<PurchaseLineItemRow, "rowId" | "amount">> = {},
): PurchaseLineItemRow {
  const draft: Omit<PurchaseLineItemRow, "rowId" | "amount"> = {
    sku: "",
    name: "",
    spec: "",
    unit: "",
    qty: "0",
    price: "0.00",
    taxRate: "13%",
    eta: "",
    ...overrides,
  };

  return {
    ...draft,
    rowId,
    amount: formatDecimal(calculateLineAmount(draft.qty, draft.price, draft.taxRate)),
  };
}

function createInitialPurchaseLineItems() {
  return lineItems.map((item, index) => createPurchaseLineItemRow(`seed-${index + 1}`, item));
}

const listTabs = [
  { label: "正常", value: "normal" },
  { label: "加载中", value: "loading" },
  { label: "空数据", value: "empty" },
  { label: "查询无结果", value: "no-result" },
  { label: "无权限", value: "no-auth" },
  { label: "部分成功", value: "partial-success" },
] as const;

const editTabs = [
  { label: "正常", value: "normal" },
  { label: "保存失败", value: "save-failed" },
  { label: "提交失败", value: "submit-failed" },
  { label: "并发冲突", value: "conflict" },
  { label: "只读", value: "read-only" },
] as const;

const detailTabs = [
  { label: "正常", value: "normal" },
  { label: "已取消只读", value: "closed" },
  { label: "下游失败", value: "downstream-failed" },
  { label: "无权限", value: "no-auth" },
] as const;

const themeOptions: ThemeOption[] = [
  {
    key: "classic-cloud-blue",
    label: "经典云蓝",
    description: "稳重、通用、低风险，延续当前后台模板的默认基线。",
    colors: {
      primary: "#3B82F6",
      hover: "#2563EB",
      active: "#1D4ED8",
      subtle: "#DBEAFE",
      page: "#F5F7FA",
      panel: "#FAFBFC",
      border: "#E5E7EB",
      hoverSurface: "#F2F4F7",
    },
  },
  {
    key: "crimson-red",
    label: "绛云赤红",
    description: "更有业务推动感，适合强调执行力和重点决策场景。",
    colors: {
      primary: "#D14343",
      hover: "#B42318",
      active: "#912018",
      subtle: "#FEE4E2",
      page: "#F5F7FA",
      panel: "#FAFBFC",
      border: "#E5E7EB",
      hoverSurface: "#F2F4F7",
    },
  },
  {
    key: "nebula-purple",
    label: "星幕紫",
    description: "更偏平台化和策略感，适合需要品牌识别的中后台工作台。",
    colors: {
      primary: "#7C3AED",
      hover: "#6D28D9",
      active: "#5B21B6",
      subtle: "#EDE9FE",
      page: "#F5F7FA",
      panel: "#FAFBFC",
      border: "#E5E7EB",
      hoverSurface: "#F2F4F7",
    },
  },
  {
    key: "wechat-growth-green",
    label: "企微增长绿",
    description: "克制的企业服务绿色，更偏组织连接与增长导向。",
    colors: {
      primary: "#18B368",
      hover: "#0E9F5B",
      active: "#0B7A45",
      subtle: "#DDF7E8",
      page: "#F5F7FA",
      panel: "#FAFBFC",
      border: "#E5E7EB",
      hoverSurface: "#F2F4F7",
    },
  },
  {
    key: "aliyun-amber",
    label: "阿里云琥珀橙",
    description: "业务驱动更强，适合强调执行效率与业务识别度。",
    colors: {
      primary: "#F59E0B",
      hover: "#D97706",
      active: "#B45309",
      subtle: "#FEF3C7",
      page: "#F5F7FA",
      panel: "#FAFBFC",
      border: "#E5E7EB",
      hoverSurface: "#F2F4F7",
    },
  },
];

function isThemeKey(value: string): value is ThemeKey {
  return themeOptions.some((theme) => theme.key === value);
}

function resolveInitialTheme(): ThemeKey {
  if (typeof window === "undefined") {
    return "classic-cloud-blue";
  }

  const storedTheme = window.localStorage.getItem(themeStorageKey);
  return storedTheme && isThemeKey(storedTheme) ? storedTheme : "classic-cloud-blue";
}

function getReadOnlyFieldValue(field: RichField) {
  if (field.readOnlyValue) {
    return field.readOnlyValue;
  }

  if (field.kind === "checkbox") {
    return field.checked ? "已勾选" : "未勾选";
  }

  if (field.kind === "switch") {
    return getSwitchLabel(field, Boolean(field.checked));
  }

  return field.value ?? "-";
}

function SwitchFieldControl({ field }: { field: RichField }) {
  const [checked, setChecked] = useState(Boolean(field.checked));

  useEffect(() => {
    setChecked(Boolean(field.checked));
  }, [field.checked, field.label]);

  return (
    <Switch
      checked={checked}
      checkedLabel={getSwitchLabel(field, true)}
      uncheckedLabel={getSwitchLabel(field, false)}
      onCheckedChange={setChecked}
    />
  );
}

function renderEditableField(field: RichField) {
  if (field.kind === "select") {
    return (
      <Select className="bg-white" defaultValue={field.value} options={field.options ?? []} placeholder="请选择" />
    );
  }

  if (field.kind === "date") {
    return <Input type="date" defaultValue={field.value} placeholder="请选择" />;
  }

  if (field.kind === "checkbox") {
    const checkboxLabel = field.controlLabel ?? "已勾选";
    return <Checkbox defaultChecked={field.checked} label={checkboxLabel} title={checkboxLabel} variant="card" />;
  }

  if (field.kind === "switch") {
    return <SwitchFieldControl field={field} />;
  }

  return <Input defaultValue={field.value} placeholder="请输入" />;
}

function FieldBlock({ field, readOnly = false }: { field: RichField; readOnly?: boolean }) {
  return (
    <div className={field.queryColumns === 2 ? "xl:col-span-2" : undefined}>
      <div className="field-label">{field.label}</div>
      {readOnly ? <div className="display-field">{getReadOnlyFieldValue(field)}</div> : renderEditableField(field)}
    </div>
  );
}

export default function App() {
  const [activeTheme, setActiveTheme] = useState<ThemeKey>(resolveInitialTheme);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [currentTenantId, setCurrentTenantId] = useState(tenantOptions[0].id);
  const [activeTab, setActiveTab] = useState<WorkspaceTabKey>("home");
  const [openTabs, setOpenTabs] = useState<WorkspaceTabKey[]>(["home"]);
  const [listScenario, setListScenario] = useState<ListScenario>("normal");
  const [editScenario, setEditScenario] = useState<EditScenario>("normal");
  const [detailScenario, setDetailScenario] = useState<DetailScenario>("normal");
  const [detailTab, setDetailTab] = useState<DetailTab>("items");
  const [importOpen, setImportOpen] = useState(false);
  const [importStage, setImportStage] = useState<ImportStage>("select");
  const [importMode, setImportMode] = useState<Exclude<ImportStage, "select" | "loading">>("success");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportRange, setExportRange] = useState("filtered");
  const [exportFormat, setExportFormat] = useState("xlsx");
  const [supplierRecords, setSupplierRecords] = useState<SupplierRecord[]>(initialSupplierRecords);
  const [supplierCurrentCode, setSupplierCurrentCode] = useState(initialSupplierRecords[0]?.code ?? "");
  const [supplierListScenario, setSupplierListScenario] = useState<SupplierListScenario>("normal");
  const [supplierEditScenario, setSupplierEditScenario] = useState<SupplierEditScenario>("normal");
  const [supplierDetailScenario, setSupplierDetailScenario] = useState<SupplierDetailScenario>("normal");
  const [supplierDetailTab, setSupplierDetailTab] = useState<SupplierDetailTab>("contact");
  const [supplierImportOpen, setSupplierImportOpen] = useState(false);
  const [supplierImportStage, setSupplierImportStage] = useState<SupplierImportStage>("select");
  const [supplierImportMode, setSupplierImportMode] = useState<Exclude<SupplierImportStage, "select" | "loading">>("success");
  const [supplierExportOpen, setSupplierExportOpen] = useState(false);
  const [supplierExportRange, setSupplierExportRange] = useState("filtered");
  const [supplierExportFormat, setSupplierExportFormat] = useState("xlsx");
  const [supplierLifecycleOpen, setSupplierLifecycleOpen] = useState(false);
  const [supplierLifecycleMode, setSupplierLifecycleMode] = useState<SupplierLifecycleMode>("disable");
  const [supplierLifecycleCode, setSupplierLifecycleCode] = useState(initialSupplierRecords[0]?.code ?? "");
  const [supplierNotice, setSupplierNotice] = useState<SupplierNotice>(null);
  const [customerRecords, setCustomerRecords] = useState<CustomerRecord[]>(initialCustomerRecords);
  const [customerCurrentCode, setCustomerCurrentCode] = useState(initialCustomerRecords[0]?.code ?? "");
  const [customerListScenario, setCustomerListScenario] = useState<CustomerListScenario>("normal");
  const [customerEditScenario, setCustomerEditScenario] = useState<CustomerEditScenario>("normal");
  const [customerDetailScenario, setCustomerDetailScenario] = useState<CustomerDetailScenario>("normal");
  const [customerDetailTab, setCustomerDetailTab] = useState<CustomerDetailTab>("contact");
  const [customerImportOpen, setCustomerImportOpen] = useState(false);
  const [customerImportStage, setCustomerImportStage] = useState<CustomerImportStage>("select");
  const [customerImportMode, setCustomerImportMode] = useState<Exclude<CustomerImportStage, "select" | "loading">>("success");
  const [customerExportOpen, setCustomerExportOpen] = useState(false);
  const [customerExportRange, setCustomerExportRange] = useState("filtered");
  const [customerExportFormat, setCustomerExportFormat] = useState("xlsx");
  const [customerNotice, setCustomerNotice] = useState<CustomerNotice>(null);
  const [exportTasks, setExportTasks] = useState<ExportTaskRecord[]>(initialExportTaskRecords);
  const [exportTaskStatus, setExportTaskStatus] = useState<ExportTaskStatusFilter>("all");
  const [exportTaskActiveId, setExportTaskActiveId] = useState<string | null>(null);
  const [systemStatusVariant, setSystemStatusVariant] = useState<"403" | "404" | "session-expired" | "system-maintenance">("403");
  const [messageRecords, setMessageRecords] = useState<MessageRecord[]>(initialMessageRecords);
  const [messageCenterCategory, setMessageCenterCategory] = useState<MessageCategoryId>("all");
  const [messageCenterOnlyUnread, setMessageCenterOnlyUnread] = useState(true);
  const [messageCenterSelectedIds, setMessageCenterSelectedIds] = useState<string[]>([]);
  const [messageCenterActiveMessageId, setMessageCenterActiveMessageId] = useState<string | null>(null);
  const [floatingAlert, setFloatingAlert] = useState<FloatingAlertNotice | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = activeTheme;
    window.localStorage.setItem(themeStorageKey, activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    if (!importOpen || importStage !== "loading") {
      return;
    }

    const timer = window.setTimeout(() => {
      setImportStage(importMode);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [importMode, importOpen, importStage]);

  useEffect(() => {
    if (!supplierImportOpen || supplierImportStage !== "loading") {
      return;
    }

    const timer = window.setTimeout(() => {
      setSupplierImportStage(supplierImportMode);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [supplierImportMode, supplierImportOpen, supplierImportStage]);

  useEffect(() => {
    if (!supplierRecords.some((item) => item.code === supplierCurrentCode) && supplierRecords[0]) {
      setSupplierCurrentCode(supplierRecords[0].code);
    }
  }, [supplierCurrentCode, supplierRecords]);

  useEffect(() => {
    if (!customerImportOpen || customerImportStage !== "loading") {
      return;
    }

    const timer = window.setTimeout(() => {
      setCustomerImportStage(customerImportMode);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [customerImportMode, customerImportOpen, customerImportStage]);

  useEffect(() => {
    if (!customerRecords.some((item) => item.code === customerCurrentCode) && customerRecords[0]) {
      setCustomerCurrentCode(customerRecords[0].code);
    }
  }, [customerCurrentCode, customerRecords]);

  useEffect(() => {
    if (!floatingAlert) {
      return;
    }

    const timer = window.setTimeout(() => {
      setFloatingAlert((current) => (current?.id === floatingAlert.id ? null : current));
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [floatingAlert]);

  const currentSupplier = useMemo(
    () => supplierRecords.find((item) => item.code === supplierCurrentCode) ?? supplierRecords[0],
    [supplierCurrentCode, supplierRecords],
  );

  const lifecycleSupplier = useMemo(
    () => supplierRecords.find((item) => item.code === supplierLifecycleCode),
    [supplierLifecycleCode, supplierRecords],
  );

  const currentCustomer = useMemo(
    () => customerRecords.find((item) => item.code === customerCurrentCode) ?? customerRecords[0],
    [customerCurrentCode, customerRecords],
  );

  const exportTaskAttentionCount = useMemo(
    () => exportTasks.filter((item) => item.status === "processing" || item.status === "failed").length,
    [exportTasks],
  );

  const notificationUnreadCount = useMemo(
    () => messageRecords.filter((item) => item.unread).length,
    [messageRecords],
  );

  const notificationPreviewItems = useMemo(
    () =>
      messageRecords.map((item) => ({
        id: item.id,
        feedTab: item.feedTab,
        title: item.title,
        summary: item.summary,
        time: item.previewTime,
        unread: item.unread,
        avatarLabel: item.avatarLabel,
        avatarBackground: item.avatarBackground,
      })),
    [messageRecords],
  );

  function showFloatingAlert(notice: FloatingAlertInput) {
    setFloatingAlert({
      id: Date.now(),
      ...notice,
    });
  }

  function applyTheme(themeKey: ThemeKey) {
    const nextTheme = themeOptions.find((theme) => theme.key === themeKey);
    if (!nextTheme) {
      return;
    }

    setActiveTheme(themeKey);
    showFloatingAlert(
      themeKey === activeTheme
        ? {
            tone: "info",
            title: `当前已是${nextTheme.label}`,
            description: "你可以继续预览其它主题，切换会立即作用到页签、背景和按钮状态。",
          }
        : {
            tone: "success",
            title: `已切换为${nextTheme.label}`,
            description: "新的主题已应用到按钮、页签、页面底色和悬浮高亮层级。",
          },
    );
  }

  function showPendingAlert(label: string) {
    showFloatingAlert({
      tone: "error",
      title: `${label}暂未实现`,
      description: "当前原型先保留入口占位，后续再补真实页面和交互逻辑。",
    });
  }

  function openExportTaskCenter(taskId?: string) {
    openWorkspaceTab("export-task-center");
    if (taskId) {
      setExportTaskActiveId(taskId);
    }
  }

  function addExportTask({
    taskName,
    sourceLabel,
    sourceTarget,
    rangeLabel,
    format,
    fieldCount,
    recordCount,
  }: {
    taskName: string;
    sourceLabel: string;
    sourceTarget?: ExportTaskTarget;
    rangeLabel: string;
    format: "xlsx" | "csv";
    fieldCount: number;
    recordCount: number;
  }) {
    const createdAt = formatTaskTimestamp();
    const taskId = `EXP-${Date.now()}`;
    const fileName = buildExportFileName(taskName, createdAt, format);

    const nextTask: ExportTaskRecord = {
      id: taskId,
      taskName,
      sourceLabel,
      sourceTarget,
      rangeLabel,
      format,
      fieldCount,
      recordCount,
      requestedBy: demoOperator,
      createdAt,
      status: "processing",
      fileName,
      detailSections: [
        { label: "任务名称", value: taskName },
        { label: "来源页面", value: sourceLabel },
        { label: "导出范围", value: rangeLabel },
        { label: "文件格式", value: format === "xlsx" ? "Excel (.xlsx)" : "CSV (.csv)" },
        { label: "记录数", value: `${recordCount}条` },
        { label: "字段数", value: `${fieldCount}个` },
        { label: "发起人", value: demoOperator },
        { label: "创建时间", value: createdAt },
      ],
      detailBlocks: [
        {
          title: "任务说明",
          content: `该任务来自“${sourceLabel}”，系统会按当前导出范围和字段配置生成文件，并统一沉淀到导出任务中心。`,
        },
        {
          title: "当前状态",
          content: "任务已进入后台处理队列，完成后可直接在导出任务中心下载文件；如果生成失败，可在任务详情中重试。",
        },
      ],
    };

    setExportTasks((current) => [nextTask, ...current]);
    showFloatingAlert({
      tone: "success",
      title: "导出任务已创建",
      description: "请到右上角导出任务中心查看生成进度和下载结果。",
    });

    window.setTimeout(() => {
      const finishedAt = formatTaskTimestamp();
      setExportTasks((current) =>
        current.map((item) =>
          item.id === taskId && item.status === "processing"
            ? {
                ...item,
                status: "success",
                finishedAt,
                detailBlocks: [
                  {
                    title: "任务说明",
                    content: `该任务来自“${sourceLabel}”，已按${rangeLabel}生成文件，可直接下载使用。`,
                  },
                  {
                    title: "结果状态",
                    content: "任务已完成，文件已生成。若当前页面筛选条件已经变化，建议重新发起一次最新导出。",
                  },
                ],
              }
            : item,
        ),
      );
    }, 1200);

    return taskId;
  }

  function downloadExportTask(task: ExportTaskRecord) {
    setExportTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? {
              ...item,
              status: "downloaded",
            }
          : item,
      ),
    );
    showFloatingAlert({
      tone: "success",
      title: "下载任务已触发",
      description: `${task.fileName}已开始下载，若浏览器拦截请检查下载权限。`,
    });
  }

  function retryExportTask(task: ExportTaskRecord) {
    const createdAt = formatTaskTimestamp();
    setExportTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? {
              ...item,
              createdAt,
              status: "processing",
              finishedAt: undefined,
              failureReason: undefined,
              detailSections: item.detailSections.map((section) =>
                section.label === "创建时间" ? { ...section, value: createdAt } : section,
              ),
              detailBlocks: [
                {
                  title: "任务说明",
                  content: `任务已重新提交，系统将基于“${item.sourceLabel}”的最近一次导出配置再次生成文件。`,
                },
                {
                  title: "当前状态",
                  content: "导出任务正在重新处理，请稍后刷新状态；生成完成后可再次下载。",
                },
              ],
            }
          : item,
      ),
    );
    showFloatingAlert({
      tone: "info",
      title: "已重新提交导出任务",
      description: "任务已回到处理中状态，完成后可在导出任务中心继续查看。",
    });

    window.setTimeout(() => {
      const finishedAt = formatTaskTimestamp();
      setExportTasks((current) =>
        current.map((item) =>
          item.id === task.id && item.status === "processing"
            ? {
                ...item,
                status: "success",
                finishedAt,
                detailBlocks: [
                  {
                    title: "任务说明",
                    content: `任务已重新生成完成，来源页面为“${item.sourceLabel}”，可直接下载最新文件。`,
                  },
                  {
                    title: "结果状态",
                    content: "重试已成功，若后续数据范围变化，建议重新发起新的导出任务。",
                  },
                ],
              }
            : item,
        ),
      );
    }, 1200);
  }

  function clearFinishedExportTasks() {
    const removableIds = exportTasks
      .filter((item) => item.status === "success" || item.status === "downloaded")
      .map((item) => item.id);

    if (!removableIds.length) {
      showFloatingAlert({
        tone: "info",
        title: "当前没有可清理的任务",
        description: "处理中或失败任务会继续保留，便于你后续查看和重试。",
      });
      return;
    }

    setExportTasks((current) => current.filter((item) => !removableIds.includes(item.id)));
    setExportTaskActiveId((current) => (current && removableIds.includes(current) ? null : current));
    showFloatingAlert({
      tone: "success",
      title: "已清理完成任务",
      description: `共清理${removableIds.length}条导出记录，处理中和失败任务仍会保留。`,
    });
  }

  function openExportTaskSource(task: ExportTaskRecord) {
    if (task.sourceTarget === "purchase-list") {
      openWorkspaceTab("list");
      return;
    }

    if (task.sourceTarget === "supplier-list") {
      openSupplierList();
      return;
    }

    if (task.sourceTarget === "customer-list") {
      openCustomerList();
      return;
    }

    if (task.sourceTarget === "inventory-query") {
      openInventoryQuery();
      return;
    }

    if (task.sourceTarget === "inventory-flow-query") {
      openInventoryFlowQuery();
      return;
    }

    showPendingAlert("来源页面");
  }

  function markMessagesAsRead(ids: string[]) {
    if (!ids.length) {
      return;
    }

    const idSet = new Set(ids);
    setMessageRecords((current) =>
      current.map((item) => (idSet.has(item.id) ? { ...item, unread: false } : item)),
    );
  }

  function openMessageCenter(category: MessageCategoryId = "all", messageId?: string) {
    setMessageCenterCategory(category);
    setMessageCenterSelectedIds([]);
    openWorkspaceTab("message-center");

    if (messageId) {
      setMessageCenterOnlyUnread(false);
      setMessageCenterActiveMessageId(messageId);
      markMessagesAsRead([messageId]);
      return;
    }

    setMessageCenterActiveMessageId(null);
  }

  function openShellCapabilities() {
    openWorkspaceTab("shell-capabilities");
  }

  function openSystemStatus(variant: "403" | "404" | "session-expired" | "system-maintenance" = "403") {
    setSystemStatusVariant(variant);
    openWorkspaceTab("system-status");
  }

  function openMessageDetail(id: string) {
    setMessageCenterOnlyUnread(false);
    setMessageCenterActiveMessageId(id);
    markMessagesAsRead([id]);
  }

  function markFeedMessagesAsRead(feedTab: MessageFeedTab) {
    const unreadIds = messageRecords.filter((item) => item.feedTab === feedTab && item.unread).map((item) => item.id);
    if (!unreadIds.length) {
      showFloatingAlert({
        tone: "info",
        title: "当前分类没有未读消息",
        description: "你可以切换到其它分类继续处理待办或通知。",
      });
      return;
    }

    markMessagesAsRead(unreadIds);
    showFloatingAlert({
      tone: "success",
      title: "已全部标记为已读",
      description: `当前分类下共${unreadIds.length}条消息已更新为已读。`,
    });
  }

  function markSelectedMessagesAsRead() {
    const unreadIds = messageCenterSelectedIds.filter((id) => messageRecords.find((item) => item.id === id)?.unread);
    if (!unreadIds.length) {
      showFloatingAlert({
        tone: "info",
        title: "未选择可处理消息",
        description: "请先勾选未读消息，再执行批量已读。",
      });
      return;
    }

    markMessagesAsRead(unreadIds);
    setMessageCenterSelectedIds((current) => current.filter((id) => !unreadIds.includes(id)));
    showFloatingAlert({
      tone: "success",
      title: "批量已读完成",
      description: `已将${unreadIds.length}条消息标记为已读。`,
    });
  }

  function openMessageRelatedTarget(record: MessageRecord) {
    if (record.actionTarget === "purchase-detail") {
      openWorkspaceTab("detail");
      return;
    }

    if (record.actionTarget === "purchase-list") {
      openWorkspaceTab("list");
      return;
    }

    if (record.actionTarget === "supplier-list") {
      openSupplierList();
      return;
    }

    if (record.actionTarget === "inventory-flow-query") {
      openInventoryFlowQuery();
      return;
    }

    showPendingAlert("关联详情");
  }

  const tabs = useMemo(() => {
    const definitions = {
      home: { key: "home", label: "首页", closable: false, icon: House },
      "design-system": { key: "design-system", label: "Design System", closable: true, icon: Palette },
      "shell-capabilities": { key: "shell-capabilities", label: "壳层能力", closable: true, icon: LayoutGrid },
      "system-status": { key: "system-status", label: "系统状态", closable: true, icon: AlertTriangle },
      "export-task-center": { key: "export-task-center", label: "导出任务中心", closable: true, icon: Download },
      "message-center": { key: "message-center", label: "消息中心", closable: true, icon: Bell },
      list: { key: "list", label: "采购订单列表", closable: true },
      create: { key: "create", label: "新建采购订单", closable: true },
      edit: { key: "edit", label: "编辑采购订单", closable: true },
      detail: { key: "detail", label: "采购订单详情", closable: true },
      "inventory-query": { key: "inventory-query", label: "即时库存查询", closable: true },
      "inventory-flow-query": { key: "inventory-flow-query", label: "库存流水查询", closable: true },
      "supplier-list": { key: "supplier-list", label: "供应商主数据", closable: true },
      "supplier-create": { key: "supplier-create", label: "新建供应商", closable: true },
      "supplier-edit": { key: "supplier-edit", label: "编辑供应商", closable: true },
      "supplier-detail": { key: "supplier-detail", label: "供应商详情", closable: true },
      "customer-list": { key: "customer-list", label: "客户主数据", closable: true },
      "customer-create": { key: "customer-create", label: "新建客户", closable: true },
      "customer-edit": { key: "customer-edit", label: "编辑客户", closable: true },
      "customer-detail": { key: "customer-detail", label: "客户详情", closable: true },
    } as const;

    return openTabs.map((key) => definitions[key]);
  }, [openTabs]);

  function openWorkspaceTab(tab: WorkspaceTabKey) {
    setOpenTabs((current) => (current.includes(tab) ? current : [...current, tab]));
    setActiveTab(tab);
  }

  function activateTab(tab: WorkspaceTabKey) {
    setActiveTab(tab);
  }

  function closeTab(tab: WorkspaceTabKey) {
    if (tab === "home") {
      return;
    }

    setOpenTabs((current) => {
      const nextTabs = current.filter((item) => item !== tab);
      setActiveTab((currentActive) => {
        if (currentActive !== tab) {
          return currentActive;
        }

        return nextTabs[nextTabs.length - 1] ?? "home";
      });
      return nextTabs;
    });
  }

  function openSupplierList() {
    openWorkspaceTab("supplier-list");
  }

  function openSupplierCreate() {
    setSupplierEditScenario("normal");
    openWorkspaceTab("supplier-create");
  }

  function openSupplierEdit(code: string) {
    setSupplierCurrentCode(code);
    setSupplierEditScenario("normal");
    openWorkspaceTab("supplier-edit");
  }

  function openSupplierDetail(code: string) {
    setSupplierCurrentCode(code);
    openWorkspaceTab("supplier-detail");
  }

  function openCustomerList() {
    openWorkspaceTab("customer-list");
  }

  function openCustomerCreate() {
    setCustomerEditScenario("normal");
    openWorkspaceTab("customer-create");
  }

  function openCustomerEdit(code: string) {
    setCustomerCurrentCode(code);
    setCustomerEditScenario("normal");
    openWorkspaceTab("customer-edit");
  }

  function openCustomerDetail(code: string) {
    setCustomerCurrentCode(code);
    openWorkspaceTab("customer-detail");
  }

  function openInventoryQuery() {
    openWorkspaceTab("inventory-query");
  }

  function openInventoryFlowQuery() {
    openWorkspaceTab("inventory-flow-query");
  }

  function generateSupplierCode(existingCode?: string) {
    if (existingCode) {
      return existingCode;
    }

    return `SUP20260322${String(supplierRecords.length + 1).padStart(3, "0")}`;
  }

  function upsertSupplierRecord(draft: SupplierFormData, mode: "save" | "submit") {
    const existing = supplierRecords.find((item) => item.code === draft.code);
    const code = generateSupplierCode(draft.code);
    const nextAuditStatus = mode === "submit" ? "待审核" : existing?.auditStatus === "已审核" ? "待提交" : "待提交";
    const nextKingdeeStatus = mode === "submit" ? "未推送" : existing?.kingdeeStatus ?? draft.kingdeeStatus;
    const baseLogs = existing?.operationLogs ?? [];
    const baseChanges = existing?.changeLogs ?? [];
    const baseApprovals = existing?.approvalLogs ?? [];
    const nextRecord: SupplierRecord = {
      code,
      name: draft.name.trim(),
      category: draft.category,
      lifecycleStatus: draft.lifecycleStatus,
      auditStatus: nextAuditStatus,
      kingdeeStatus: nextKingdeeStatus,
      organization: draft.organization,
      socialCreditCode: draft.socialCreditCode.trim(),
      overseasCompany: draft.overseasCompany,
      countryRegion: draft.countryRegion,
      bankAccountName: draft.bankAccountName.trim(),
      bankAccountNo: draft.bankAccountNo.trim(),
      bankName: draft.bankName.trim(),
      bankBranch: draft.bankBranch.trim(),
      contactName: draft.contactName.trim(),
      contactPhone: draft.contactPhone.trim(),
      contactEmail: draft.contactEmail.trim(),
      contactTitle: draft.contactTitle.trim(),
      paymentTerm: draft.paymentTerm,
      currency: draft.currency,
      invoiceType: draft.invoiceType,
      taxRate: draft.taxRate.trim(),
      taxpayerType: draft.taxpayerType,
      shippingAddress: { ...draft.shippingAddress },
      returnAddress: { ...draft.returnAddress },
      createdBy: existing?.createdBy ?? demoOperator,
      createdAt: existing?.createdAt ?? demoTimestamp,
      updatedBy: demoOperator,
      updatedAt: demoTimestamp,
      reviewedBy: mode === "submit" ? "-" : existing?.reviewedBy ?? "-",
      reviewedAt: mode === "submit" ? "-" : existing?.reviewedAt ?? "-",
      activePurchaseOrders: existing?.activePurchaseOrders ?? 0,
      riskLevel: draft.riskLevel,
      note: draft.note.trim(),
      operationLogs: [
        {
          time: demoTimestamp,
          actor: demoOperator,
          action: mode === "submit" ? "提交审核" : existing ? "更新供应商资料" : "新建供应商资料",
          result: "成功",
        },
        ...baseLogs,
      ],
      changeLogs: [
        {
          time: demoTimestamp,
          actor: demoOperator,
          field: mode === "submit" ? "审核状态" : "主数据更新",
          before: existing?.auditStatus ?? "-",
          after: nextAuditStatus,
        },
        ...baseChanges,
      ],
      approvalLogs:
        mode === "submit"
          ? [
              {
                node: "供应商主数据审批",
                actor: "待采购主管处理",
                result: "待审核",
                opinion: "等待审批",
                time: "-",
              },
              ...baseApprovals.filter((item) => item.result !== "待审核"),
            ]
          : baseApprovals,
    };

    setSupplierRecords((current) => {
      const exists = current.some((item) => item.code === code);
      if (!exists) {
        return [nextRecord, ...current];
      }
      return current.map((item) => (item.code === code ? nextRecord : item));
    });
    setSupplierCurrentCode(code);
    return code;
  }

  function approveSupplier(code: string) {
    setSupplierRecords((current) =>
      current.map((item) =>
        item.code === code
          ? {
              ...item,
              auditStatus: "已审核",
              reviewedBy: "采购主管",
              reviewedAt: demoTimestamp,
              updatedBy: "采购主管",
              updatedAt: demoTimestamp,
              operationLogs: [
                { time: demoTimestamp, actor: "采购主管", action: "审核通过", result: "成功" },
                ...item.operationLogs,
              ],
              approvalLogs: [
                {
                  node: "供应商主数据审批",
                  actor: "采购主管",
                  result: "通过",
                  opinion: "资料完整，允许启用。",
                  time: demoTimestamp,
                },
                ...item.approvalLogs.filter((log) => log.result !== "待审核"),
              ],
            }
          : item,
      ),
    );
  }

  function retrySupplierPush(code: string) {
    setSupplierRecords((current) =>
      current.map((item) =>
        item.code === code
          ? {
              ...item,
              kingdeeStatus: "推送成功",
              updatedBy: demoOperator,
              updatedAt: demoTimestamp,
              operationLogs: [
                { time: demoTimestamp, actor: demoOperator, action: "重推金蝶", result: "成功" },
                ...item.operationLogs,
              ],
            }
          : item,
      ),
    );
  }

  function handleSupplierLifecycle(code: string, mode: SupplierLifecycleMode, reason: string) {
    setSupplierRecords((current) =>
      current.map((item) =>
        item.code === code
          ? {
              ...item,
              lifecycleStatus: mode === "disable" ? "停止合作" : "正常",
              updatedBy: demoOperator,
              updatedAt: demoTimestamp,
              note: mode === "disable" && reason ? `${item.note}；停止合作原因：${reason}` : item.note,
              operationLogs: [
                {
                  time: demoTimestamp,
                  actor: demoOperator,
                  action: mode === "disable" ? "停止合作" : "恢复合作",
                  result: "成功",
                  remark: reason || undefined,
                },
                ...item.operationLogs,
              ],
              changeLogs: [
                {
                  time: demoTimestamp,
                  actor: demoOperator,
                  field: "供应商生命周期状态",
                  before: item.lifecycleStatus,
                  after: mode === "disable" ? "停止合作" : "正常",
                },
                ...item.changeLogs,
              ],
            }
          : item,
      ),
    );
    setSupplierCurrentCode(code);
    setSupplierNotice({
      tone: "success",
      title: mode === "disable" ? "已停止合作" : "已恢复合作",
      description:
        mode === "disable"
          ? "供应商已移出采购下单范围，历史记录仍保留供查询。"
          : "供应商已恢复合作，可重新参与寻源、下单和结算流程。",
    });
  }

  function generateCustomerCode(existingCode?: string) {
    if (existingCode) {
      return existingCode;
    }

    return `CUS20260322${String(customerRecords.length + 1).padStart(3, "0")}`;
  }

  function upsertCustomerRecord(draft: CustomerFormData, mode: "save" | "submit") {
    const existing = customerRecords.find((item) => item.code === draft.code);
    const code = generateCustomerCode(draft.code);
    const nextStatus = mode === "submit" ? "待审核" : existing?.status === "已审核" ? "待提交" : "待提交";
    const nextKingdeeStatus = mode === "submit" ? "未推送" : existing?.kingdeeStatus ?? draft.kingdeeStatus;
    const baseLogs = existing?.operationLogs ?? [];
    const baseChanges = existing?.changeLogs ?? [];
    const baseApprovals = existing?.approvalLogs ?? [];
    const nextRecord: CustomerRecord = {
      code,
      name: draft.name.trim(),
      group: draft.group,
      type: draft.type,
      parentGroup: draft.parentGroup,
      status: nextStatus,
      kingdeeStatus: nextKingdeeStatus,
      currency: draft.currency,
      socialCreditCode: draft.socialCreditCode.trim(),
      note: draft.note.trim(),
      contactName: draft.contactName.trim(),
      contactPhone: draft.contactPhone.trim(),
      contactEmail: draft.contactEmail.trim(),
      address: { ...draft.address },
      createdBy: existing?.createdBy ?? demoOperator,
      createdAt: existing?.createdAt ?? demoTimestamp,
      updatedBy: demoOperator,
      updatedAt: demoTimestamp,
      reviewedBy: mode === "submit" ? "-" : existing?.reviewedBy ?? "-",
      reviewedAt: mode === "submit" ? "-" : existing?.reviewedAt ?? "-",
      operationLogs: [
        {
          time: demoTimestamp,
          actor: demoOperator,
          action: mode === "submit" ? "提交审核" : existing ? "更新客户资料" : "新建客户资料",
          result: "成功",
        },
        ...baseLogs,
      ],
      changeLogs: [
        {
          time: demoTimestamp,
          actor: demoOperator,
          field: mode === "submit" ? "状态" : "主数据更新",
          before: existing?.status ?? "-",
          after: nextStatus,
        },
        ...baseChanges,
      ],
      approvalLogs:
        mode === "submit"
          ? [
              {
                node: "客户主数据审批",
                actor: "待销售平台主管处理",
                result: "待审核",
                opinion: "等待审批",
                time: "-",
              },
              ...baseApprovals.filter((item) => item.result !== "待审核"),
            ]
          : baseApprovals,
    };

    setCustomerRecords((current) => {
      const exists = current.some((item) => item.code === code);
      if (!exists) {
        return [nextRecord, ...current];
      }
      return current.map((item) => (item.code === code ? nextRecord : item));
    });
    setCustomerCurrentCode(code);
    return code;
  }

  function approveCustomer(code: string) {
    setCustomerRecords((current) =>
      current.map((item) =>
        item.code === code
          ? {
              ...item,
              status: "已审核",
              reviewedBy: "销售平台主管",
              reviewedAt: demoTimestamp,
              updatedBy: "销售平台主管",
              updatedAt: demoTimestamp,
              operationLogs: [
                { time: demoTimestamp, actor: "销售平台主管", action: "审核通过", result: "成功" },
                ...item.operationLogs,
              ],
              approvalLogs: [
                {
                  node: "客户主数据审批",
                  actor: "销售平台主管",
                  result: "通过",
                  opinion: "客户主体与结算信息完整，允许推送金蝶。",
                  time: demoTimestamp,
                },
                ...item.approvalLogs.filter((log) => log.result !== "待审核"),
              ],
            }
          : item,
      ),
    );
  }

  function retryCustomerPush(code: string) {
    setCustomerRecords((current) =>
      current.map((item) =>
        item.code === code
          ? {
              ...item,
              kingdeeStatus: "推送成功",
              updatedBy: demoOperator,
              updatedAt: demoTimestamp,
              operationLogs: [
                { time: demoTimestamp, actor: demoOperator, action: "重推金蝶", result: "成功" },
                ...item.operationLogs,
              ],
            }
          : item,
      ),
    );
  }

  const activeNavItemId =
    activeTab === "home" ||
    activeTab === "design-system" ||
    activeTab === "shell-capabilities" ||
    activeTab === "system-status" ||
    activeTab === "export-task-center" ||
    activeTab === "message-center"
      ? undefined
      : activeTab.startsWith("supplier-")
        ? "supplier"
        : activeTab.startsWith("customer-")
          ? "customer"
          : activeTab === "inventory-query"
            ? "inventory-query"
          : activeTab === "inventory-flow-query"
            ? "inventory-flow-query"
          : "purchase-order";

  const currentTenant = tenantOptions.find((item) => item.id === currentTenantId) ?? tenantOptions[0];

  return (
    <AppShell
      tabs={tabs}
      currentTab={activeTab}
      onTabChange={(key) => activateTab(key as WorkspaceTabKey)}
      onTabClose={(key) => closeTab(key as WorkspaceTabKey)}
      activeNavItemId={activeNavItemId}
      secondaryNavItems={[
        { id: "design-system", label: "Design System", icon: Palette },
        { id: "shell-capabilities", label: "壳层能力", icon: LayoutGrid },
        { id: "system-status", label: "系统状态", icon: AlertTriangle },
      ]}
      activeSecondaryNavId={
        activeTab === "design-system"
          ? "design-system"
          : activeTab === "shell-capabilities"
            ? "shell-capabilities"
            : activeTab === "system-status"
              ? "system-status"
              : undefined
      }
      onNavItemSelect={(key) => {
        if (key === "purchase-order") {
          openWorkspaceTab("list");
        }
        if (key === "inventory-query") {
          openInventoryQuery();
        }
        if (key === "inventory-flow-query") {
          openInventoryFlowQuery();
        }
        if (key === "supplier") {
          openSupplierList();
        }
        if (key === "customer") {
          openCustomerList();
        }
      }}
      onSecondaryNavSelect={(key) => {
        if (key === "design-system") {
          openWorkspaceTab("design-system");
        }
        if (key === "shell-capabilities") {
          openShellCapabilities();
        }
        if (key === "system-status") {
          openSystemStatus();
        }
      }}
      onProfileAction={() => showPendingAlert("个人中心")}
      onThemeSwitchAction={() => setThemeModalOpen(true)}
      onLanguageAction={() => showPendingAlert("语言切换")}
      onLogoutAction={() => showPendingAlert("退出登录")}
      tenantOptions={tenantOptions}
      currentTenantId={currentTenant.id}
      onTenantChange={(tenantId) => {
        const nextTenant = tenantOptions.find((item) => item.id === tenantId);
        if (!nextTenant || nextTenant.id === currentTenant.id) {
          return;
        }

        setCurrentTenantId(nextTenant.id);
        showFloatingAlert({
          tone: "info",
          title: "租户已切换",
          description: `当前上下文已切换到${nextTenant.name}，这里先演示全局入口与提示反馈。`,
        });
      }}
      notificationUnreadCount={notificationUnreadCount}
      notificationPreviewItems={notificationPreviewItems}
      onNotificationItemOpen={(id) => openMessageCenter("all", id)}
      onNotificationMarkAllRead={markFeedMessagesAsRead}
      onNotificationViewMore={() => openMessageCenter("all")}
      exportTaskAttentionCount={exportTaskAttentionCount}
      onExportTaskCenterOpen={() => openExportTaskCenter()}
    >
      {activeTab === "home" && (
        <HomePage
          onOpenList={() => openWorkspaceTab("list")}
          onOpenCreate={() => openWorkspaceTab("create")}
          onOpenInventoryQuery={openInventoryQuery}
          onOpenInventoryFlowQuery={openInventoryFlowQuery}
          onOpenSupplierList={openSupplierList}
          onOpenCustomerList={openCustomerList}
          onOpenExportTaskCenter={() => openExportTaskCenter()}
          onOpenShellCapabilities={openShellCapabilities}
          onOpenSystemStatus={() => openSystemStatus()}
          onOpenImport={() => {
            setImportStage("select");
            setImportOpen(true);
          }}
        />
      )}
      {activeTab === "design-system" && <DesignSystemPage />}
      {activeTab === "shell-capabilities" && (
        <ShellCapabilitiesPage
          onOpenMessageCenter={() => openMessageCenter("all")}
          onOpenMessageDrawer={() => openMessageCenter("all", "msg-002")}
          onOpenExportTaskCenter={() => openExportTaskCenter()}
          onOpenSystemStatus={() => openSystemStatus()}
          onOpenPurchaseList={() => openWorkspaceTab("list")}
          onOpenThemeModal={() => setThemeModalOpen(true)}
          onShowAlert={showFloatingAlert}
        />
      )}
      {activeTab === "system-status" && (
        <SystemStatusPage activeVariant={systemStatusVariant} onVariantChange={setSystemStatusVariant} />
      )}
      {activeTab === "export-task-center" && (
        <ExportTaskCenterPage
          records={exportTasks}
          activeStatus={exportTaskStatus}
          activeTaskId={exportTaskActiveId}
          onStatusChange={setExportTaskStatus}
          onOpenTask={setExportTaskActiveId}
          onCloseTask={() => setExportTaskActiveId(null)}
          onOpenSource={openExportTaskSource}
          onDownloadTask={downloadExportTask}
          onRetryTask={retryExportTask}
          onClearFinished={clearFinishedExportTasks}
        />
      )}
      {activeTab === "message-center" && (
        <MessageCenterPage
          records={messageRecords}
          activeCategory={messageCenterCategory}
          onlyUnread={messageCenterOnlyUnread}
          selectedIds={messageCenterSelectedIds}
          activeMessageId={messageCenterActiveMessageId}
          onCategoryChange={(category) => {
            setMessageCenterCategory(category);
            setMessageCenterSelectedIds([]);
          }}
          onOnlyUnreadChange={setMessageCenterOnlyUnread}
          onSelectedIdsChange={setMessageCenterSelectedIds}
          onOpenMessage={openMessageDetail}
          onCloseMessage={() => setMessageCenterActiveMessageId(null)}
          onMarkSelectedRead={markSelectedMessagesAsRead}
          onOpenRelated={openMessageRelatedTarget}
          onOpenSettings={() => showPendingAlert("消息设置")}
        />
      )}
      {activeTab === "inventory-query" && (
        <InventoryQueryPage
          onCreateExportTask={({ recordCount }) =>
            addExportTask({
              taskName: "即时库存查询导出",
              sourceLabel: "即时库存查询",
              sourceTarget: "inventory-query",
              rangeLabel: `当前筛选结果（${recordCount}条）`,
              format: "xlsx",
              fieldCount: 12,
              recordCount,
            })
          }
        />
      )}
      {activeTab === "inventory-flow-query" && (
        <InventoryFlowQueryPage
          onCreateExportTask={({ recordCount }) =>
            addExportTask({
              taskName: "库存流水查询导出",
              sourceLabel: "库存流水查询",
              sourceTarget: "inventory-flow-query",
              rangeLabel: `当前筛选结果（${recordCount}条）`,
              format: "csv",
              fieldCount: 12,
              recordCount,
            })
          }
        />
      )}
      {activeTab === "list" && (
        <ListPage
          scenario={listScenario}
          onScenarioChange={setListScenario}
          onOpenCreate={() => openWorkspaceTab("create")}
          onOpenEdit={() => openWorkspaceTab("edit")}
          onOpenDetail={() => openWorkspaceTab("detail")}
          onOpenImport={() => {
            setImportStage("select");
            setImportOpen(true);
          }}
          onOpenExport={() => setExportOpen(true)}
          onShowAlert={showFloatingAlert}
        />
      )}
      {(activeTab === "create" || activeTab === "edit") && (
        <EditPage
          mode={activeTab as EditorMode}
          scenario={editScenario}
          onScenarioChange={setEditScenario}
          onBackToList={() => openWorkspaceTab("list")}
          onShowAlert={showFloatingAlert}
        />
      )}
      {activeTab === "detail" && (
        <DetailPage
          scenario={detailScenario}
          onScenarioChange={setDetailScenario}
          activeTab={detailTab}
          onTabChange={setDetailTab}
          onOpenEdit={() => openWorkspaceTab("edit")}
        />
      )}
      {activeTab === "supplier-list" && (
        <SupplierListPage
          records={supplierRecords}
          scenario={supplierListScenario}
          onScenarioChange={setSupplierListScenario}
          onOpenCreate={openSupplierCreate}
          onOpenEdit={openSupplierEdit}
          onOpenDetail={openSupplierDetail}
          onOpenImport={() => {
            setSupplierImportStage("select");
            setSupplierImportOpen(true);
          }}
          onOpenExport={() => setSupplierExportOpen(true)}
          onOpenLifecycle={(code, mode) => {
            setSupplierLifecycleCode(code);
            setSupplierLifecycleMode(mode);
            setSupplierLifecycleOpen(true);
          }}
          notice={supplierNotice}
          onClearNotice={() => setSupplierNotice(null)}
        />
      )}
      {activeTab === "customer-list" && (
        <CustomerListPage
          records={customerRecords}
          scenario={customerListScenario}
          onScenarioChange={setCustomerListScenario}
          onOpenCreate={openCustomerCreate}
          onOpenEdit={openCustomerEdit}
          onOpenDetail={openCustomerDetail}
          onOpenImport={() => {
            setCustomerImportStage("select");
            setCustomerImportOpen(true);
          }}
          onOpenExport={() => setCustomerExportOpen(true)}
          notice={customerNotice}
          onClearNotice={() => setCustomerNotice(null)}
        />
      )}
      {(activeTab === "supplier-create" || activeTab === "supplier-edit") && (
        <SupplierEditPage
          mode={activeTab === "supplier-create" ? "create" : "edit"}
          scenario={supplierEditScenario}
          record={activeTab === "supplier-edit" ? currentSupplier : undefined}
          existingRecords={supplierRecords}
          onScenarioChange={setSupplierEditScenario}
          onBackToList={openSupplierList}
          onSaveDraft={(draft) => upsertSupplierRecord(draft, "save")}
          onSubmit={(draft) => upsertSupplierRecord(draft, "submit")}
          onOpenDetail={openSupplierDetail}
        />
      )}
      {(activeTab === "customer-create" || activeTab === "customer-edit") && (
        <CustomerEditPage
          mode={activeTab === "customer-create" ? "create" : "edit"}
          scenario={customerEditScenario}
          record={activeTab === "customer-edit" ? currentCustomer : undefined}
          existingRecords={customerRecords}
          onScenarioChange={setCustomerEditScenario}
          onBackToList={openCustomerList}
          onSaveDraft={(draft) => upsertCustomerRecord(draft, "save")}
          onSubmit={(draft) => upsertCustomerRecord(draft, "submit")}
          onOpenDetail={openCustomerDetail}
        />
      )}
      {activeTab === "supplier-detail" && currentSupplier ? (
        <SupplierDetailPage
          record={currentSupplier}
          scenario={supplierDetailScenario}
          activeTab={supplierDetailTab}
          onScenarioChange={setSupplierDetailScenario}
          onTabChange={setSupplierDetailTab}
          onOpenEdit={openSupplierEdit}
          onApprove={approveSupplier}
          onRetryPush={retrySupplierPush}
          onOpenLifecycle={(code, mode) => {
            setSupplierLifecycleCode(code);
            setSupplierLifecycleMode(mode);
            setSupplierLifecycleOpen(true);
          }}
        />
      ) : null}
      {activeTab === "customer-detail" && currentCustomer ? (
        <CustomerDetailPage
          record={currentCustomer}
          scenario={customerDetailScenario}
          activeTab={customerDetailTab}
          onScenarioChange={setCustomerDetailScenario}
          onTabChange={setCustomerDetailTab}
          onOpenEdit={openCustomerEdit}
          onApprove={approveCustomer}
          onRetryPush={retryCustomerPush}
        />
      ) : null}

      <ImportModal
        open={importOpen}
        stage={importStage}
        mode={importMode}
        onModeChange={setImportMode}
        onClose={() => setImportOpen(false)}
        onStart={() => setImportStage("loading")}
        onReset={() => setImportStage("select")}
      />
      <ExportModal
        open={exportOpen}
        exportRange={exportRange}
        exportFormat={exportFormat}
        onRangeChange={setExportRange}
        onFormatChange={setExportFormat}
        onClose={() => setExportOpen(false)}
        onConfirm={() => {
          setExportOpen(false);
          addExportTask({
            taskName: "采购订单列表导出",
            sourceLabel: "采购订单列表",
            sourceTarget: "purchase-list",
            rangeLabel:
              exportRange === "all"
                ? "全部数据（245条）"
                : exportRange === "selected"
                  ? "仅选中数据（2条）"
                  : "当前筛选结果（38条）",
            format: exportFormat as "xlsx" | "csv",
            fieldCount: 8,
            recordCount: exportRange === "all" ? 245 : exportRange === "selected" ? 2 : 38,
          });
        }}
      />
      <SupplierImportModal
        open={supplierImportOpen}
        stage={supplierImportStage}
        mode={supplierImportMode}
        onModeChange={setSupplierImportMode}
        onClose={() => setSupplierImportOpen(false)}
        onStart={() => setSupplierImportStage("loading")}
        onReset={() => setSupplierImportStage("select")}
        onFinish={(result) => {
          setSupplierImportOpen(false);
          setSupplierImportStage("select");
          setSupplierNotice(
            result === "success"
              ? {
                  tone: "success",
                  title: "导入完成",
                  description: "供应商主数据已导入完成，可继续筛选、查看或提交审核。",
                }
              : result === "partial"
                ? {
                    tone: "warning",
                    title: "导入完成（部分失败）",
                    description: "部分供应商数据未通过校验，请下载失败明细后修正再导入。",
                  }
                : {
                    tone: "error",
                    title: "导入失败",
                    description: "模板版本或文件格式异常，请重新下载模板后再次导入。",
                  },
          );
        }}
      />
      <CustomerImportModal
        open={customerImportOpen}
        stage={customerImportStage}
        mode={customerImportMode}
        onModeChange={setCustomerImportMode}
        onClose={() => setCustomerImportOpen(false)}
        onStart={() => setCustomerImportStage("loading")}
        onReset={() => setCustomerImportStage("select")}
        onFinish={(result) => {
          setCustomerImportOpen(false);
          setCustomerImportStage("select");
          setCustomerNotice(
            result === "success"
              ? {
                  tone: "success",
                  title: "导入完成",
                  description: "客户主数据已导入完成，可继续筛选、查看或提交审核。",
                }
              : result === "partial"
                ? {
                    tone: "warning",
                    title: "导入完成（部分失败）",
                    description: "部分客户数据未通过校验，请下载失败明细后修正再导入。",
                  }
                : {
                    tone: "error",
                    title: "导入失败",
                    description: "模板版本或文件格式异常，请重新下载模板后再次导入。",
                  },
          );
        }}
      />
      <SupplierExportModal
        open={supplierExportOpen}
        exportRange={supplierExportRange}
        exportFormat={supplierExportFormat}
        onRangeChange={setSupplierExportRange}
        onFormatChange={setSupplierExportFormat}
        onClose={() => setSupplierExportOpen(false)}
        onConfirm={() => {
          setSupplierExportOpen(false);
          addExportTask({
            taskName: "供应商主数据导出",
            sourceLabel: "供应商主数据",
            sourceTarget: "supplier-list",
            rangeLabel:
              supplierExportRange === "all"
                ? "全部数据（4条）"
                : supplierExportRange === "selected"
                  ? "仅选中数据（2条）"
                  : "当前筛选结果（2条）",
            format: supplierExportFormat as "xlsx" | "csv",
            fieldCount: 10,
            recordCount: supplierExportRange === "all" ? 4 : 2,
          });
        }}
      />
      <CustomerExportModal
        open={customerExportOpen}
        exportRange={customerExportRange}
        exportFormat={customerExportFormat}
        onRangeChange={setCustomerExportRange}
        onFormatChange={setCustomerExportFormat}
        onClose={() => setCustomerExportOpen(false)}
        onConfirm={() => {
          setCustomerExportOpen(false);
          addExportTask({
            taskName: "客户主数据导出",
            sourceLabel: "客户主数据",
            sourceTarget: "customer-list",
            rangeLabel:
              customerExportRange === "all"
                ? "全部数据（4条）"
                : customerExportRange === "selected"
                  ? "仅选中数据（2条）"
                  : "当前筛选结果（2条）",
            format: customerExportFormat as "xlsx" | "csv",
            fieldCount: 9,
            recordCount: customerExportRange === "all" ? 4 : 2,
          });
        }}
      />
      <Modal open={themeModalOpen} title="主题色切换" widthClassName="max-w-[min(100%,760px)] w-full" onClose={() => setThemeModalOpen(false)}>
        <div className="space-y-3">
          <div className="rounded-md border border-border bg-bg-subtle px-4 py-2.5 text-small text-text-secondary">
            切换后会同时更新主按钮、激活态页签、页面底色、浅层悬浮底色和边框层级，并自动记住本次选择。
          </div>

          <div className="grid gap-3 md:grid-cols-2">
          {themeOptions.map((theme) => {
            const active = theme.key === activeTheme;
            return (
              <div
                key={theme.key}
                role="button"
                tabIndex={0}
                onClick={() => applyTheme(theme.key)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    applyTheme(theme.key);
                  }
                }}
                className={`cursor-pointer rounded-md border p-3.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-subtle ${
                  active ? "border-primary bg-white shadow-sm" : "border-border bg-white hover:border-primary-subtle hover:shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-body font-section-title text-text-primary">{theme.label}</div>
                    <div className="mt-1 text-small text-text-muted">{theme.description}</div>
                  </div>
                  {active ? <Badge tone="processing" className="shrink-0">当前使用</Badge> : null}
                </div>

                <div className="mt-3">
                  <div className="mb-2 text-mini text-text-muted">品牌交互色</div>
                  <div className="grid grid-cols-4 gap-2">
                  <ThemeColorSwatch label="主色" color={theme.colors.primary} />
                  <ThemeColorSwatch label="Hover" color={theme.colors.hover} />
                  <ThemeColorSwatch label="Subtle" color={theme.colors.subtle} />
                  <ThemeColorSwatch label="Active" color={theme.colors.active} />
                </div>
                </div>

                <div className="mt-3">
                  <div className="mb-2 text-mini text-text-muted">页面层级色</div>
                  <div className="grid grid-cols-4 gap-2">
                    <ThemeColorSwatch label="Page" color={theme.colors.page} />
                    <ThemeColorSwatch label="Panel" color={theme.colors.panel} />
                    <ThemeColorSwatch label="Hover" color={theme.colors.hoverSurface} />
                    <ThemeColorSwatch label="Border" color={theme.colors.border} borderless />
                  </div>
                </div>

                <div className="mt-3">
                  <Button
                    className="w-full"
                    size="sm"
                    variant={active ? "secondary" : "primary"}
                    onClick={(event) => {
                      event.stopPropagation();
                      applyTheme(theme.key);
                    }}
                  >
                    {active ? "当前使用中" : "应用这套主题"}
                  </Button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </Modal>
      <SupplierLifecycleModal
        open={supplierLifecycleOpen}
        record={lifecycleSupplier}
        mode={supplierLifecycleMode}
        onClose={() => setSupplierLifecycleOpen(false)}
        onConfirm={(code, mode, reason) => handleSupplierLifecycle(code, mode, reason)}
      />
      <FloatingAlert notice={floatingAlert} />
    </AppShell>
  );
}

function ThemeColorSwatch({
  label,
  color,
  borderless = false,
}: {
  label: string;
  color: string;
  borderless?: boolean;
}) {
  return (
    <div>
      <div
        className={`h-10 rounded-sm ${borderless ? "" : "border border-border"}`}
        style={{ background: color }}
      />
      <div className="mt-1.5 text-mini text-text-muted">{label}</div>
    </div>
  );
}

function HomePage({
  onOpenList,
  onOpenCreate,
  onOpenInventoryQuery,
  onOpenInventoryFlowQuery,
  onOpenSupplierList,
  onOpenCustomerList,
  onOpenExportTaskCenter,
  onOpenShellCapabilities,
  onOpenSystemStatus,
  onOpenImport,
}: {
  onOpenList: () => void;
  onOpenCreate: () => void;
  onOpenInventoryQuery: () => void;
  onOpenInventoryFlowQuery: () => void;
  onOpenSupplierList: () => void;
  onOpenCustomerList: () => void;
  onOpenExportTaskCenter: () => void;
  onOpenShellCapabilities: () => void;
  onOpenSystemStatus: () => void;
  onOpenImport: () => void;
}) {
  const shortcuts = [
    {
      title: "采购订单列表",
      description: "回到核心列表页，继续查询、筛选、批量处理和状态跟进。",
      action: "打开列表",
      icon: ClipboardList,
      onClick: onOpenList,
    },
    {
      title: "新建采购订单",
      description: "直接进入录单页，继续补头信息、商品明细和金额汇总。",
      action: "新建单据",
      icon: Plus,
      onClick: onOpenCreate,
    },
    {
      title: "导入采购订单",
      description: "下载模板、上传文件并查看导入结果，适合批量建单。",
      action: "打开导入",
      icon: ArrowDownToLine,
      onClick: onOpenImport,
    },
    {
      title: "客户主数据",
      description: "进入客户列表，维护客户分组、客户类型、审核状态和金蝶推送结果。",
      action: "打开主数据",
      icon: Users,
      onClick: onOpenCustomerList,
    },
    {
      title: "即时库存查询",
      description: "按货主、仓库、商品和品类组合查询即时库存，重点查看可用、预占和冻结数量。",
      action: "打开查询",
      icon: Warehouse,
      onClick: onOpenInventoryQuery,
    },
    {
      title: "库存流水查询",
      description: "按操作时间、业务单号和动作类型查询库存变动流水，重点对比变动前后数量。",
      action: "打开查询",
      icon: ScrollText,
      onClick: onOpenInventoryFlowQuery,
    },
    {
      title: "供应商主数据",
      description: "进入供应商列表，维护准入资料、审核状态、金蝶推送和合作开关。",
      action: "打开主数据",
      icon: Building2,
      onClick: onOpenSupplierList,
    },
    {
      title: "壳层能力",
      description: "集中查看全局搜索、消息通知、用户菜单、工作台Tab、覆盖式抽屉和顶部轻提示。",
      action: "打开参考页",
      icon: LayoutGrid,
      onClick: onOpenShellCapabilities,
    },
    {
      title: "导出任务中心",
      description: "统一查看导出任务状态、下载结果和失败重试，不再散落在各页面里单独提示。",
      action: "打开任务中心",
      icon: Download,
      onClick: onOpenExportTaskCenter,
    },
    {
      title: "系统状态",
      description: "集中查看403、404、登录过期和系统维护等系统状态页基线，用作后续异常页参考。",
      action: "打开参考页",
      icon: AlertTriangle,
      onClick: onOpenSystemStatus,
    },
  ];

  const reminders = [
    { label: "待审核采购单", value: "18", tone: "pending" as const, hint: "下午4点前需完成首轮审核" },
    { label: "异常待处理", value: "3", tone: "error" as const, hint: "2条下推失败，1条金额校验异常" },
    { label: "最近打开", value: "采购订单", tone: "processing" as const, hint: "上次停留在列表页第2页" },
  ];

  const recentActions = [
    { icon: Clock3, title: "最近访问", desc: "采购订单列表、即时库存查询、库存流水查询、供应商主数据、客户主数据" },
    {
      icon: CircleAlert,
      title: "样例范围",
      desc: "采购订单、即时库存查询、库存流水查询、供应商主数据、客户主数据、壳层能力与消息中心、系统状态页是7个常见案例，七者共用同一套规范与CSS基线。",
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="首页"
        description="系统默认着陆页，可快速打开采购订单、即时库存查询、库存流水查询、供应商主数据、客户主数据、壳层能力与消息中心、系统状态页这7个常见案例。"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="h-full">
              <div className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary-subtle text-primary">
                    <Icon aria-hidden="true" strokeWidth={1.8} className="h-5 w-5" />
                  </div>
                  <Badge tone="draft">快捷入口</Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-body font-section-title text-text-primary">{item.title}</div>
                  <div className="text-small leading-ui-relaxed text-text-muted">{item.description}</div>
                </div>
                <div className="mt-auto">
                  <Button size="sm" variant="primary" onClick={item.onClick}>
                    {item.action}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card title="今日提醒">
          <div className="grid gap-3 md:grid-cols-3">
            {reminders.map((item) => (
              <div key={item.label} className="info-kpi">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-small text-text-muted">{item.label}</span>
                  <Badge tone={item.tone}>{item.value}</Badge>
                </div>
                <div className="mt-3 text-small text-text-secondary">{item.hint}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="首页说明">
          <div className="space-y-4">
            {recentActions.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-sm bg-bg-subtle text-text-secondary">
                    <Icon aria-hidden="true" strokeWidth={1.8} className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-body text-text-primary">{item.title}</div>
                    <div className="text-small leading-ui-relaxed text-text-muted">{item.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ListPage({
  scenario,
  onScenarioChange,
  onOpenCreate,
  onOpenEdit,
  onOpenDetail,
  onOpenImport,
  onOpenExport,
  onShowAlert,
}: {
  scenario: ListScenario;
  onScenarioChange: (value: ListScenario) => void;
  onOpenCreate: () => void;
  onOpenEdit: () => void;
  onOpenDetail: () => void;
  onOpenImport: () => void;
  onOpenExport: () => void;
  onShowAlert: (notice: FloatingAlertInput) => void;
}) {
  const showTable = scenario === "normal" || scenario === "partial-success";
  type PurchaseOrderStatusTab = "全部" | "待提交" | "待审核" | "已审核" | "已取消";
  const queryFields: RichField[] = [
    { label: "采购单号", kind: "input", placeholder: "请输入采购单号" },
    {
      label: "业务类型",
      kind: "select",
      value: "全部",
      options: [
        { label: "全部", value: "全部" },
        { label: "普通采购", value: "普通采购" },
        { label: "寄售采购", value: "寄售采购" },
      ],
    },
    {
      label: "采购组织",
      kind: "select",
      value: "华东采购中心",
      options: [
        { label: "华东采购中心", value: "华东采购中心" },
        { label: "华南采购中心", value: "华南采购中心" },
      ],
    },
    { label: "供应商", kind: "input", placeholder: "请输入供应商名称" },
    { label: "创建日期", kind: "date", value: "2026-03-22" },
    {
      label: "收货仓库",
      kind: "select",
      value: "上海生鲜仓",
      options: [
        { label: "上海生鲜仓", value: "上海生鲜仓" },
        { label: "杭州冷链仓", value: "杭州冷链仓" },
      ],
    },
    { label: "采购员", kind: "input", placeholder: "请输入采购员" },
    { label: "外部单号", kind: "input", placeholder: "请输入外部单号" },
    {
      label: "来源渠道",
      kind: "select",
      value: "ERP手工创建",
      options: [
        { label: "ERP手工创建", value: "ERP手工创建" },
        { label: "需求计划下发", value: "需求计划下发" },
      ],
    },
    { label: "仅看我的单据", kind: "checkbox", checked: true, controlLabel: "仅显示当前登录人创建或负责的单据" },
    { label: "是否紧急", kind: "switch", checked: false, checkedLabel: "加急采购", uncheckedLabel: "普通优先级" },
    { label: "预计到货日期", kind: "date", value: "2026-03-25" },
  ];
  const [rows, setRows] = useState(purchaseOrders);
  const [selectedIds, setSelectedIds] = useState<string[]>(purchaseOrders.slice(0, 2).map((row) => row.id));
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [activeStatusTab, setActiveStatusTab] = useState<PurchaseOrderStatusTab>("全部");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [sortState, setSortState] = useState<TableSortState<string>>(null);
  const statusTabs: PurchaseOrderStatusTab[] = ["全部", "待提交", "待审核", "已审核", "已取消"];
  const filteredRows = useMemo(
    () => (activeStatusTab === "全部" ? rows : rows.filter((row) => row.status === activeStatusTab)),
    [activeStatusTab, rows],
  );
  const visibleQueryFields = getVisibleQuerySectionItems(queryFields, showMoreFilters);
  const hasCollapsedQueryFields = hasCollapsedQuerySectionItems(queryFields);
  const statusTabItems = statusTabs.map((status) => ({
    value: status,
    label:
      status === "全部"
        ? `全部（${rows.length}）`
        : `${status}（${rows.filter((row) => row.status === status).length}）`,
  }));

  function toggleRowSelection(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleCurrentPageSelection() {
    const currentPageIds = pagedRows.map((row) => row.id);
    if (allCurrentPageSelected) {
      setSelectedIds((current) => current.filter((id) => !currentPageIds.includes(id)));
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...currentPageIds])));
  }

  function handleBatchStatusChange(
    nextStatus: Exclude<PurchaseOrderStatusTab, "全部">,
    allowedStatuses: Array<Exclude<PurchaseOrderStatusTab, "全部">>,
    successTitle: string,
  ) {
    const selectedRows = rows.filter((row) => selectedIds.includes(row.id));
    const eligibleRows = selectedRows.filter((row) => allowedStatuses.includes(row.status as Exclude<PurchaseOrderStatusTab, "全部">));

    if (eligibleRows.length === 0) {
      onShowAlert({
        tone: "warning",
        title: "没有可处理的采购单",
        description: "当前选中的采购单状态不满足这次批量操作条件。",
      });
      return;
    }

    setRows((current) =>
      current.map((row) =>
        selectedIds.includes(row.id) && allowedStatuses.includes(row.status as Exclude<PurchaseOrderStatusTab, "全部">)
          ? { ...row, status: nextStatus }
          : row,
      ),
    );
    setSelectedIds([]);

    const skippedCount = selectedRows.length - eligibleRows.length;
    onShowAlert({
      tone: skippedCount > 0 ? "warning" : "success",
      title: successTitle,
      description:
        skippedCount > 0
          ? `已处理${eligibleRows.length}条，另有${skippedCount}条因状态不符合已跳过。`
          : `已处理${eligibleRows.length}条采购单，列表状态与Tab数量已同步更新。`,
    });
  }

  const purchaseOrderColumns = useMemo(
    () =>
      [
        { id: "select", label: "选择", group: "系统字段", required: true, defaultFixed: true, width: 56 },
        { id: "id", label: "采购单号", group: "基础信息", required: true, defaultFixed: true, width: 156 },
        { id: "type", label: "业务类型", group: "基础信息", width: 124 },
        { id: "status", label: "状态", group: "基础信息", defaultFixed: true, width: 116 },
        { id: "supplier", label: "供应商", group: "基础信息", width: 220 },
        { id: "organization", label: "采购组织", group: "基础信息", width: 140 },
        { id: "warehouse", label: "收货仓库", group: "基础信息", width: 140 },
        { id: "amount", label: "金额合计", group: "金额与执行", width: 140, align: "right" as const, sortType: "currency" as TableSortType, getSortValue: (row: PurchaseOrderRow) => row.amount },
        { id: "pushed", label: "下推/入库", group: "金额与执行", width: 126 },
        { id: "createdAt", label: "创建时间", group: "制单信息", width: 168, sortType: "datetime" as TableSortType, getSortValue: (row: PurchaseOrderRow) => row.createdAt },
        { id: "owner", label: "采购员", group: "制单信息", width: 110 },
        { id: "externalOrderNo", label: "外部单号", group: "扩展字段", defaultVisible: false, width: 144 },
        { id: "sourceChannel", label: "来源渠道", group: "扩展字段", defaultVisible: false, width: 128 },
        { id: "remark", label: "备注", group: "扩展字段", defaultVisible: false, width: 180 },
        { id: "actions", label: "操作", group: "系统字段", required: true, width: 168 },
      ] satisfies Array<ColumnSettingsField & { width: number; align?: "left" | "right"; sortType?: TableSortType; getSortValue?: (row: PurchaseOrderRow) => unknown }>,
    [],
  );

  const {
    state: purchaseColumnState,
    defaultState: purchaseDefaultColumnState,
    applyState: applyPurchaseColumnState,
  } = usePersistedColumnSettings({
    storageKey: "column-settings:demo-user:purchase-order-list",
    fields: purchaseOrderColumns,
    defaultDensity: "medium",
  });
  const { beginResize, widths: columnWidths } = useTableColumnResize({
    state: purchaseColumnState,
    applyState: applyPurchaseColumnState,
  });

  const visibleColumns = useMemo(() => {
    return purchaseColumnState.order
      .filter((id) => purchaseColumnState.visible.includes(id))
      .map((id) => purchaseOrderColumns.find((column) => column.id === id))
      .filter((column): column is (typeof purchaseOrderColumns)[number] => Boolean(column));
  }, [purchaseColumnState.order, purchaseColumnState.visible, purchaseOrderColumns]);

  const fixedLeftMap = useMemo(() => {
    const fixedSet = new Set(purchaseColumnState.fixed);
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
  }, [columnWidths, purchaseColumnState.fixed, visibleColumns]);
  const sortConfigs = useMemo(
    () =>
      purchaseOrderColumns.reduce<Partial<Record<string, TableSortConfig<PurchaseOrderRow>>>>((configs, column) => {
        if (!column.sortType || !column.getSortValue) {
          return configs;
        }

        configs[column.id] = {
          type: column.sortType,
          getValue: column.getSortValue,
        };
        return configs;
      }, {}),
    [purchaseOrderColumns],
  );
  const sortedRows = useMemo(() => sortTableRows(filteredRows, sortState, sortConfigs), [filteredRows, sortConfigs, sortState]);
  const totalCount = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pagedRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);
  const allCurrentPageSelected = pagedRows.length > 0 && pagedRows.every((row) => selectedIds.includes(row.id));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function getPurchaseColumnCell(row: (typeof purchaseOrders)[number], columnId: string) {
    if (columnId === "select") {
      return <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleRowSelection(row.id)} />;
    }

    if (columnId === "id") {
      return (
        <button className="text-link hover:text-link-hover" onClick={onOpenDetail} type="button">
          {row.id}
        </button>
      );
    }

    if (columnId === "type") {
      return row.type;
    }

    if (columnId === "status") {
      return renderStatus(row.status);
    }

    if (columnId === "supplier") {
      return (
        <div className="max-w-[180px] truncate" title={row.supplier}>
          {row.supplier}
        </div>
      );
    }

    if (columnId === "organization") {
      return row.organization;
    }

    if (columnId === "warehouse") {
      return row.warehouse;
    }

    if (columnId === "amount") {
      return row.amount;
    }

    if (columnId === "pushed") {
      return `${row.pushedQty} / ${row.inboundQty}`;
    }

    if (columnId === "createdAt") {
      return row.createdAt;
    }

    if (columnId === "owner") {
      return row.owner;
    }

    if (columnId === "externalOrderNo") {
      return `1688-${row.id.slice(-4)}`;
    }

    if (columnId === "sourceChannel") {
      return row.id === "PO20260321002" ? "需求计划下发" : "ERP手工创建";
    }

    if (columnId === "remark") {
      return row.status === "已取消" ? "已取消单据，仅保留查看与日志能力" : "已同步跟进收货计划";
    }

    if (columnId === "actions") {
      return (
        <div className="flex items-center gap-actions">
          <button className="text-link" onClick={onOpenDetail} type="button">
            详情
          </button>
          <button className="text-link" onClick={onOpenEdit} type="button">
            编辑
          </button>
          <button className="text-link" type="button">
            更多
          </button>
        </div>
      );
    }

    return "-";
  }

  return (
    <div className="space-y-page-block">
      <DemoToolbar label="列表页" items={listTabs} value={scenario} onChange={onScenarioChange} />
      <PageHeader
        title="采购订单列表"
        description="高频查询、状态Tab切换、批量审核和取消统一在列表页完成。"
        actions={
          <>
            <Button variant="primary" onClick={onOpenCreate}>
              新增采购订单
            </Button>
            <Button onClick={onOpenImport}>导入</Button>
            <Button onClick={onOpenExport}>导出</Button>
            <Button
              onClick={() =>
                onShowAlert({
                  tone: "warning",
                  title: "打印功能暂未纳入当前案例范围",
                  description: "当前先保留打印入口占位，后续如规划会补打印模板、打印参数和任务回执。",
                })
              }
            >
              打印
            </Button>
          </>
        }
      />

      <Card>
        <div className="query-section-grid 2xl:grid-cols-7">
          {visibleQueryFields.map((field) => (
            <FieldBlock key={field.label} field={field} />
          ))}
        </div>
        <div className="query-section-actions">
          <div className="query-section-action-group">
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
            <Button variant="secondary">重置</Button>
            <Button variant="primary">查询</Button>
          </div>
        </div>
      </Card>

      {scenario === "no-auth" ? (
        <ExceptionState
          variant="403"
          description="当前用户无采购订单列表访问权限。请联系管理员开通采购模块菜单和数据范围权限。"
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

      {scenario === "empty" ? (
        <ExceptionState
          variant="404"
          title="空数据"
          description="当前组织下还没有采购订单，建议从“新增采购订单”开始创建。"
          primaryAction={<Button variant="primary" onClick={onOpenCreate}>新增采购订单</Button>}
        />
      ) : null}

      {scenario === "no-result" ? (
        <ExceptionState
          variant="404"
          title="查询无结果"
          description="没有符合当前筛选条件的采购订单，请调整筛选项后重试。"
          primaryAction={<Button variant="primary">重置条件</Button>}
          secondaryAction={<Button>重新查询</Button>}
        />
      ) : null}

      {showTable ? (
        <>
          {scenario === "partial-success" ? (
            <Banner
              tone="warning"
              title="批量审核完成，部分成功"
              description="已成功审核2单，1单因状态变化失败。失败明细应支持下载或结果弹窗查看。"
              action={<Button size="sm">查看失败明细</Button>}
            />
          ) : null}

          <ListPageMainCard>
            <div className="px-4 pt-3">
              <Tabs
                items={statusTabItems}
                value={activeStatusTab}
                onChange={(value) => {
                  setActiveStatusTab(value);
                  setSelectedIds([]);
                  setPage(1);
                }}
              />
            </div>
            <ListPageToolbar>
              <div className="list-toolbar-group">
                <label className="flex items-center gap-control">
                  <input type="checkbox" checked={allCurrentPageSelected} onChange={toggleCurrentPageSelection} />
                  全选
                </label>
                <span>已选中{selectedIds.length}条</span>
                <Button
                  size="sm"
                  disabled={selectedIds.length === 0}
                  onClick={() => handleBatchStatusChange("已审核", ["待提交", "待审核"], "批量审核已完成")}
                >
                  批量审核
                </Button>
                <Button
                  size="sm"
                  disabled={selectedIds.length === 0}
                  onClick={() => handleBatchStatusChange("已取消", ["待提交", "待审核", "已审核"], "批量取消已完成")}
                >
                  批量取消
                </Button>
                <Button size="sm" disabled={selectedIds.length === 0} onClick={onOpenExport}>
                  批量导出
                </Button>
              </div>
              <div className="list-toolbar-group">
                <IconActionButton label="列设置" onClick={() => setColumnSettingsOpen(true)}>
                  <Settings2 aria-hidden="true" strokeWidth={1.8} className="h-4 w-4" />
                </IconActionButton>
              </div>
            </ListPageToolbar>
            <HorizontalScrollArea viewportClassName={getDensityClassName(purchaseColumnState.density)}>
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
                            className={`${column.align === "right" ? "text-right" : ""} ${
                              isFixed ? "table-fixed-cell is-body" : ""
                            }`}
                            style={{
                              width,
                              minWidth: width,
                              left,
                            }}
                          >
                            {getPurchaseColumnCell(row, column.id)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </HorizontalScrollArea>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              pageSizeOptions={[20, 50, 100]}
              onPageChange={setPage}
              onPageSizeChange={(value) => {
                setPageSize(value);
                setPage(1);
              }}
            />
          </ListPageMainCard>
        </>
      ) : null}
      <ColumnSettingsModal
        open={columnSettingsOpen}
        title="采购订单列设置"
        fields={purchaseOrderColumns}
        state={purchaseColumnState}
        defaultState={purchaseDefaultColumnState}
        onClose={() => setColumnSettingsOpen(false)}
        onApply={applyPurchaseColumnState}
      />
    </div>
  );
}

function EditPage({
  mode,
  scenario,
  onScenarioChange,
  onBackToList,
  onShowAlert,
}: {
  mode: EditorMode;
  scenario: EditScenario;
  onScenarioChange: (value: EditScenario) => void;
  onBackToList: () => void;
  onShowAlert: (notice: FloatingAlertInput) => void;
}) {
  const readOnly = scenario === "read-only";
  const basicFields: RichField[] = [
    {
      label: "采购组织",
      kind: "select",
      value: "华东采购中心",
      options: [
        { label: "华东采购中心", value: "华东采购中心" },
        { label: "华南采购中心", value: "华南采购中心" },
      ],
    },
    { label: "供应商", kind: "input", value: "华东生鲜原料供应商有限公司" },
    {
      label: "业务类型",
      kind: "select",
      value: "普通采购",
      options: [
        { label: "普通采购", value: "普通采购" },
        { label: "寄售采购", value: "寄售采购" },
      ],
    },
    { label: "单据日期", kind: "date", value: "2026-03-22" },
    { label: "预计到货日期", kind: "date", value: "2026-03-25" },
    { label: "采购员", kind: "input", value: "张敏" },
    {
      label: "收货仓库",
      kind: "select",
      value: "上海生鲜仓",
      options: [
        { label: "上海生鲜仓", value: "上海生鲜仓" },
        { label: "杭州冷链仓", value: "杭州冷链仓" },
      ],
    },
    {
      label: "结算方式",
      kind: "select",
      value: "月结30天",
      options: [
        { label: "月结30天", value: "月结30天" },
        { label: "预付全款", value: "预付全款" },
      ],
    },
    { label: "是否紧急", kind: "switch", checked: true, checkedLabel: "加急采购", uncheckedLabel: "普通优先级", readOnlyValue: "是" },
    { label: "允许分批到货", kind: "switch", checked: false, checkedLabel: "允许分批", uncheckedLabel: "不允许分批", readOnlyValue: "否" },
    { label: "自动生成入库通知", kind: "checkbox", checked: true, controlLabel: "保存后自动生成", readOnlyValue: "已开启" },
    { label: "锁定价格", kind: "checkbox", checked: false, controlLabel: "按当前协议价执行", readOnlyValue: "未锁定" },
  ];
  const [editableLineItems, setEditableLineItems] = useState<PurchaseLineItemRow[]>(() => createInitialPurchaseLineItems());
  const [nextManualRowIndex, setNextManualRowIndex] = useState(1);
  const [nextImportedRowIndex, setNextImportedRowIndex] = useState(1);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([
    { id: "att-001", name: "采购合同.pdf", size: "1.6MB", status: "uploaded" },
    { id: "att-002", name: "报价单.xlsx", size: "240KB", status: "uploaded" },
  ]);

  useEffect(() => {
    setEditableLineItems(createInitialPurchaseLineItems());
    setNextManualRowIndex(1);
    setNextImportedRowIndex(1);
    setAttachments([
      { id: "att-001", name: "采购合同.pdf", size: "1.6MB", status: "uploaded" },
      { id: "att-002", name: "报价单.xlsx", size: "240KB", status: "uploaded" },
    ]);
  }, [mode]);

  const lineItemSummary = useMemo(() => {
    const totalQty = editableLineItems.reduce((sum, item) => sum + parseNumericInput(item.qty), 0);
    const totalAmount = editableLineItems.reduce((sum, item) => sum + calculateLineAmount(item.qty, item.price, item.taxRate), 0);
    const totalTax = editableLineItems.reduce((sum, item) => sum + calculateTaxAmount(item.qty, item.price, item.taxRate), 0);

    return {
      totalQty: formatQuantity(totalQty),
      totalAmount: formatDecimal(totalAmount),
      totalTax: formatDecimal(totalTax),
    };
  }, [editableLineItems]);

  function updateLineItem(rowId: string, field: keyof Omit<PurchaseLineItemRow, "rowId" | "amount">, value: string) {
    setEditableLineItems((current) =>
      current.map((item) => {
        if (item.rowId !== rowId) {
          return item;
        }

        const nextItem = { ...item, [field]: value };
        return {
          ...nextItem,
          amount: formatDecimal(calculateLineAmount(nextItem.qty, nextItem.price, nextItem.taxRate)),
        };
      }),
    );
  }

  function appendLineItem() {
    const nextIndex = nextManualRowIndex;
    setNextManualRowIndex((current) => current + 1);
    setEditableLineItems((current) => [
      ...current,
      createPurchaseLineItemRow(`manual-${nextIndex}`, {
        sku: `NEW-${String(nextIndex).padStart(3, "0")}`,
        taxRate: "13%",
      }),
    ]);
    onShowAlert({
      tone: "success",
      title: "已新增1行商品明细",
      description: "请继续填写商品编码、数量、单价和交期等信息。",
    });
  }

  function importLineItems() {
    const startIndex = nextImportedRowIndex;
    const importedRows = [
      createPurchaseLineItemRow(`import-${startIndex}`, {
        sku: `IMP-${String(startIndex).padStart(3, "0")}`,
        name: "冷藏牛乳",
        spec: "12盒/箱",
        unit: "箱",
        qty: "36",
        price: "48.00",
        taxRate: "13%",
        eta: "2026-03-27",
      }),
      createPurchaseLineItemRow(`import-${startIndex + 1}`, {
        sku: `IMP-${String(startIndex + 1).padStart(3, "0")}`,
        name: "烘焙面粉",
        spec: "25kg/袋",
        unit: "袋",
        qty: "18",
        price: "126.00",
        taxRate: "13%",
        eta: "2026-03-28",
      }),
    ];

    setNextImportedRowIndex((current) => current + importedRows.length);
    setEditableLineItems((current) => [...current, ...importedRows]);
    onShowAlert({
      tone: "success",
      title: "已导入2行商品明细示例",
      description: "导入后的明细已写入表格，可继续调整数量、单价和交期。",
    });
  }

  function addAttachment() {
    const nextId = `att-${Date.now()}`;
    setAttachments((current) => [
      ...current,
      { id: nextId, name: `补充附件_${current.length + 1}.pdf`, size: "860KB", status: "uploaded" },
    ]);
    onShowAlert({
      tone: "success",
      title: "附件已上传",
      description: "附件已写入当前单据草稿，可继续补充说明或提交审核。",
    });
  }

  return (
    <div className="space-y-page-block">
      <DemoToolbar label={mode === "create" ? "新建页" : "编辑页"} items={editTabs} value={scenario} onChange={onScenarioChange} />
      <PageHeader
        title={
          mode === "create"
            ? "新建采购订单"
            : readOnly
              ? "编辑采购订单 PO20260321001（只读）"
              : "编辑采购订单 PO20260321001"
        }
        description="头信息与明细联动、校验和状态控制都要在骨架阶段显式保留。新建页与编辑页作为独立业务页签并行存在。"
        actions={
          <>
            <Button onClick={onBackToList}>返回列表</Button>
            <Button disabled={readOnly}>保存</Button>
            <Button disabled={readOnly}>保存并新增</Button>
            <Button variant="primary" disabled={readOnly}>
              提交审核
            </Button>
          </>
        }
      />

      {scenario === "save-failed" ? (
        <Banner tone="error" title="保存失败" description="供应商已被停用，当前草稿无法保存，请刷新供应商信息后重试。" />
      ) : null}
      {scenario === "submit-failed" ? (
        <Banner tone="error" title="提交失败" description="商品明细存在数量为0的行，提交前必须修复完整校验错误。" />
      ) : null}
      {scenario === "conflict" ? (
        <Banner tone="warning" title="并发冲突" description="数据已被他人修改，请刷新后重新编辑，系统不允许在未知最新数据上静默覆盖。" />
      ) : null}

      <Card title="基础信息卡片" extra={<span className="text-small text-text-muted">Label在上，控件在下，宽屏4列</span>}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {basicFields.map((field) => (
            <FieldBlock key={field.label} field={field} readOnly={readOnly} />
          ))}
        </div>
      </Card>

      <Card
        title="商品明细卡片"
        extra={
          <div className="flex items-center gap-actions">
            <Button
              size="sm"
              onClick={() =>
                onShowAlert({
                  tone: "warning",
                  title: "历史成交功能暂未纳入当前案例范围",
                  description: "当前先保留入口占位，后续如规划会补历史成交弹窗、筛选条件和引用回填逻辑。",
                })
              }
            >
              历史成交
            </Button>
            <Button size="sm" disabled={readOnly} onClick={appendLineItem}>
              新增行
            </Button>
            <Button size="sm" disabled={readOnly} onClick={importLineItems}>
              批量导入
            </Button>
          </div>
        }
      >
        <HorizontalScrollArea>
          <table>
            <thead>
              <tr>
                <th>商品编码</th>
                <th>商品名称</th>
                <th>规格</th>
                <th>单位</th>
                <th>数量</th>
                <th>含税单价</th>
                <th>税率</th>
                <th>价税合计</th>
                <th>交期</th>
              </tr>
            </thead>
            <tbody>
              {editableLineItems.map((item) => (
                <tr key={item.rowId}>
                  <td>
                    {readOnly ? (
                      <span className="display-cell">{item.sku || "-"}</span>
                    ) : (
                      <input className="field-control h-9 min-w-[112px]" value={item.sku} placeholder="请输入" onChange={(event) => updateLineItem(item.rowId, "sku", event.target.value)} />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      <span className="display-cell">{item.name || "-"}</span>
                    ) : (
                      <input className="field-control h-9 min-w-[160px]" value={item.name} placeholder="请输入" onChange={(event) => updateLineItem(item.rowId, "name", event.target.value)} />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      <span className="display-cell">{item.spec || "-"}</span>
                    ) : (
                      <input className="field-control h-9 min-w-[112px]" value={item.spec} placeholder="请输入" onChange={(event) => updateLineItem(item.rowId, "spec", event.target.value)} />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      <span className="display-cell">{item.unit || "-"}</span>
                    ) : (
                      <input className="field-control h-9 min-w-[72px]" value={item.unit} placeholder="请输入" onChange={(event) => updateLineItem(item.rowId, "unit", event.target.value)} />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      <span className="display-cell">{item.qty}</span>
                    ) : (
                      <input className="field-control h-9 min-w-[88px]" value={item.qty} placeholder="请输入" onChange={(event) => updateLineItem(item.rowId, "qty", event.target.value)} />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      <span className="display-cell">{item.price}</span>
                    ) : (
                      <input className="field-control h-9 min-w-[96px]" value={item.price} placeholder="请输入" onChange={(event) => updateLineItem(item.rowId, "price", event.target.value)} />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      <span className="display-cell">{item.taxRate}</span>
                    ) : (
                      <input className="field-control h-9 min-w-[84px]" value={item.taxRate} placeholder="请输入" onChange={(event) => updateLineItem(item.rowId, "taxRate", event.target.value)} />
                    )}
                  </td>
                  <td>{item.amount}</td>
                  <td>
                    {readOnly ? (
                      <span className="display-cell">{item.eta || "-"}</span>
                    ) : (
                      <input className="field-control h-9 min-w-[136px]" type="date" value={item.eta} placeholder="请选择" onChange={(event) => updateLineItem(item.rowId, "eta", event.target.value)} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </HorizontalScrollArea>
        <div className="mt-4 flex items-center justify-end gap-6 text-small text-text-secondary">
          <span>数量合计：{lineItemSummary.totalQty}</span>
          <span>金额合计：{lineItemSummary.totalAmount}</span>
          <span>税额合计：{lineItemSummary.totalTax}</span>
        </div>
      </Card>

      <Card title="其他关键信息卡片">
        <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <DescriptionList
              columns={2}
              items={[
                { label: "成交金额", value: "17,763.60" },
                { label: "成本口径", value: "财务角色可见" },
              ]}
            />
            <div>
              <div className="field-label">业务备注</div>
              {readOnly ? (
                <div className="display-field">优先安排周三早班到货</div>
              ) : (
                <Textarea defaultValue="优先安排周三早班到货" placeholder="请输入" />
              )}
            </div>
          </div>
          <div>
            <div className="field-label">附件</div>
            <AttachmentPanel
              items={attachments}
              onUpload={addAttachment}
              onDownload={() =>
                onShowAlert({
                  tone: "success",
                  title: "附件下载已触发",
                  description: "系统已开始下载附件文件，请检查浏览器下载列表。",
                })
              }
              onDelete={(id) => setAttachments((current) => current.filter((item) => item.id !== id))}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

function DetailPage({
  scenario,
  onScenarioChange,
  activeTab,
  onTabChange,
  onOpenEdit,
}: {
  scenario: DetailScenario;
  onScenarioChange: (value: DetailScenario) => void;
  activeTab: DetailTab;
  onTabChange: (value: DetailTab) => void;
  onOpenEdit: () => void;
}) {
  if (scenario === "no-auth") {
    return (
      <div className="space-y-page-block">
        <DemoToolbar label="详情页" items={detailTabs} value={scenario} onChange={onScenarioChange} />
        <PageHeader
          title="采购订单详情"
          description="详情页必须补齐无权限、只读和上下游失败场景。"
        />
        <ExceptionState
          variant="403"
          description="当前用户有列表查看权限，但无采购订单详情访问权限。请联系管理员开通详情页权限后再进入。"
          primaryAction={<Button variant="primary">联系管理员</Button>}
          secondaryAction={<Button>返回列表</Button>}
        />
      </div>
    );
  }

  const closed = scenario === "closed";

  return (
    <div className="space-y-page-block">
      <DemoToolbar label="详情页" items={detailTabs} value={scenario} onChange={onScenarioChange} />
      <PageHeader
        title="采购订单详情"
        description="详情页标题区采用左信息右操作，状态、创建时间等关键元信息不进入右侧操作区。"
      />

      <section className="detail-hero">
        <div className="detail-hero-main">
          <div className="detail-hero-title-row">
            <h2 className="page-title">PO20260321001</h2>
            <Badge tone={closed ? "closed" : "success"}>{closed ? "已取消" : "已审核"}</Badge>
            <Badge tone="draft">华东采购中心</Badge>
          </div>
          <div className="detail-hero-meta">
            <span>创建人：张敏</span>
            <span>创建时间：2026-03-21 10:32:11</span>
            <span>采购组织：华东采购中心</span>
            <span>采购员：张敏</span>
          </div>
        </div>
        <div className="detail-hero-actions">
          <Button onClick={onOpenEdit} disabled={closed}>
            编辑
          </Button>
          <Button disabled={closed}>取消</Button>
          <Button variant="primary" disabled={closed}>
            下推
          </Button>
        </div>
      </section>

      {scenario === "downstream-failed" ? (
        <Banner
          tone="warning"
          title="下游生成失败"
          description="入库通知单生成了2条，另有1条明细因仓库关闭失败，需支持查看失败原因和重试入口。"
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="基本信息">
          <DescriptionList
            items={[
              { label: "采购单号", value: "PO20260321001" },
              { label: "采购组织", value: "华东采购中心" },
              { label: "供应商", value: "华东生鲜原料供应商有限公司" },
              { label: "业务类型", value: "普通采购" },
              { label: "创建人", value: "张敏" },
              { label: "创建时间", value: "2026-03-21 10:32:11" },
              { label: "收货仓库", value: "上海生鲜仓" },
              { label: "采购员", value: "张敏" },
            ]}
          />
        </Card>
        <Card title="财务信息">
          <DescriptionList
            items={[
              { label: "结算方式", value: "月结30天" },
              { label: "币种", value: "CNY" },
              { label: "金额合计", value: "128,000.00" },
              { label: "税额合计", value: "14,725.66" },
              { label: "已入库金额", value: "56,800.00" },
              { label: "成本口径", value: "按角色脱敏" },
            ]}
            columns={3}
          />
        </Card>
      </div>

      <Card title="附件与备注">
        <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
          <AttachmentPanel
            items={[
              { id: "detail-att-001", name: "采购合同.pdf", size: "1.6MB", status: "uploaded" },
              { id: "detail-att-002", name: "补充报价单.xlsx", size: "240KB", status: "uploaded" },
            ]}
            readonly
            onUpload={() => {}}
            onDownload={() => {}}
            onDelete={() => {}}
          />
          <div className="rounded-md border border-border bg-bg-subtle p-section">
            <div className="text-body font-section-title text-text-primary">业务备注</div>
            <div className="mt-2 text-body leading-ui-relaxed text-text-secondary">
              优先安排周三早班到货。若下游仓库满仓，请先联系仓配确认可预约时段，再继续生成入库通知单。
            </div>
          </div>
        </div>
      </Card>

      <Card title="Tab区">
        <Tabs
          items={[
            { label: "商品明细", value: "items" },
            { label: "关联单据", value: "related" },
            { label: "操作日志", value: "logs" },
            { label: "审批记录", value: "approvals" },
          ]}
          value={activeTab}
          onChange={onTabChange}
        />
        <div className="mt-4">
          {activeTab === "items" ? <ItemsTable /> : null}
          {activeTab === "related" ? <RelatedTable /> : null}
          {activeTab === "logs" ? <PurchaseTimeline items={operationLogs.map(mapPurchaseOperationLogToTimeline)} /> : null}
          {activeTab === "approvals" ? <ApprovalTable /> : null}
        </div>
      </Card>
    </div>
  );
}

function ImportModal({
  open,
  stage,
  mode,
  onModeChange,
  onClose,
  onStart,
  onReset,
}: {
  open: boolean;
  stage: ImportStage;
  mode: Exclude<ImportStage, "select" | "loading">;
  onModeChange: (value: Exclude<ImportStage, "select" | "loading">) => void;
  onClose: () => void;
  onStart: () => void;
  onReset: () => void;
}) {
  return (
    <Modal open={open} title="导入采购订单" onClose={onClose}>
      {stage === "select" ? (
        <ImportSelectStage
          intro="请先下载模板并按字段格式填写。支持`.xlsx`和`.csv`，单次最多1,000条。"
          templateName="采购订单导入模板.xlsx"
          templateDescription="包含头信息、明细信息和字段填写说明。"
          modeItems={[
            { label: "全部成功", value: "success" },
            { label: "行级部分失败", value: "partial" },
            { label: "文件级失败", value: "file-error" },
          ]}
          modeValue={mode}
          onModeChange={(value) => onModeChange(value as Exclude<ImportStage, "select" | "loading">)}
          onClose={onClose}
          onStart={onStart}
        />
      ) : null}

      {stage === "loading" ? (
        <ImportLoadingState title="正在导入数据，请稍候…" description="系统正在校验文件格式并写入采购订单。" />
      ) : null}

      {stage === "success" ? (
        <ImportResult
          tone="success"
          title="导入成功"
          description="全部52条记录已成功导入系统。"
          showDetail={false}
          onReset={onReset}
          onClose={onClose}
        />
      ) : null}

      {stage === "partial" ? (
        <ImportResult
          tone="warning"
          title="导入完成（部分失败）"
          description="共52条，成功48条，4条因数据错误已跳过。"
          showDetail
          onReset={onReset}
          onClose={onClose}
        />
      ) : null}

      {stage === "file-error" ? (
        <ImportResult
          tone="error"
          title="导入失败"
          description="文件格式异常，无法解析。请确认使用官方导入模板且文件未损坏。"
          showDetail={false}
          onReset={onReset}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}

function ExportModal({
  open,
  exportRange,
  exportFormat,
  onRangeChange,
  onFormatChange,
  onClose,
  onConfirm,
}: {
  open: boolean;
  exportRange: string;
  exportFormat: string;
  onRangeChange: (value: string) => void;
  onFormatChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const fields = [
    "采购单号",
    "业务类型",
    "状态",
    "供应商",
    "采购组织",
    "收货仓库",
    "采购员",
    "金额合计",
  ];

  return (
    <Modal open={open} title="导出采购订单" onClose={onClose}>
      <div className="space-y-5">
        <section>
          <div className="mb-3 text-small text-text-muted">导出范围</div>
          <RadioGroup
            value={exportRange}
            options={[
              { label: "全部数据（245条）", value: "all" },
              { label: "当前筛选结果（38条）", value: "filtered" },
              { label: "仅选中数据（2条）", value: "selected" },
            ]}
            onValueChange={onRangeChange}
          />
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between text-small text-text-muted">
            <span>导出字段</span>
            <span>已选8/12</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {fields.map((field) => (
              <Checkbox
                key={field}
                defaultChecked
                label={field}
                variant="inline"
                containerClassName="rounded-sm border border-border bg-white px-3 py-2 text-small text-text-secondary"
              />
            ))}
          </div>
        </section>
        <section>
          <div className="mb-3 text-small text-text-muted">文件格式</div>
          <RadioGroup
            value={exportFormat}
            options={[
              { label: "Excel (.xlsx)", value: "xlsx" },
              { label: "CSV (.csv)", value: "csv" },
            ]}
            direction="horizontal"
            variant="card"
            onValueChange={onFormatChange}
          />
        </section>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-small text-text-muted">将导出38条记录，共8个字段。</span>
          <div className="flex gap-2">
            <Button onClick={onClose}>取消</Button>
            <Button variant="primary" onClick={onConfirm}>
              确认导出
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ItemsTable() {
  return (
    <HorizontalScrollArea>
      <table>
        <thead>
          <tr>
            <th>商品编码</th>
            <th>商品名称</th>
            <th>规格</th>
            <th>单位</th>
            <th>数量</th>
            <th>含税单价</th>
            <th>税率</th>
            <th>价税合计</th>
            <th>已入库数量</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => (
            <tr key={item.sku}>
              <td>{item.sku}</td>
              <td>{item.name}</td>
              <td>{item.spec}</td>
              <td>{item.unit}</td>
              <td>{item.qty}</td>
              <td>{item.price}</td>
              <td>{item.taxRate}</td>
              <td>{item.amount}</td>
              <td>60</td>
            </tr>
          ))}
        </tbody>
      </table>
    </HorizontalScrollArea>
  );
}

function RelatedTable() {
  return (
    <HorizontalScrollArea>
      <table>
        <thead>
          <tr>
            <th>关系类型</th>
            <th>单据编号</th>
            <th>单据类型</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>跳转</th>
          </tr>
        </thead>
        <tbody>
          {relatedDocuments.map((item) => (
            <tr key={item.id}>
              <td>{item.relation}</td>
              <td>{item.id}</td>
              <td>{item.type}</td>
              <td>{renderStatus(item.status)}</td>
              <td>{item.createdAt}</td>
              <td>
                <button className="text-link" type="button">
                  查看详情
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </HorizontalScrollArea>
  );
}

function mapPurchaseOperationLogToTimeline(item: (typeof operationLogs)[number]) {
  return {
    id: `${item.time}-${item.action}`,
    time: item.time,
    title: `${item.actor} · ${item.action}`,
    description: `处理结果：${item.result}`,
    tone:
      item.result === "成功"
        ? ("success" as const)
        : item.result.includes("失败")
          ? ("error" as const)
          : ("default" as const),
  };
}

function PurchaseTimeline({
  items,
}: {
  items: Array<ReturnType<typeof mapPurchaseOperationLogToTimeline>>;
}) {
  return <Timeline items={items} />;
}

function ApprovalTable() {
  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>审批节点</th>
            <th>审批人</th>
            <th>审批意见</th>
            <th>审批时间</th>
          </tr>
        </thead>
        <tbody>
          {approvalLogs.map((item) => (
            <tr key={`${item.node}-${item.time}`}>
              <td>{item.node}</td>
              <td>{item.actor}</td>
              <td>{item.opinion}</td>
              <td>{item.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ImportResult({
  tone,
  title,
  description,
  showDetail,
  onReset,
  onClose,
}: {
  tone: "success" | "warning" | "error";
  title: string;
  description: string;
  showDetail: boolean;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <ImportResultPanel
      tone={tone}
      title={title}
      description={description}
      metrics={[
        { value: "52", label: "导入总数" },
        { value: "48", label: "成功写入", tone: "success" },
        { value: showDetail ? "4" : "0", label: "失败跳过", tone: "error" },
      ]}
      detailColumns={
        showDetail
          ? [
              { key: "rowNo", label: "行号" },
              { key: "field", label: "字段" },
              { key: "value", label: "填写值" },
              { key: "reason", label: "错误原因" },
            ]
          : []
      }
      detailRows={
        showDetail
          ? [
              { id: "18-supplier", rowNo: "18", field: "供应商", value: "空白", reason: "供应商不能为空" },
              { id: "32-org", rowNo: "32", field: "采购组织", value: "华北测试组织", reason: "当前用户无该组织导入权限" },
            ]
          : []
      }
      detailAction={showDetail ? <Button size="sm">下载失败数据</Button> : undefined}
      onReset={onReset}
      onClose={onClose}
    />
  );
}

function renderStatus(status: string) {
  if (status === "待审核") {
    return <Badge tone="pending">{status}</Badge>;
  }
  if (status === "已审核" || status === "已审批" || status.includes("完成")) {
    return <Badge tone="success">{status}</Badge>;
  }
  if (status.includes("执行") || status.includes("入库")) {
    return <Badge tone="processing">{status}</Badge>;
  }
  if (status.includes("关闭") || status.includes("取消")) {
    return <Badge tone="closed">{status}</Badge>;
  }
  return <Badge tone="draft">{status}</Badge>;
}
