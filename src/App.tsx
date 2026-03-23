import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, Building2, ChevronDown, CircleAlert, ClipboardList, Clock3, House, Palette, Plus, ScrollText, Settings2, Users, Warehouse } from "lucide-react";
import { AppShell } from "./components/app-shell";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import {
  type ColumnSettingsField,
  ColumnSettingsModal,
  getDensityClassName,
  usePersistedColumnSettings,
} from "./components/ui/column-settings";
import { DemoToolbar } from "./components/ui/demo-toolbar";
import { FloatingAlert, type FloatingAlertInput } from "./components/ui/floating-alert";
import { IconActionButton } from "./components/ui/icon-action-button";
import { Modal } from "./components/ui/modal";
import { Select } from "./components/ui/select";
import { Tabs } from "./components/ui/tabs";
import { DesignSystemPage } from "./pages/design-system-page";
import { InventoryFlowQueryPage } from "./pages/inventory-flow-query";
import { InventoryQueryPage } from "./pages/inventory-query";
import {
  approvalLogs,
  lineItems,
  operationLogs,
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

const demoOperator = "当前用户";
const demoTimestamp = "2026-03-22 16:40:00";
const themeStorageKey = "prototype-app-theme";

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
    <button
      type="button"
      aria-pressed={checked}
      className={`switch-control ${checked ? "is-on" : ""}`}
      onClick={() => setChecked((current) => !current)}
    >
      <span className="switch-track">
        <span className="switch-thumb" />
      </span>
      <span>{getSwitchLabel(field, checked)}</span>
    </button>
  );
}

function renderEditableField(field: RichField) {
  if (field.kind === "select") {
    return (
      <Select className="bg-white" defaultValue={field.value} options={field.options ?? []} placeholder="请选择" />
    );
  }

  if (field.kind === "date") {
    return <input className="field-control" type="date" defaultValue={field.value} placeholder="请选择" />;
  }

  if (field.kind === "checkbox") {
    const checkboxLabel = field.controlLabel ?? "已勾选";
    return (
      <label className="choice-control" title={checkboxLabel}>
        <input type="checkbox" defaultChecked={field.checked} />
        <span>{checkboxLabel}</span>
      </label>
    );
  }

  if (field.kind === "switch") {
    return <SwitchFieldControl field={field} />;
  }

  return <input className="field-control" defaultValue={field.value} placeholder="请输入" />;
}

function FieldBlock({ field, readOnly = false }: { field: RichField; readOnly?: boolean }) {
  return (
    <div>
      <div className="field-label">{field.label}</div>
      {readOnly ? <div className="display-field">{getReadOnlyFieldValue(field)}</div> : renderEditableField(field)}
    </div>
  );
}

export default function App() {
  const [activeTheme, setActiveTheme] = useState<ThemeKey>(resolveInitialTheme);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
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

  const tabs = useMemo(() => {
    const definitions = {
      home: { key: "home", label: "首页", closable: false, icon: House },
      "design-system": { key: "design-system", label: "Design System", closable: true, icon: Palette },
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
    activeTab === "home" || activeTab === "design-system"
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

  return (
    <AppShell
      tabs={tabs}
      currentTab={activeTab}
      onTabChange={(key) => activateTab(key as WorkspaceTabKey)}
      onTabClose={(key) => closeTab(key as WorkspaceTabKey)}
      activeNavItemId={activeNavItemId}
      secondaryNavItems={[{ id: "design-system", label: "Design System", icon: Palette }]}
      activeSecondaryNavId={activeTab === "design-system" ? "design-system" : undefined}
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
      }}
      onProfileAction={() => showPendingAlert("个人中心")}
      onThemeSwitchAction={() => setThemeModalOpen(true)}
      onLanguageAction={() => showPendingAlert("语言切换")}
      onLogoutAction={() => showPendingAlert("退出登录")}
    >
      {activeTab === "home" && (
        <HomePage
          onOpenList={() => openWorkspaceTab("list")}
          onOpenCreate={() => openWorkspaceTab("create")}
          onOpenInventoryQuery={openInventoryQuery}
          onOpenInventoryFlowQuery={openInventoryFlowQuery}
          onOpenSupplierList={openSupplierList}
          onOpenCustomerList={openCustomerList}
          onOpenImport={() => {
            setImportStage("select");
            setImportOpen(true);
          }}
        />
      )}
      {activeTab === "design-system" && <DesignSystemPage />}
      {activeTab === "inventory-query" && <InventoryQueryPage onShowAlert={showFloatingAlert} />}
      {activeTab === "inventory-flow-query" && <InventoryFlowQueryPage onShowAlert={showFloatingAlert} />}
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
          setSupplierNotice({
            tone: "success",
            title: "导出任务已创建",
            description: `已按${supplierExportFormat.toUpperCase()}格式创建供应商导出任务，请稍后到下载中心查看。`,
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
          setCustomerNotice({
            tone: "success",
            title: "导出任务已创建",
            description: `已按${customerExportFormat.toUpperCase()}格式创建客户导出任务，请稍后到下载中心查看。`,
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
  onOpenImport,
}: {
  onOpenList: () => void;
  onOpenCreate: () => void;
  onOpenInventoryQuery: () => void;
  onOpenInventoryFlowQuery: () => void;
  onOpenSupplierList: () => void;
  onOpenCustomerList: () => void;
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
      desc: "采购订单、即时库存查询、库存流水查询、供应商主数据、客户主数据是5个常见案例，五者共用同一套规范与CSS基线。",
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="首页"
        description="系统默认着陆页，可快速打开采购订单、即时库存查询、库存流水查询、供应商主数据、客户主数据这5个常见案例。"
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
  const [jumpPage, setJumpPage] = useState("1");
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const statusTabs: PurchaseOrderStatusTab[] = ["全部", "待提交", "待审核", "已审核", "已取消"];
  const filteredRows = useMemo(
    () => (activeStatusTab === "全部" ? rows : rows.filter((row) => row.status === activeStatusTab)),
    [activeStatusTab, rows],
  );
  const totalCount = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const visibleQueryFields = showMoreFilters ? queryFields : queryFields.slice(0, 12);
  const allCurrentPageSelected = pagedRows.length > 0 && pagedRows.every((row) => selectedIds.includes(row.id));
  const statusTabItems = statusTabs.map((status) => ({
    value: status,
    label:
      status === "全部"
        ? `全部（${rows.length}）`
        : `${status}（${rows.filter((row) => row.status === status).length}）`,
  }));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
      setJumpPage(String(totalPages));
    }
  }, [page, totalPages]);

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
        { id: "amount", label: "金额合计", group: "金额与执行", width: 140, align: "right" as const },
        { id: "pushed", label: "下推/入库", group: "金额与执行", width: 126 },
        { id: "createdAt", label: "创建时间", group: "制单信息", width: 168 },
        { id: "owner", label: "采购员", group: "制单信息", width: 110 },
        { id: "externalOrderNo", label: "外部单号", group: "扩展字段", defaultVisible: false, width: 144 },
        { id: "sourceChannel", label: "来源渠道", group: "扩展字段", defaultVisible: false, width: 128 },
        { id: "remark", label: "备注", group: "扩展字段", defaultVisible: false, width: 180 },
        { id: "actions", label: "操作", group: "系统字段", required: true, width: 168 },
      ] satisfies Array<ColumnSettingsField & { width: number; align?: "left" | "right" }>,
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
      left += column.width;
    });

    return leftMap;
  }, [purchaseColumnState.fixed, visibleColumns]);

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

      <Card title="查询筛选区">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {visibleQueryFields.map((field) => (
            <FieldBlock key={field.label} field={field} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-end gap-actions">
          <div className="flex items-center gap-actions">
            {queryFields.length > 12 ? (
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
        <Card title="无权限">
          <div className="rounded-sm border border-danger bg-danger-subtle p-4 text-body text-danger">
            当前用户无采购订单列表访问权限。请联系管理员开通采购模块菜单和数据范围权限。
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

      {scenario === "empty" ? (
        <Card title="空数据">
          <div className="rounded-sm border border-dashed border-border p-8 text-center text-text-muted">
            当前组织下还没有采购订单，建议从“新增采购订单”开始创建。
          </div>
        </Card>
      ) : null}

      {scenario === "no-result" ? (
        <Card title="查询无结果">
          <div className="rounded-sm border border-dashed border-border p-8 text-center text-text-muted">
            没有符合当前筛选条件的采购订单，请调整筛选项后重试。
          </div>
        </Card>
      ) : null}

      {showTable ? (
        <>
          {scenario === "partial-success" ? (
            <div className="state-banner border-warning bg-warning-subtle text-warning">
              <div>
                <div className="font-body-strong">批量审核完成，部分成功</div>
                <div className="mt-1 text-small text-text-secondary">
                  已成功审核2单，1单因状态变化失败。失败明细应支持下载或结果弹窗查看。
                </div>
              </div>
              <Button size="sm">查看失败明细</Button>
            </div>
          ) : null}

          <div className="list-page-main-card">
            <div className="px-4 pt-3">
              <Tabs
                items={statusTabItems}
                value={activeStatusTab}
                onChange={(value) => {
                  setActiveStatusTab(value);
                  setSelectedIds([]);
                  setPage(1);
                  setJumpPage("1");
                }}
              />
            </div>
            <div className="table-toolbar border-b border-border px-4 py-3">
              <div className="flex items-center gap-actions text-body text-text-secondary">
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
              <div className="flex items-center gap-actions">
                <IconActionButton label="列设置" onClick={() => setColumnSettingsOpen(true)}>
                  <Settings2 aria-hidden="true" strokeWidth={1.8} className="h-4 w-4" />
                </IconActionButton>
              </div>
            </div>
            <div className={`overflow-x-auto ${getDensityClassName(purchaseColumnState.density)}`}>
              <table>
                <thead>
                  <tr>
                    {visibleColumns.map((column) => {
                      const left = fixedLeftMap.get(column.id);
                      const isFixed = left !== undefined;

                      return (
                        <th
                          key={column.id}
                          className={`${column.align === "right" ? "text-right" : ""} ${
                            isFixed ? "table-fixed-cell is-header" : ""
                          }`}
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

                        return (
                          <td
                            key={column.id}
                            className={`${column.align === "right" ? "text-right" : ""} ${
                              isFixed ? "table-fixed-cell is-body" : ""
                            }`}
                            style={{
                              width: column.width,
                              minWidth: column.width,
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
            </div>
            <PaginationBar
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
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
    <div className="flex flex-wrap items-center justify-between gap-actions px-4 py-3 text-small text-text-muted">
      <span>共{totalCount}条</span>
      <div className="flex flex-wrap items-center gap-actions">
        <label className="flex items-center gap-control">
          <span>每页</span>
          <Select
            className="h-input-sm w-[92px] bg-white"
            value={String(pageSize)}
            onValueChange={(nextValue) => onPageSizeChange(Number(nextValue))}
            options={[20, 50, 100].map((size) => ({ label: `${size}条`, value: String(size) }))}
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
        <div className="flex items-center gap-control">
          <span>跳转</span>
          <input
            className="field-control h-input-sm w-14"
            inputMode="numeric"
            placeholder="请输入"
            value={jumpPage}
            onChange={(event) => onJumpPageChange(event.target.value.replace(/[^\d]/g, ""))}
          />
          <Button size="sm" onClick={() => goToPage(jumpPage || "1")}>
            确定
          </Button>
        </div>
      </div>
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

  useEffect(() => {
    setEditableLineItems(createInitialPurchaseLineItems());
    setNextManualRowIndex(1);
    setNextImportedRowIndex(1);
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
        <div className="overflow-x-auto">
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
        </div>
        <div className="mt-4 flex items-center justify-end gap-6 text-small text-text-secondary">
          <span>数量合计：{lineItemSummary.totalQty}</span>
          <span>金额合计：{lineItemSummary.totalAmount}</span>
          <span>税额合计：{lineItemSummary.totalTax}</span>
        </div>
      </Card>

      <Card title="其他关键信息卡片">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "成交金额", value: "17,763.60" },
            { label: "附件", value: "采购合同.pdf" },
            { label: "业务备注", value: "优先安排周三早班到货" },
            { label: "成本口径", value: "财务角色可见" },
          ].map((field) => (
            <div key={field.label}>
              <div className="field-label">{field.label}</div>
              {readOnly ? (
                <div className="display-field">{field.value}</div>
              ) : (
                <input className="field-control" defaultValue={field.value} placeholder="请输入" disabled={readOnly} />
              )}
            </div>
          ))}
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
        <Card title="无权限">
          <div className="rounded-sm border border-danger bg-danger-subtle p-4 text-danger">
            当前用户有列表查看权限，但无采购订单详情访问权限。
          </div>
        </Card>
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
          <InfoGrid
            items={[
              ["采购单号", "PO20260321001"],
              ["采购组织", "华东采购中心"],
              ["供应商", "华东生鲜原料供应商有限公司"],
              ["业务类型", "普通采购"],
              ["创建人", "张敏"],
              ["创建时间", "2026-03-21 10:32:11"],
              ["收货仓库", "上海生鲜仓"],
              ["采购员", "张敏"],
            ]}
          />
        </Card>
        <Card title="财务信息">
          <InfoGrid
            items={[
              ["结算方式", "月结30天"],
              ["币种", "CNY"],
              ["金额合计", "128,000.00"],
              ["税额合计", "14,725.66"],
              ["已入库金额", "56,800.00"],
              ["成本口径", "按角色脱敏"],
            ]}
          />
        </Card>
      </div>

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
          {activeTab === "logs" ? <OperationLogTable /> : null}
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
        <div className="space-y-4">
          <div className="rounded-sm border border-info bg-info-subtle p-4 text-small text-text-secondary">
            请先下载模板并按字段格式填写。支持`.xlsx`和`.csv`，单次最多1,000条。
          </div>
          <div className="rounded-sm border border-border p-4">
            <div className="font-body-strong">采购订单导入模板.xlsx</div>
            <div className="mt-2 text-small text-text-muted">包含头信息、明细信息和字段填写说明。</div>
            <Button className="mt-3" size="sm">
              下载模板
            </Button>
          </div>
          <div className="rounded-sm border border-dashed border-border p-8 text-center text-text-muted">
            拖拽文件到此处，或点击选择文件
          </div>
          <div className="rounded-sm border border-border bg-bg-subtle p-4">
            <div className="mb-3 text-small text-text-muted">结果演示模式</div>
            <div className="flex gap-2">
              {[
                { label: "全部成功", value: "success" },
                { label: "行级部分失败", value: "partial" },
                { label: "文件级失败", value: "file-error" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onModeChange(item.value as Exclude<ImportStage, "select" | "loading">)}
                  className={`rounded-sm px-3 py-2 text-small ${
                    mode === item.value ? "bg-primary-subtle text-primary" : "bg-white text-text-secondary"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>取消</Button>
            <Button variant="primary" onClick={onStart}>
              开始导入
            </Button>
          </div>
        </div>
      ) : null}

      {stage === "loading" ? (
        <div className="space-y-4 py-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-bg-hover border-t-primary" />
          <div className="text-body text-text-primary">正在导入数据，请稍候…</div>
          <div className="text-small text-text-muted">系统正在校验文件格式并写入采购订单。</div>
        </div>
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
}: {
  open: boolean;
  exportRange: string;
  exportFormat: string;
  onRangeChange: (value: string) => void;
  onFormatChange: (value: string) => void;
  onClose: () => void;
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
          <div className="space-y-2">
            {[
              ["all", "全部数据（245条）"],
              ["filtered", "当前筛选结果（38条）"],
              ["selected", "仅选中数据（2条）"],
            ].map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-body">
                <input
                  checked={exportRange === value}
                  onChange={() => onRangeChange(value)}
                  type="radio"
                />
                {label}
              </label>
            ))}
          </div>
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between text-small text-text-muted">
            <span>导出字段</span>
            <span>已选8/12</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {fields.map((field) => (
              <label
                key={field}
                className="flex items-center gap-2 rounded-sm border border-border bg-white px-3 py-2 text-small text-text-secondary"
              >
                <input defaultChecked type="checkbox" />
                {field}
              </label>
            ))}
          </div>
        </section>
        <section>
          <div className="mb-3 text-small text-text-muted">文件格式</div>
          <div className="flex gap-3">
            {[
              ["xlsx", "Excel (.xlsx)"],
              ["csv", "CSV (.csv)"],
            ].map(([value, label]) => (
              <label
                key={value}
                className="flex items-center gap-2 rounded-sm border border-border bg-white px-3 py-2 text-small text-text-secondary"
              >
                <input
                  checked={exportFormat === value}
                  onChange={() => onFormatChange(value)}
                  type="radio"
                />
                {label}
              </label>
            ))}
          </div>
        </section>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-small text-text-muted">将导出38条记录，共8个字段。</span>
          <div className="flex gap-2">
            <Button onClick={onClose}>取消</Button>
            <Button variant="primary" onClick={onClose}>
              确认导出
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Banner({
  tone,
  title,
  description,
}: {
  tone: "warning" | "error";
  title: string;
  description: string;
}) {
  const toneClass =
    tone === "warning"
      ? "border-warning bg-warning-subtle text-warning"
      : "border-danger bg-danger-subtle text-danger";

  return (
    <div className={`state-banner ${toneClass}`}>
      <div>
        <div className="font-body-strong">{title}</div>
        <div className="mt-1 text-small text-text-secondary">{description}</div>
      </div>
    </div>
  );
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="description-grid md:grid-cols-2 xl:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="description-item">
          <div className="description-label">{label}</div>
          <div className="description-value">{value}</div>
        </div>
      ))}
    </div>
  );
}

function ItemsTable() {
  return (
    <div className="overflow-x-auto">
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
    </div>
  );
}

function RelatedTable() {
  return (
    <div className="overflow-x-auto">
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
    </div>
  );
}

function OperationLogTable() {
  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>时间</th>
            <th>操作人</th>
            <th>动作</th>
            <th>结果</th>
          </tr>
        </thead>
        <tbody>
          {operationLogs.map((item) => (
            <tr key={`${item.time}-${item.action}`}>
              <td>{item.time}</td>
              <td>{item.actor}</td>
              <td>{item.action}</td>
              <td>{item.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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
  const toneClass =
    tone === "success"
      ? "border-success bg-success-subtle text-success"
      : tone === "warning"
        ? "border-warning bg-warning-subtle text-warning"
        : "border-danger bg-danger-subtle text-danger";

  return (
    <div className="space-y-4">
      <div className={`state-banner ${toneClass}`}>
        <div>
          <div className="font-body-strong">{title}</div>
          <div className="mt-1 text-small text-text-secondary">{description}</div>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="info-kpi">
          <div className="text-page-title font-page-title text-text-primary">52</div>
          <div className="mt-2 text-small text-text-muted">导入总数</div>
        </div>
        <div className="info-kpi">
          <div className="text-page-title font-page-title text-success">48</div>
          <div className="mt-2 text-small text-text-muted">成功写入</div>
        </div>
        <div className="info-kpi">
          <div className="text-page-title font-page-title text-danger">{showDetail ? "4" : "0"}</div>
          <div className="mt-2 text-small text-text-muted">失败跳过</div>
        </div>
      </div>
      {showDetail ? (
        <div className="rounded-sm border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-body-strong text-text-primary">失败明细</span>
            <Button size="sm">下载失败数据</Button>
          </div>
          <table>
            <thead>
              <tr>
                <th>行号</th>
                <th>字段</th>
                <th>填写值</th>
                <th>错误原因</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>18</td>
                <td>供应商</td>
                <td>空白</td>
                <td>供应商不能为空</td>
              </tr>
              <tr>
                <td>32</td>
                <td>采购组织</td>
                <td>华北测试组织</td>
                <td>当前用户无该组织导入权限</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button onClick={onReset}>重新导入</Button>
        <Button variant="primary" onClick={onClose}>
          完成
        </Button>
      </div>
    </div>
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
