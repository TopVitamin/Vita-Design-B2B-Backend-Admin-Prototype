import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Settings2 } from "lucide-react";
import { Banner } from "../components/ui/banner";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import {
  type ColumnSettingsField,
  ColumnSettingsModal,
  getDensityClassName,
  usePersistedColumnSettings,
} from "../components/ui/column-settings";
import { DemoToolbar } from "../components/ui/demo-toolbar";
import { DescriptionList } from "../components/ui/description-list";
import { ExceptionState } from "../components/ui/exception-state";
import { HorizontalScrollArea } from "../components/ui/horizontal-scroll-area";
import { IconActionButton } from "../components/ui/icon-action-button";
import { ImportLoadingState, ImportSelectStage } from "../components/ui/import-dialog-section";
import { Input } from "../components/ui/input";
import { ImportResultPanel } from "../components/ui/import-result-panel";
import { ListPageMainCard, ListPageToolbar } from "../components/ui/list-page-layout";
import { Modal } from "../components/ui/modal";
import { Pagination } from "../components/ui/pagination";
import { PageHeader } from "../components/ui/page-header";
import { getVisibleQuerySectionItems, hasCollapsedQuerySectionItems } from "../components/ui/query-section";
import { RadioGroup } from "../components/ui/radio-group";
import { SegmentedControl } from "../components/ui/segmented-control";
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
import { Textarea } from "../components/ui/textarea";
import { Tabs } from "../components/ui/tabs";
import { Timeline } from "../components/ui/timeline";
import {
  supplierExportFields,
  supplierImportFailures,
  type SupplierAddress,
  type SupplierApprovalLog,
  type SupplierChangeLog,
  type SupplierOperationLog,
  type SupplierRecord,
} from "../data/supplier-master";

export type SupplierListScenario = "normal" | "loading" | "empty" | "no-result" | "no-auth" | "push-warning";
export type SupplierEditScenario = "normal" | "duplicate" | "tax-invalid" | "submit-failed" | "conflict" | "read-only";
export type SupplierDetailScenario = "normal" | "stopped" | "push-failed" | "no-auth";
export type SupplierImportStage = "select" | "loading" | "success" | "partial" | "file-error";
export type SupplierLifecycleMode = "enable" | "disable";
export type SupplierDetailTab = "contact" | "address" | "finance" | "approvals" | "logs" | "changes";
export type SupplierNotice = {
  tone: "success" | "warning" | "error";
  title: string;
  description: string;
} | null;

export type SupplierFormData = {
  code: string;
  name: string;
  category: string;
  lifecycleStatus: SupplierRecord["lifecycleStatus"];
  auditStatus: SupplierRecord["auditStatus"];
  kingdeeStatus: SupplierRecord["kingdeeStatus"];
  organization: string;
  socialCreditCode: string;
  overseasCompany: SupplierRecord["overseasCompany"];
  countryRegion: string;
  bankAccountName: string;
  bankAccountNo: string;
  bankName: string;
  bankBranch: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactTitle: string;
  paymentTerm: string;
  currency: string;
  invoiceType: string;
  taxRate: string;
  taxpayerType: string;
  shippingAddress: SupplierAddress;
  returnAddress: SupplierAddress;
  note: string;
  riskLevel: SupplierRecord["riskLevel"];
};

type FieldOption = {
  label: string;
  value: string;
};

const supplierListTabs = [
  { label: "正常", value: "normal" },
  { label: "加载中", value: "loading" },
  { label: "空数据", value: "empty" },
  { label: "查询无结果", value: "no-result" },
  { label: "无权限", value: "no-auth" },
  { label: "推送异常", value: "push-warning" },
] as const;

const supplierEditTabs = [
  { label: "正常", value: "normal" },
  { label: "名称重复", value: "duplicate" },
  { label: "税率错误", value: "tax-invalid" },
  { label: "提交失败", value: "submit-failed" },
  { label: "并发冲突", value: "conflict" },
  { label: "只读", value: "read-only" },
] as const;

const supplierDetailTabs = [
  { label: "正常", value: "normal" },
  { label: "停止合作", value: "stopped" },
  { label: "推送失败", value: "push-failed" },
  { label: "无权限", value: "no-auth" },
] as const;

const categoryOptions: FieldOption[] = [
  { label: "美妆成品供应商", value: "美妆成品供应商" },
  { label: "包装材料供应商", value: "包装材料供应商" },
  { label: "结算服务供应商", value: "结算服务供应商" },
  { label: "跨境品牌代理商", value: "跨境品牌代理商" },
  { label: "集团内部协同单位", value: "集团内部协同单位" },
];

const lifecycleOptions: FieldOption[] = [
  { label: "新供应商", value: "新供应商" },
  { label: "正常", value: "正常" },
  { label: "预淘汰", value: "预淘汰" },
  { label: "合同到期", value: "合同到期" },
  { label: "停止合作", value: "停止合作" },
];

const organizationOptions: FieldOption[] = [
  { label: "星瀚零售采购有限公司", value: "星瀚零售采购有限公司" },
  { label: "云川品牌供应链有限公司", value: "云川品牌供应链有限公司" },
];

const countryOptions: FieldOption[] = [
  { label: "中国", value: "中国" },
  { label: "中国香港", value: "中国香港" },
  { label: "美国", value: "美国" },
];

const overseasOptions: FieldOption[] = [
  { label: "否", value: "否" },
  { label: "是", value: "是" },
];

const paymentOptions: FieldOption[] = [
  { label: "月结7天", value: "月结7天" },
  { label: "票到15天", value: "票到15天" },
  { label: "月结30天", value: "月结30天" },
  { label: "预付30%", value: "预付30%" },
];

const currencyOptions: FieldOption[] = [
  { label: "人民币", value: "人民币" },
  { label: "美元", value: "美元" },
  { label: "港币", value: "港币" },
];

const invoiceOptions: FieldOption[] = [
  { label: "增值税电子专用发票", value: "增值税电子专用发票" },
  { label: "增值税普通发票", value: "增值税普通发票" },
  { label: "增值税电子普通发票", value: "增值税电子普通发票" },
];

const taxpayerTypeOptions: FieldOption[] = [
  { label: "一般纳税人", value: "一般纳税人" },
  { label: "小规模纳税人", value: "小规模纳税人" },
];

const riskOptions: FieldOption[] = [
  { label: "低", value: "低" },
  { label: "中", value: "中" },
  { label: "高", value: "高" },
];

function createEmptyAddress(): SupplierAddress {
  return {
    contact: "",
    phone: "",
    email: "",
    country: "中国",
    state: "",
    city: "",
    district: "",
    town: "",
    detail: "",
    postalCode: "",
  };
}

export function createSupplierDraft(record?: SupplierRecord): SupplierFormData {
  if (record) {
    return {
      code: record.code,
      name: record.name,
      category: record.category,
      lifecycleStatus: record.lifecycleStatus,
      auditStatus: record.auditStatus,
      kingdeeStatus: record.kingdeeStatus,
      organization: record.organization,
      socialCreditCode: record.socialCreditCode,
      overseasCompany: record.overseasCompany,
      countryRegion: record.countryRegion,
      bankAccountName: record.bankAccountName,
      bankAccountNo: record.bankAccountNo,
      bankName: record.bankName,
      bankBranch: record.bankBranch,
      contactName: record.contactName,
      contactPhone: record.contactPhone,
      contactEmail: record.contactEmail,
      contactTitle: record.contactTitle,
      paymentTerm: record.paymentTerm,
      currency: record.currency,
      invoiceType: record.invoiceType,
      taxRate: record.taxRate,
      taxpayerType: record.taxpayerType,
      shippingAddress: { ...record.shippingAddress },
      returnAddress: { ...record.returnAddress },
      note: record.note,
      riskLevel: record.riskLevel,
    };
  }

  return {
    code: "",
    name: "",
    category: "美妆成品供应商",
    lifecycleStatus: "新供应商",
    auditStatus: "待提交",
    kingdeeStatus: "未推送",
    organization: "星瀚零售采购有限公司",
    socialCreditCode: "",
    overseasCompany: "否",
    countryRegion: "中国",
    bankAccountName: "",
    bankAccountNo: "",
    bankName: "",
    bankBranch: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    contactTitle: "",
    paymentTerm: "月结30天",
    currency: "人民币",
    invoiceType: "增值税电子专用发票",
    taxRate: "0.13",
    taxpayerType: "一般纳税人",
    shippingAddress: createEmptyAddress(),
    returnAddress: createEmptyAddress(),
    note: "",
    riskLevel: "中",
  };
}

function formatAddress(address: SupplierAddress) {
  return `${address.country} ${address.state} ${address.city} ${address.district} ${address.town} ${address.detail}`.trim();
}

function StatusNotice({
  notice,
  action,
}: {
  notice: SupplierNotice;
  action?: ReactNode;
}) {
  if (!notice) {
    return null;
  }

  return <Banner tone={notice.tone} title={notice.title} description={notice.description} action={action} />;
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return <DescriptionList items={items.map(([label, value]) => ({ label, value }))} />;
}

function lifecycleBadge(status: SupplierRecord["lifecycleStatus"]) {
  if (status === "正常") {
    return <Badge tone="success">{status}</Badge>;
  }
  if (status === "停止合作") {
    return <Badge tone="closed">{status}</Badge>;
  }
  if (status === "预淘汰" || status === "合同到期") {
    return <Badge tone="pending">{status}</Badge>;
  }
  return <Badge tone="draft">{status}</Badge>;
}

function auditBadge(status: SupplierRecord["auditStatus"]) {
  if (status === "已审核") {
    return <Badge tone="success">{status}</Badge>;
  }
  if (status === "待审核") {
    return <Badge tone="pending">{status}</Badge>;
  }
  if (status === "已驳回") {
    return <Badge tone="error">{status}</Badge>;
  }
  return <Badge tone="draft">{status}</Badge>;
}

function kingdeeBadge(status: SupplierRecord["kingdeeStatus"]) {
  if (status === "推送成功") {
    return <Badge tone="success">{status}</Badge>;
  }
  if (status === "推送失败") {
    return <Badge tone="error">{status}</Badge>;
  }
  if (status === "推送中") {
    return <Badge tone="processing">{status}</Badge>;
  }
  return <Badge tone="draft">{status}</Badge>;
}

function FormField({
  label,
  value,
  onChange,
  kind = "input",
  options = [],
  placeholder,
  queryColumns,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  kind?: "input" | "select" | "textarea";
  options?: FieldOption[];
  placeholder?: string;
  queryColumns?: 1 | 2;
  readOnly?: boolean;
}) {
  const resolvedPlaceholder = kind === "select" ? "请选择" : "请输入";

  return (
    <div className={queryColumns === 2 ? "xl:col-span-2" : undefined}>
      <div className="field-label">{label}</div>
      {readOnly ? (
        <div className="display-field">{value || "-"}</div>
      ) : kind === "select" ? (
        <Select className="bg-white" value={value} options={options} placeholder={resolvedPlaceholder} onValueChange={onChange} />
      ) : kind === "textarea" ? (
        <Textarea value={value} placeholder={resolvedPlaceholder} onChange={(event) => onChange?.(event.target.value)} />
      ) : (
        <Input value={value} placeholder={resolvedPlaceholder} onChange={(event) => onChange?.(event.target.value)} />
      )}
    </div>
  );
}

function AddressFields({
  title,
  address,
  readOnly,
  onChange,
  extra,
}: {
  title: string;
  address: SupplierAddress;
  readOnly: boolean;
  onChange: (field: keyof SupplierAddress, value: string) => void;
  extra?: ReactNode;
}) {
  return (
    <Card title={title} extra={extra}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <FormField label="联系人" value={address.contact} readOnly={readOnly} onChange={(value) => onChange("contact", value)} />
        <FormField label="联系电话" value={address.phone} readOnly={readOnly} onChange={(value) => onChange("phone", value)} />
        <FormField label="邮箱" value={address.email} readOnly={readOnly} onChange={(value) => onChange("email", value)} />
        <FormField
          label="国家/地区"
          value={address.country}
          kind="select"
          options={countryOptions}
          readOnly={readOnly}
          onChange={(value) => onChange("country", value)}
        />
        <FormField label="省/州" value={address.state} readOnly={readOnly} onChange={(value) => onChange("state", value)} />
        <FormField label="城市" value={address.city} readOnly={readOnly} onChange={(value) => onChange("city", value)} />
        <FormField label="区/县" value={address.district} readOnly={readOnly} onChange={(value) => onChange("district", value)} />
        <FormField label="街道/镇" value={address.town} readOnly={readOnly} onChange={(value) => onChange("town", value)} />
        <div className="xl:col-span-2">
          <FormField label="详细地址" value={address.detail} readOnly={readOnly} onChange={(value) => onChange("detail", value)} />
        </div>
        <FormField label="邮编" value={address.postalCode} readOnly={readOnly} onChange={(value) => onChange("postalCode", value)} />
      </div>
    </Card>
  );
}

function editScenarioNotice(scenario: SupplierEditScenario): SupplierNotice {
  if (scenario === "duplicate") {
    return {
      tone: "error",
      title: "保存失败",
      description: "供应商名称或统一社会信用代码已存在，禁止重复建档。",
    };
  }
  if (scenario === "tax-invalid") {
    return {
      tone: "error",
      title: "税率校验失败",
      description: "默认税率必须传0到1之间的小数，例如0.13。",
    };
  }
  if (scenario === "submit-failed") {
    return {
      tone: "error",
      title: "提交失败",
      description: "开户银行与发票类型映射不完整，当前不允许提交审核。",
    };
  }
  if (scenario === "conflict") {
    return {
      tone: "warning",
      title: "并发冲突",
      description: "记录已被其他用户更新，请刷新后确认最新数据再继续编辑。",
    };
  }
  return null;
}

type SupplierListFilters = {
  code: string;
  name: string;
  category: string;
  lifecycleStatus: string;
  auditStatus: string;
  kingdeeStatus: string;
  organization: string;
  overseasCompany: string;
};

type SupplierQueryField = {
  key: string;
  label: string;
  value: string;
  kind?: "input" | "select";
  options?: FieldOption[];
  placeholder?: string;
  queryColumns?: 1 | 2;
  onChange: (value: string) => void;
};

const defaultListFilters: SupplierListFilters = {
  code: "",
  name: "",
  category: "全部",
  lifecycleStatus: "全部",
  auditStatus: "全部",
  kingdeeStatus: "全部",
  organization: "全部",
  overseasCompany: "全部",
};

export function SupplierListPage({
  records,
  scenario,
  onScenarioChange,
  onOpenCreate,
  onOpenEdit,
  onOpenDetail,
  onOpenImport,
  onOpenExport,
  onOpenLifecycle,
  notice,
  onClearNotice,
}: {
  records: SupplierRecord[];
  scenario: SupplierListScenario;
  onScenarioChange: (value: SupplierListScenario) => void;
  onOpenCreate: () => void;
  onOpenEdit: (code: string) => void;
  onOpenDetail: (code: string) => void;
  onOpenImport: () => void;
  onOpenExport: () => void;
  onOpenLifecycle: (code: string, mode: SupplierLifecycleMode) => void;
  notice: SupplierNotice;
  onClearNotice: () => void;
}) {
  const [draftFilters, setDraftFilters] = useState<SupplierListFilters>(defaultListFilters);
  const [activeFilters, setActiveFilters] = useState<SupplierListFilters>(defaultListFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCodes, setSelectedCodes] = useState<string[]>(records.slice(0, 2).map((item) => item.code));
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [sortState, setSortState] = useState<TableSortState<string>>(null);

  const supplierColumns = useMemo(
    () =>
      [
        { id: "select", label: "选择", group: "系统字段", required: true, defaultFixed: true, width: 56 },
        { id: "code", label: "供应商编码", group: "基础信息", required: true, defaultFixed: true, width: 156 },
        { id: "name", label: "供应商名称", group: "基础信息", defaultFixed: true, width: 220 },
        { id: "category", label: "分类", group: "基础信息", width: 150 },
        { id: "lifecycleStatus", label: "生命周期状态", group: "状态信息", width: 126 },
        { id: "auditStatus", label: "审核状态", group: "状态信息", width: 118 },
        { id: "kingdeeStatus", label: "推送金蝶状态", group: "状态信息", width: 130 },
        { id: "organization", label: "签约采购组织", group: "组织与联系人", width: 180 },
        { id: "overseasCompany", label: "是否境外", group: "组织与联系人", width: 104 },
        { id: "countryRegion", label: "国家/地区", group: "组织与联系人", width: 120 },
        { id: "contactName", label: "联系人", group: "组织与联系人", width: 110 },
        { id: "createdBy", label: "创建人", group: "制单信息", width: 100 },
        { id: "createdAt", label: "创建时间", group: "制单信息", width: 168, sortType: "datetime" as TableSortType, getSortValue: (row: SupplierRecord) => row.createdAt },
        { id: "socialCreditCode", label: "统一社会信用代码", group: "扩展字段", defaultVisible: false, width: 190 },
        { id: "paymentTerm", label: "付款条件", group: "扩展字段", defaultVisible: false, width: 120 },
        { id: "riskLevel", label: "风险等级", group: "扩展字段", defaultVisible: false, width: 100 },
        { id: "updatedAt", label: "最后修改时间", group: "扩展字段", defaultVisible: false, width: 168, sortType: "datetime" as TableSortType, getSortValue: (row: SupplierRecord) => row.updatedAt },
        { id: "actions", label: "操作", group: "系统字段", required: true, width: 168 },
      ] satisfies Array<ColumnSettingsField & { width: number; sortType?: TableSortType; getSortValue?: (row: SupplierRecord) => unknown }>,
    [],
  );

  const {
    state: supplierColumnState,
    defaultState: supplierDefaultColumnState,
    applyState: applySupplierColumnState,
  } = usePersistedColumnSettings({
    storageKey: "column-settings:demo-user:supplier-list",
    fields: supplierColumns,
    defaultDensity: "medium",
  });
  const { beginResize, widths: columnWidths } = useTableColumnResize({
    state: supplierColumnState,
    applyState: applySupplierColumnState,
  });

  const visibleColumns = useMemo(() => {
    return supplierColumnState.order
      .filter((id) => supplierColumnState.visible.includes(id))
      .map((id) => supplierColumns.find((column) => column.id === id))
      .filter((column): column is (typeof supplierColumns)[number] => Boolean(column));
  }, [supplierColumnState.order, supplierColumnState.visible, supplierColumns]);

  const fixedLeftMap = useMemo(() => {
    const fixedSet = new Set(supplierColumnState.fixed);
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
  }, [columnWidths, supplierColumnState.fixed, visibleColumns]);

  useEffect(() => {
    setSelectedCodes((current) => current.filter((code) => records.some((item) => item.code === code)));
  }, [records]);

  const queryFieldDefinitions: SupplierQueryField[] = [
    {
      key: "code",
      label: "供应商编码",
      value: draftFilters.code,
      placeholder: "请输入供应商编码",
      onChange: (value: string) => setDraftFilters((current) => ({ ...current, code: value })),
    },
    {
      key: "name",
      label: "供应商名称",
      value: draftFilters.name,
      placeholder: "请输入供应商名称",
      onChange: (value: string) => setDraftFilters((current) => ({ ...current, name: value })),
    },
    {
      key: "category",
      label: "供应商分类",
      kind: "select" as const,
      value: draftFilters.category,
      options: [{ label: "全部", value: "全部" }, ...categoryOptions],
      onChange: (value: string) => setDraftFilters((current) => ({ ...current, category: value })),
    },
    {
      key: "lifecycleStatus",
      label: "生命周期状态",
      kind: "select" as const,
      value: draftFilters.lifecycleStatus,
      options: [{ label: "全部", value: "全部" }, ...lifecycleOptions],
      onChange: (value: string) => setDraftFilters((current) => ({ ...current, lifecycleStatus: value })),
    },
    {
      key: "auditStatus",
      label: "审核状态",
      kind: "select" as const,
      value: draftFilters.auditStatus,
      options: [
        { label: "全部", value: "全部" },
        { label: "待提交", value: "待提交" },
        { label: "待审核", value: "待审核" },
        { label: "已审核", value: "已审核" },
        { label: "已驳回", value: "已驳回" },
      ],
      onChange: (value: string) => setDraftFilters((current) => ({ ...current, auditStatus: value })),
    },
    {
      key: "kingdeeStatus",
      label: "推送金蝶状态",
      kind: "select" as const,
      value: draftFilters.kingdeeStatus,
      options: [
        { label: "全部", value: "全部" },
        { label: "未推送", value: "未推送" },
        { label: "推送中", value: "推送中" },
        { label: "推送成功", value: "推送成功" },
        { label: "推送失败", value: "推送失败" },
      ],
      onChange: (value: string) => setDraftFilters((current) => ({ ...current, kingdeeStatus: value })),
    },
    {
      key: "organization",
      label: "签约采购组织",
      kind: "select" as const,
      value: draftFilters.organization,
      options: [{ label: "全部", value: "全部" }, ...organizationOptions],
      onChange: (value: string) => setDraftFilters((current) => ({ ...current, organization: value })),
    },
    {
      key: "overseasCompany",
      label: "是否境外公司",
      kind: "select" as const,
      value: draftFilters.overseasCompany,
      options: [{ label: "全部", value: "全部" }, ...overseasOptions],
      onChange: (value: string) => setDraftFilters((current) => ({ ...current, overseasCompany: value })),
    },
  ];
  const visibleQueryFields = getVisibleQuerySectionItems(queryFieldDefinitions, showMoreFilters);
  const hasCollapsedQueryFields = hasCollapsedQuerySectionItems(queryFieldDefinitions);
  const sortConfigs = useMemo(
    () =>
      supplierColumns.reduce<Partial<Record<string, TableSortConfig<SupplierRecord>>>>((configs, column) => {
        if (!column.sortType || !column.getSortValue) {
          return configs;
        }

        configs[column.id] = {
          type: column.sortType,
          getValue: column.getSortValue,
        };
        return configs;
      }, {}),
    [supplierColumns],
  );

  const filteredRows = useMemo(() => {
    return records.filter((row) => {
      const matchesCode = !activeFilters.code || row.code.toLowerCase().includes(activeFilters.code.toLowerCase());
      const matchesName = !activeFilters.name || row.name.toLowerCase().includes(activeFilters.name.toLowerCase());
      const matchesCategory = activeFilters.category === "全部" || row.category === activeFilters.category;
      const matchesLifecycle =
        activeFilters.lifecycleStatus === "全部" || row.lifecycleStatus === activeFilters.lifecycleStatus;
      const matchesAudit = activeFilters.auditStatus === "全部" || row.auditStatus === activeFilters.auditStatus;
      const matchesKingdee = activeFilters.kingdeeStatus === "全部" || row.kingdeeStatus === activeFilters.kingdeeStatus;
      const matchesOrg = activeFilters.organization === "全部" || row.organization === activeFilters.organization;
      const matchesOverseas =
        activeFilters.overseasCompany === "全部" || row.overseasCompany === activeFilters.overseasCompany;

      return (
        matchesCode &&
        matchesName &&
        matchesCategory &&
        matchesLifecycle &&
        matchesAudit &&
        matchesKingdee &&
        matchesOrg &&
        matchesOverseas
      );
    });
  }, [activeFilters, records]);

  const sortedRows = useMemo(() => sortTableRows(filteredRows, sortState, sortConfigs), [filteredRows, sortConfigs, sortState]);
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const pageRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);
  const allCurrentPageSelected = pageRows.length > 0 && pageRows.every((row) => selectedCodes.includes(row.code));

  function handleQuery() {
    setActiveFilters(draftFilters);
    setPage(1);

    const nextRows = records.filter((row) => {
      const matchesCode = !draftFilters.code || row.code.toLowerCase().includes(draftFilters.code.toLowerCase());
      const matchesName = !draftFilters.name || row.name.toLowerCase().includes(draftFilters.name.toLowerCase());
      const matchesCategory = draftFilters.category === "全部" || row.category === draftFilters.category;
      const matchesLifecycle = draftFilters.lifecycleStatus === "全部" || row.lifecycleStatus === draftFilters.lifecycleStatus;
      const matchesAudit = draftFilters.auditStatus === "全部" || row.auditStatus === draftFilters.auditStatus;
      const matchesKingdee = draftFilters.kingdeeStatus === "全部" || row.kingdeeStatus === draftFilters.kingdeeStatus;
      const matchesOrg = draftFilters.organization === "全部" || row.organization === draftFilters.organization;
      const matchesOverseas =
        draftFilters.overseasCompany === "全部" || row.overseasCompany === draftFilters.overseasCompany;

      return (
        matchesCode &&
        matchesName &&
        matchesCategory &&
        matchesLifecycle &&
        matchesAudit &&
        matchesKingdee &&
        matchesOrg &&
        matchesOverseas
      );
    });

    onScenarioChange(nextRows.length > 0 ? "normal" : "no-result");
  }

  function handleReset() {
    setDraftFilters(defaultListFilters);
    setActiveFilters(defaultListFilters);
    setShowMoreFilters(false);
    setPage(1);
    onScenarioChange("normal");
  }

  function toggleRowSelection(code: string) {
    setSelectedCodes((current) => (current.includes(code) ? current.filter((item) => item !== code) : [...current, code]));
  }

  function toggleCurrentPageSelection() {
    const currentPageCodes = pageRows.map((row) => row.code);
    if (allCurrentPageSelected) {
      setSelectedCodes((current) => current.filter((code) => !currentPageCodes.includes(code)));
      return;
    }

    setSelectedCodes((current) => Array.from(new Set([...current, ...currentPageCodes])));
  }

  const showTable = scenario === "normal" || scenario === "push-warning";

  function getSupplierColumnCell(row: SupplierRecord, columnId: string) {
    const lifecycleMode: SupplierLifecycleMode = row.lifecycleStatus === "停止合作" ? "enable" : "disable";

    if (columnId === "select") {
      return (
        <input
          type="checkbox"
          checked={selectedCodes.includes(row.code)}
          onChange={() => toggleRowSelection(row.code)}
        />
      );
    }

    if (columnId === "code") {
      return (
        <button className="text-link hover:text-link-hover" type="button" onClick={() => onOpenDetail(row.code)}>
          {row.code}
        </button>
      );
    }

    if (columnId === "name") {
      return (
        <div className="max-w-[220px] truncate" title={row.name}>
          {row.name}
        </div>
      );
    }

    if (columnId === "category") {
      return row.category;
    }

    if (columnId === "lifecycleStatus") {
      return lifecycleBadge(row.lifecycleStatus);
    }

    if (columnId === "auditStatus") {
      return auditBadge(row.auditStatus);
    }

    if (columnId === "kingdeeStatus") {
      return kingdeeBadge(row.kingdeeStatus);
    }

    if (columnId === "organization") {
      return row.organization;
    }

    if (columnId === "overseasCompany") {
      return row.overseasCompany;
    }

    if (columnId === "countryRegion") {
      return row.countryRegion;
    }

    if (columnId === "contactName") {
      return row.contactName;
    }

    if (columnId === "createdBy") {
      return row.createdBy;
    }

    if (columnId === "createdAt") {
      return row.createdAt;
    }

    if (columnId === "socialCreditCode") {
      return row.socialCreditCode;
    }

    if (columnId === "paymentTerm") {
      return row.paymentTerm;
    }

    if (columnId === "riskLevel") {
      return row.riskLevel;
    }

    if (columnId === "updatedAt") {
      return row.updatedAt;
    }

    if (columnId === "actions") {
      return (
        <div className="flex items-center gap-actions">
          <button className="text-link" type="button" onClick={() => onOpenDetail(row.code)}>
            详情
          </button>
          <button className="text-link" type="button" onClick={() => onOpenEdit(row.code)}>
            编辑
          </button>
          <button className="text-link" type="button" onClick={() => onOpenLifecycle(row.code, lifecycleMode)}>
            {lifecycleMode === "disable" ? "停止合作" : "恢复合作"}
          </button>
        </div>
      );
    }

    return "-";
  }

  return (
    <div className="space-y-page-block">
      <DemoToolbar label="列表页" items={supplierListTabs} value={scenario} onChange={onScenarioChange} />

      <PageHeader
        title="供应商主数据"
        description="用于维护供应商准入、审核、推送金蝶与合作状态控制。"
        actions={
          <>
            <Button variant="primary" onClick={onOpenCreate}>
              新增供应商
            </Button>
            <Button onClick={onOpenImport}>导入</Button>
            <Button onClick={onOpenExport}>导出</Button>
          </>
        }
      />

      <StatusNotice
        notice={notice}
        action={
          notice ? (
            <Button size="sm" onClick={onClearNotice}>
              我知道了
            </Button>
          ) : null
        }
      />

      <Card>
        <div className="query-section-grid">
          {visibleQueryFields.map((field) => (
            <FormField
              key={field.key}
              label={field.label}
              kind={field.kind}
              value={field.value}
              options={field.options}
              placeholder={field.placeholder}
              queryColumns={field.queryColumns}
              onChange={field.onChange}
            />
          ))}
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
          <Button variant="secondary" onClick={handleReset}>
            重置
          </Button>
          <Button variant="primary" onClick={handleQuery}>
            查询
          </Button>
        </div>
      </Card>

      {scenario === "no-auth" ? (
        <ExceptionState
          variant="403"
          description="当前用户没有供应商主数据访问权限，需开通主数据菜单及组织数据范围后方可进入。"
          primaryAction={<Button variant="primary">联系管理员</Button>}
          secondaryAction={<Button>返回首页</Button>}
        />
      ) : null}

      {scenario === "loading" ? (
        <Card title="加载中">
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-sm bg-bg-subtle" />
            ))}
          </div>
        </Card>
      ) : null}

      {scenario === "empty" ? (
        <ExceptionState
          variant="404"
          title="空数据"
          description="当前组织下还没有供应商资料，请从“新增供应商”开始创建主数据。"
          primaryAction={<Button variant="primary" onClick={onOpenCreate}>新增供应商</Button>}
        />
      ) : null}

      {scenario === "no-result" ? (
        <ExceptionState
          variant="404"
          title="查询无结果"
          description="没有符合当前筛选条件的供应商，请调整条件后重试。"
          primaryAction={<Button variant="primary" onClick={handleReset}>重置条件</Button>}
          secondaryAction={<Button onClick={handleQuery}>重新查询</Button>}
        />
      ) : null}

      {showTable ? (
        <>
          {scenario === "push-warning" ? (
            <StatusNotice
              notice={{
                tone: "warning",
                title: "存在推送金蝶异常",
                description: "当前有1条供应商资料推送失败，应支持查看失败原因并进行重推。",
              }}
              action={<Button size="sm">查看异常记录</Button>}
            />
          ) : null}

          <ListPageMainCard>
            <ListPageToolbar>
              <div className="list-toolbar-group">
                <label className="flex items-center gap-control">
                  <input type="checkbox" checked={allCurrentPageSelected} onChange={toggleCurrentPageSelection} />
                  全选
                </label>
                <span>已选中{selectedCodes.length}条</span>
                <Button size="sm" disabled={selectedCodes.length === 0} onClick={onOpenExport}>
                  批量导出
                </Button>
              </div>
              <div className="list-toolbar-group">
                <IconActionButton label="列设置" onClick={() => setColumnSettingsOpen(true)}>
                  <Settings2 aria-hidden="true" strokeWidth={1.8} className="h-4 w-4" />
                </IconActionButton>
              </div>
            </ListPageToolbar>

            <HorizontalScrollArea viewportClassName={getDensityClassName(supplierColumnState.density)}>
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
                  {pageRows.map((row) => {
                    return (
                      <tr key={row.code}>
                        {visibleColumns.map((column, index) => {
                          const left = fixedLeftMap.get(column.id);
                          const isFixed = left !== undefined;
                          const width = columnWidths[column.id] ?? column.width;

                          return (
                            <td
                              key={column.id}
                              className={isFixed ? "table-fixed-cell is-body" : ""}
                              style={{
                                width,
                                minWidth: width,
                                left,
                              }}
                            >
                              {getSupplierColumnCell(row, column.id)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </HorizontalScrollArea>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalCount={sortedRows.length}
              pageSize={pageSize}
              pageSizeOptions={[10, 20, 50]}
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
        title="供应商列表列设置"
        fields={supplierColumns}
        state={supplierColumnState}
        defaultState={supplierDefaultColumnState}
        onClose={() => setColumnSettingsOpen(false)}
        onApply={applySupplierColumnState}
      />
    </div>
  );
}

export function SupplierEditPage({
  mode,
  scenario,
  record,
  existingRecords,
  onScenarioChange,
  onBackToList,
  onSaveDraft,
  onSubmit,
  onOpenDetail,
}: {
  mode: "create" | "edit";
  scenario: SupplierEditScenario;
  record?: SupplierRecord;
  existingRecords: SupplierRecord[];
  onScenarioChange: (value: SupplierEditScenario) => void;
  onBackToList: () => void;
  onSaveDraft: (draft: SupplierFormData) => string;
  onSubmit: (draft: SupplierFormData) => string;
  onOpenDetail: (code: string) => void;
}) {
  const [form, setForm] = useState<SupplierFormData>(() => createSupplierDraft(record));
  const [notice, setNotice] = useState<SupplierNotice>(null);

  useEffect(() => {
    setForm(createSupplierDraft(record));
    setNotice(null);
  }, [mode, record?.code]);

  const readOnly = scenario === "read-only";
  const forcedScenarioNotice = editScenarioNotice(scenario);

  function updateField<K extends keyof SupplierFormData>(key: K, value: SupplierFormData[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateAddress(addressKey: "shippingAddress" | "returnAddress", field: keyof SupplierAddress, value: string) {
    setForm((current) => ({
      ...current,
      [addressKey]: {
        ...current[addressKey],
        [field]: value,
      },
    }));
  }

  function validate(action: "save" | "submit") {
    if (!form.name.trim()) {
      return {
        tone: "error" as const,
        title: "保存失败",
        description: "供应商名称不能为空。",
      };
    }

    if (!form.organization) {
      return {
        tone: "error" as const,
        title: "保存失败",
        description: "签约采购组织不能为空。",
      };
    }

    if (!form.category) {
      return {
        tone: "error" as const,
        title: "保存失败",
        description: "供应商分类不能为空。",
      };
    }

    const duplicate = existingRecords.find(
      (item) =>
        item.code !== record?.code &&
        (item.name === form.name.trim() || (form.socialCreditCode && item.socialCreditCode === form.socialCreditCode.trim())),
    );

    if (duplicate) {
      return {
        tone: "error" as const,
        title: "存在重复供应商",
        description: `系统中已存在供应商${duplicate.code}，请核对名称或统一社会信用代码。`,
      };
    }

    const taxRate = Number(form.taxRate);
    if (Number.isNaN(taxRate) || taxRate < 0 || taxRate > 1) {
      return {
        tone: "error" as const,
        title: "税率不合法",
        description: "默认税率必须传0到1之间的小数，例如0.13。",
      };
    }

    if (action === "submit") {
      if (!form.socialCreditCode.trim()) {
        return {
          tone: "error" as const,
          title: "提交失败",
          description: "统一社会信用代码不能为空，提交审核前必须补齐企业主体信息。",
        };
      }

      if (!form.bankAccountName.trim() || !form.bankAccountNo.trim() || !form.bankName.trim()) {
        return {
          tone: "error" as const,
          title: "提交失败",
          description: "银行信息不完整，至少要填写账户名称、银行账号和开户银行。",
        };
      }

      if (!form.contactName.trim() || !form.contactPhone.trim()) {
        return {
          tone: "error" as const,
          title: "提交失败",
          description: "联系人和联系电话不能为空。",
        };
      }

      if (!form.shippingAddress.detail.trim() || !form.returnAddress.detail.trim()) {
        return {
          tone: "error" as const,
          title: "提交失败",
          description: "发货地址和退货地址必须填写详细地址。",
        };
      }
    }

    return null;
  }

  function handleSave() {
    if (readOnly) {
      return;
    }

    if (scenario !== "normal") {
      setNotice(forcedScenarioNotice);
      return;
    }

    const validationError = validate("save");
    if (validationError) {
      setNotice(validationError);
      return;
    }

    const code = onSaveDraft(form);
    setForm((current) => ({ ...current, code, auditStatus: "待提交" }));
    setNotice({
      tone: "success",
      title: mode === "create" ? "保存成功" : "更新成功",
      description:
        mode === "create"
          ? `系统已生成供应商编码${code}，当前记录处于待提交状态。`
          : "供应商资料已保存，后续修改需重新提交审核。",
    });
  }

  function handleSubmit() {
    if (readOnly) {
      return;
    }

    if (scenario !== "normal") {
      setNotice(forcedScenarioNotice);
      return;
    }

    const validationError = validate("submit");
    if (validationError) {
      setNotice(validationError);
      return;
    }

    const code = onSubmit(form);
    setForm((current) => ({ ...current, code, auditStatus: "待审核" }));
    setNotice({
      tone: "success",
      title: "提交成功",
      description: `供应商${code}已提交审核，审核通过后才允许推送金蝶与启用合作。`,
    });
  }

  function copyShippingAddress() {
    if (readOnly) {
      return;
    }

    setForm((current) => ({
      ...current,
      returnAddress: { ...current.shippingAddress },
    }));
    setNotice({
      tone: "success",
      title: "已复制地址",
      description: "已将发货地址复制到退货地址，请再核对退货联系人信息。",
    });
  }

  const currentCode = form.code || "保存后自动生成";

  return (
    <div className="space-y-page-block">
      <DemoToolbar label={mode === "create" ? "新增页" : "编辑页"} items={supplierEditTabs} value={scenario} onChange={onScenarioChange} />

      <PageHeader
        title={mode === "create" ? "新增供应商主数据" : `编辑供应商 ${currentCode}`}
        description="供应商主数据在提交审核前允许反复保存；提交后进入待审核状态，审核通过后才能推送金蝶。"
        actions={
          <>
            <Button onClick={onBackToList}>返回列表</Button>
            {form.code ? (
              <Button onClick={() => onOpenDetail(form.code)}>
                查看详情
              </Button>
            ) : null}
            <Button disabled={readOnly} onClick={handleSave}>
              保存草稿
            </Button>
            <Button variant="primary" disabled={readOnly} onClick={handleSubmit}>
              提交审核
            </Button>
          </>
        }
      />

      <StatusNotice notice={notice ?? forcedScenarioNotice} />

      <Card title="基本信息卡片" extra={<span className="text-small text-text-muted">系统字段只读，业务字段按审核前维护</span>}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FormField label="供应商编码" value={currentCode} readOnly />
          <FormField label="供应商名称" value={form.name} readOnly={readOnly} onChange={(value) => updateField("name", value)} />
          <FormField
            label="供应商分类"
            kind="select"
            value={form.category}
            options={categoryOptions}
            readOnly={readOnly}
            onChange={(value) => updateField("category", value)}
          />
          <FormField
            label="供应商生命周期状态"
            kind="select"
            value={form.lifecycleStatus}
            options={lifecycleOptions}
            readOnly={readOnly}
            onChange={(value) => updateField("lifecycleStatus", value as SupplierRecord["lifecycleStatus"])}
          />
          <FormField label="审核状态" value={form.auditStatus} readOnly />
          <FormField label="推送金蝶状态" value={form.kingdeeStatus} readOnly />
          <FormField
            label="签约采购组织"
            kind="select"
            value={form.organization}
            options={organizationOptions}
            readOnly={readOnly}
            onChange={(value) => updateField("organization", value)}
          />
          <FormField
            label="是否境外公司"
            kind="select"
            value={form.overseasCompany}
            options={overseasOptions}
            readOnly={readOnly}
            onChange={(value) => updateField("overseasCompany", value as SupplierRecord["overseasCompany"])}
          />
          <FormField
            label="国家/地区"
            kind="select"
            value={form.countryRegion}
            options={countryOptions}
            readOnly={readOnly}
            onChange={(value) => updateField("countryRegion", value)}
          />
          <FormField
            label="统一社会信用代码"
            value={form.socialCreditCode}
            readOnly={readOnly}
            onChange={(value) => updateField("socialCreditCode", value)}
          />
          <FormField
            label="风险等级"
            kind="select"
            value={form.riskLevel}
            options={riskOptions}
            readOnly={readOnly}
            onChange={(value) => updateField("riskLevel", value as SupplierRecord["riskLevel"])}
          />
        </div>
      </Card>

      <Card title="公司与财务信息卡片">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FormField
            label="付款条件"
            kind="select"
            value={form.paymentTerm}
            options={paymentOptions}
            readOnly={readOnly}
            onChange={(value) => updateField("paymentTerm", value)}
          />
          <FormField
            label="结算币别"
            kind="select"
            value={form.currency}
            options={currencyOptions}
            readOnly={readOnly}
            onChange={(value) => updateField("currency", value)}
          />
          <FormField
            label="发票类型"
            kind="select"
            value={form.invoiceType}
            options={invoiceOptions}
            readOnly={readOnly}
            onChange={(value) => updateField("invoiceType", value)}
          />
          <FormField
            label="默认税率"
            value={form.taxRate}
            placeholder="请输入0到1之间的小数"
            readOnly={readOnly}
            onChange={(value) => updateField("taxRate", value)}
          />
          <FormField
            label="纳税人类型"
            kind="select"
            value={form.taxpayerType}
            options={taxpayerTypeOptions}
            readOnly={readOnly}
            onChange={(value) => updateField("taxpayerType", value)}
          />
          <FormField
            label="银行账户名称"
            value={form.bankAccountName}
            readOnly={readOnly}
            onChange={(value) => updateField("bankAccountName", value)}
          />
          <FormField
            label="银行账号"
            value={form.bankAccountNo}
            readOnly={readOnly}
            onChange={(value) => updateField("bankAccountNo", value)}
          />
          <FormField label="开户银行" value={form.bankName} readOnly={readOnly} onChange={(value) => updateField("bankName", value)} />
          <FormField
            label="开户地点"
            value={form.bankBranch}
            readOnly={readOnly}
            onChange={(value) => updateField("bankBranch", value)}
          />
        </div>
      </Card>

      <Card title="联系信息卡片">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FormField label="联系人" value={form.contactName} readOnly={readOnly} onChange={(value) => updateField("contactName", value)} />
          <FormField label="联系电话" value={form.contactPhone} readOnly={readOnly} onChange={(value) => updateField("contactPhone", value)} />
          <FormField label="邮箱" value={form.contactEmail} readOnly={readOnly} onChange={(value) => updateField("contactEmail", value)} />
          <FormField label="岗位" value={form.contactTitle} readOnly={readOnly} onChange={(value) => updateField("contactTitle", value)} />
          <div className="md:col-span-2 xl:col-span-4">
            <FormField
              label="备注"
              kind="textarea"
              value={form.note}
              readOnly={readOnly}
              placeholder="用于补充合作风险、结算要求或推送说明"
              onChange={(value) => updateField("note", value)}
            />
          </div>
        </div>
      </Card>

      <AddressFields
        title="发货地址卡片"
        address={form.shippingAddress}
        readOnly={readOnly}
        onChange={(field, value) => updateAddress("shippingAddress", field, value)}
      />

      <AddressFields
        title="退货地址卡片"
        address={form.returnAddress}
        readOnly={readOnly}
        onChange={(field, value) => updateAddress("returnAddress", field, value)}
        extra={
          <Button size="sm" disabled={readOnly} onClick={copyShippingAddress}>
            同发货地址
          </Button>
        }
      />
    </div>
  );
}

export function SupplierDetailPage({
  record,
  scenario,
  activeTab,
  onScenarioChange,
  onTabChange,
  onOpenEdit,
  onApprove,
  onRetryPush,
  onOpenLifecycle,
}: {
  record: SupplierRecord;
  scenario: SupplierDetailScenario;
  activeTab: SupplierDetailTab;
  onScenarioChange: (value: SupplierDetailScenario) => void;
  onTabChange: (value: SupplierDetailTab) => void;
  onOpenEdit: (code: string) => void;
  onApprove: (code: string) => void;
  onRetryPush: (code: string) => void;
  onOpenLifecycle: (code: string, mode: SupplierLifecycleMode) => void;
}) {
  const [notice, setNotice] = useState<SupplierNotice>(null);

  useEffect(() => {
    setNotice(null);
  }, [record.code]);

  if (scenario === "no-auth") {
    return (
      <div className="space-y-page-block">
        <DemoToolbar label="详情页" items={supplierDetailTabs} value={scenario} onChange={onScenarioChange} />
        <PageHeader title="供应商详情" description="详情页必须覆盖无权限、推送异常和停止合作状态。" />
        <ExceptionState
          variant="403"
          description="当前用户可以看供应商列表，但没有供应商详情访问权限。"
          primaryAction={<Button variant="primary">联系管理员</Button>}
          secondaryAction={<Button>返回列表</Button>}
        />
      </div>
    );
  }

  const stopped = scenario === "stopped" || record.lifecycleStatus === "停止合作";
  const pushFailed = scenario === "push-failed" || record.kingdeeStatus === "推送失败";

  function handleApprove() {
    if (record.auditStatus === "已审核") {
      setNotice({
        tone: "warning",
        title: "无需重复审核",
        description: "当前供应商资料已经审核通过，可直接维护合作状态或处理金蝶推送。",
      });
      return;
    }

    onApprove(record.code);
    setNotice({
      tone: "success",
      title: "审核通过",
      description: "供应商资料已通过审核，当前可进入金蝶推送与合作启用流程。",
    });
  }

  function handleRetryPush() {
    onRetryPush(record.code);
    setNotice({
      tone: "success",
      title: "已触发重推",
      description: "系统已重新发起金蝶推送，请在列表页关注推送结果变化。",
    });
  }

  return (
    <div className="space-y-page-block">
      <DemoToolbar label="详情页" items={supplierDetailTabs} value={scenario} onChange={onScenarioChange} />
      <PageHeader title="供应商详情" description="详情页展示合作状态、审核记录、推送状态和主数据变更轨迹。" />

      <section className="detail-hero">
        <div className="detail-hero-main">
          <div className="detail-hero-title-row">
            <h2 className="page-title">{record.code}</h2>
            {lifecycleBadge(stopped ? "停止合作" : record.lifecycleStatus)}
            {auditBadge(record.auditStatus)}
            {kingdeeBadge(record.kingdeeStatus)}
          </div>
          <div className="detail-hero-meta">
            <span>供应商名称：{record.name}</span>
            <span>签约采购组织：{record.organization}</span>
            <span>创建人：{record.createdBy}</span>
            <span>创建时间：{record.createdAt}</span>
          </div>
        </div>
        <div className="detail-hero-actions">
          <Button onClick={() => onOpenEdit(record.code)} disabled={stopped}>
            编辑
          </Button>
          <Button onClick={handleApprove} disabled={record.auditStatus === "已审核" || stopped}>
            审核通过
          </Button>
          <Button variant="primary" onClick={handleRetryPush} disabled={record.auditStatus !== "已审核"}>
            重推金蝶
          </Button>
          <Button
            variant={stopped ? "secondary" : "danger"}
            onClick={() => onOpenLifecycle(record.code, stopped ? "enable" : "disable")}
          >
            {stopped ? "恢复合作" : "停止合作"}
          </Button>
        </div>
      </section>

      <StatusNotice notice={notice} />

      {pushFailed ? (
        <StatusNotice
          notice={{
            tone: "warning",
            title: "推送金蝶失败",
            description: "当前记录存在金蝶同步异常，建议先核对发票类型、银行地区码和组织映射后再重推。",
          }}
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="基本信息">
          <InfoGrid
            items={[
              ["供应商编码", record.code],
              ["供应商名称", record.name],
              ["供应商分类", record.category],
              ["生命周期状态", record.lifecycleStatus],
              ["审核状态", record.auditStatus],
              ["签约采购组织", record.organization],
              ["是否境外公司", record.overseasCompany],
              ["国家/地区", record.countryRegion],
            ]}
          />
        </Card>
        <Card title="公司与制单信息">
          <InfoGrid
            items={[
              ["统一社会信用代码", record.socialCreditCode],
              ["创建人", record.createdBy],
              ["创建时间", record.createdAt],
              ["修改人", record.updatedBy],
              ["修改时间", record.updatedAt],
              ["审核人", record.reviewedBy],
              ["审核时间", record.reviewedAt],
              ["风险等级", record.riskLevel],
            ]}
          />
        </Card>
      </div>

      <Card title="Tab区">
        <Tabs
          items={[
            { label: "联系信息", value: "contact" },
            { label: "地址信息", value: "address" },
            { label: "银行与财务", value: "finance" },
            { label: "审核记录", value: "approvals" },
            { label: "操作日志", value: "logs" },
            { label: "变更记录", value: "changes" },
          ]}
          value={activeTab}
          onChange={onTabChange}
        />

        <div className="mt-4">
          {activeTab === "contact" ? (
            <div className="grid gap-4 xl:grid-cols-2">
              <Card title="主联系人">
                <InfoGrid
                  items={[
                    ["联系人", record.contactName],
                    ["联系电话", record.contactPhone],
                    ["邮箱", record.contactEmail],
                    ["岗位", record.contactTitle],
                  ]}
                />
              </Card>
              <Card title="合作说明">
                <InfoGrid
                  items={[
                    ["活跃采购单", `${record.activePurchaseOrders}条`],
                    ["推送金蝶状态", record.kingdeeStatus],
                    ["备注", record.note || "-"],
                  ]}
                />
              </Card>
            </div>
          ) : null}

          {activeTab === "address" ? (
            <div className="grid gap-4 xl:grid-cols-2">
              <Card title="发货地址">
                <InfoGrid
                  items={[
                    ["联系人", record.shippingAddress.contact],
                    ["联系电话", record.shippingAddress.phone],
                    ["邮箱", record.shippingAddress.email],
                    ["地址", formatAddress(record.shippingAddress)],
                    ["邮编", record.shippingAddress.postalCode],
                  ]}
                />
              </Card>
              <Card title="退货地址">
                <InfoGrid
                  items={[
                    ["联系人", record.returnAddress.contact],
                    ["联系电话", record.returnAddress.phone],
                    ["邮箱", record.returnAddress.email],
                    ["地址", formatAddress(record.returnAddress)],
                    ["邮编", record.returnAddress.postalCode],
                  ]}
                />
              </Card>
            </div>
          ) : null}

          {activeTab === "finance" ? (
            <div className="grid gap-4 xl:grid-cols-2">
              <Card title="结算信息">
                <InfoGrid
                  items={[
                    ["付款条件", record.paymentTerm],
                    ["结算币别", record.currency],
                    ["发票类型", record.invoiceType],
                    ["默认税率", record.taxRate],
                    ["纳税人类型", record.taxpayerType],
                  ]}
                />
              </Card>
              <Card title="银行信息">
                <InfoGrid
                  items={[
                    ["账户名称", record.bankAccountName],
                    ["银行账号", record.bankAccountNo],
                    ["开户银行", record.bankName],
                    ["开户地点", record.bankBranch],
                  ]}
                />
              </Card>
            </div>
          ) : null}

          {activeTab === "approvals" ? <ApprovalTable items={record.approvalLogs} /> : null}
          {activeTab === "logs" ? <OperationLogTable items={record.operationLogs} /> : null}
          {activeTab === "changes" ? <ChangeLogTable items={record.changeLogs} /> : null}
        </div>
      </Card>
    </div>
  );
}

function ApprovalTable({ items }: { items: SupplierApprovalLog[] }) {
  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>审批节点</th>
            <th>审批人</th>
            <th>结果</th>
            <th>审批意见</th>
            <th>审批时间</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.node}-${item.time}`}>
              <td>{item.node}</td>
              <td>{item.actor}</td>
              <td>{item.result}</td>
              <td>{item.opinion}</td>
              <td>{item.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OperationLogTable({ items }: { items: SupplierOperationLog[] }) {
  return (
    <Timeline
      items={items.map((item) => ({
        id: `${item.time}-${item.action}`,
        time: item.time,
        title: `${item.actor} · ${item.action}`,
        description: item.remark ?? `处理结果：${item.result}`,
        tone: item.result === "成功" ? "success" : item.result.includes("失败") ? "error" : "default",
        meta: `处理结果：${item.result}`,
      }))}
    />
  );
}

function ChangeLogTable({ items }: { items: SupplierChangeLog[] }) {
  return (
    <Timeline
      items={items.map((item) => ({
        id: `${item.time}-${item.field}`,
        time: item.time,
        title: `${item.actor}调整了${item.field}`,
        description: `变更前：${item.before}；变更后：${item.after}`,
        tone: "info",
      }))}
    />
  );
}

export function SupplierImportModal({
  open,
  stage,
  mode,
  onModeChange,
  onClose,
  onStart,
  onReset,
  onFinish,
}: {
  open: boolean;
  stage: SupplierImportStage;
  mode: Exclude<SupplierImportStage, "select" | "loading">;
  onModeChange: (value: Exclude<SupplierImportStage, "select" | "loading">) => void;
  onClose: () => void;
  onStart: () => void;
  onReset: () => void;
  onFinish: (result: Exclude<SupplierImportStage, "select" | "loading">) => void;
}) {
  return (
    <Modal open={open} title="导入供应商主数据" onClose={onClose}>
      {stage === "select" ? (
        <ImportSelectStage
          intro="建议先下载模板，并按“默认税率传0到1之间小数、统一社会信用代码完整、组织权限已开通”的规则填写。"
          templateName="供应商主数据导入模板.xlsx"
          templateDescription="包含基本信息、银行信息、联系信息、发货地址与退货地址字段说明。"
          modeItems={[
            { label: "全部成功", value: "success" },
            { label: "部分失败", value: "partial" },
            { label: "文件失败", value: "file-error" },
          ]}
          modeValue={mode}
          onModeChange={(value) => onModeChange(value as Exclude<SupplierImportStage, "select" | "loading">)}
          onClose={onClose}
          onStart={onStart}
        />
      ) : null}

      {stage === "loading" ? (
        <ImportLoadingState
          title="正在导入供应商数据，请稍候…"
          description="系统会校验税率、组织权限、统一社会信用代码和金蝶映射字段。"
        />
      ) : null}

      {stage === "success" ? (
        <SupplierImportResult
          tone="success"
          title="导入成功"
          description="全部34条供应商资料已成功导入。"
          showDetail={false}
          onReset={onReset}
          onClose={() => onFinish("success")}
        />
      ) : null}

      {stage === "partial" ? (
        <SupplierImportResult
          tone="warning"
          title="导入完成（部分失败）"
          description="共34条，成功31条，3条因校验错误被跳过。"
          showDetail
          onReset={onReset}
          onClose={() => onFinish("partial")}
        />
      ) : null}

      {stage === "file-error" ? (
        <SupplierImportResult
          tone="error"
          title="导入失败"
          description="文件格式错误或模板版本不匹配，请重新下载官方模板后再试。"
          showDetail={false}
          onReset={onReset}
          onClose={() => onFinish("file-error")}
        />
      ) : null}
    </Modal>
  );
}

function SupplierImportResult({
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
        { value: "34", label: "导入总数" },
        { value: showDetail ? "31" : "34", label: "成功写入", tone: "success" },
        { value: showDetail ? "3" : "0", label: "失败跳过", tone: "error" },
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
          ? supplierImportFailures.map((item) => ({
              id: `${item.rowNo}-${item.field}`,
              rowNo: item.rowNo,
              field: item.field,
              value: item.value,
              reason: item.reason,
            }))
          : []
      }
      detailAction={showDetail ? <Button size="sm">下载失败数据</Button> : undefined}
      onReset={onReset}
      onClose={onClose}
    />
  );
}

export function SupplierExportModal({
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
  return (
    <Modal open={open} title="导出供应商主数据" onClose={onClose}>
      <div className="space-y-5">
        <section>
          <div className="mb-3 text-small text-text-muted">导出范围</div>
          <RadioGroup
            value={exportRange}
            options={[
              { label: "全部数据（当前共4条）", value: "all" },
              { label: "当前筛选结果（2条）", value: "filtered" },
              { label: "仅选中数据（2条）", value: "selected" },
            ]}
            onValueChange={onRangeChange}
          />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between text-small text-text-muted">
            <span>导出字段</span>
            <span>已选{supplierExportFields.length}/{supplierExportFields.length}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {supplierExportFields.map((field) => (
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
          <span className="text-small text-text-muted">将导出2条记录，共{supplierExportFields.length}个字段。</span>
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

export function SupplierLifecycleModal({
  open,
  record,
  mode,
  onClose,
  onConfirm,
}: {
  open: boolean;
  record?: SupplierRecord;
  mode: SupplierLifecycleMode;
  onClose: () => void;
  onConfirm: (code: string, mode: SupplierLifecycleMode, reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setReason("");
    setError(null);
  }, [open, record?.code, mode]);

  if (!record) {
    return null;
  }

  const currentRecord = record;

  function handleConfirm() {
    if (mode === "disable" && !reason.trim()) {
      setError("停止合作必须填写原因，便于后续追踪历史合作关系。");
      return;
    }

    if (mode === "disable" && currentRecord.activePurchaseOrders > 0) {
      setError(`当前供应商仍有${currentRecord.activePurchaseOrders}条执行中采购订单，不能直接停止合作。`);
      return;
    }

    onConfirm(currentRecord.code, mode, reason.trim());
    onClose();
  }

  return (
    <Modal open={open} title={mode === "disable" ? "停止合作" : "恢复合作"} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-sm border border-border bg-bg-subtle p-4 text-small text-text-secondary">
          <div>供应商：{currentRecord.name}</div>
          <div className="mt-1">
            当前状态：{currentRecord.lifecycleStatus}，活跃采购单：{currentRecord.activePurchaseOrders}条
          </div>
        </div>

        {mode === "disable" ? (
          <div>
            <div className="field-label">停止合作原因</div>
            <textarea
              className="field-control min-h-[96px] py-3"
              value={reason}
              placeholder="请输入"
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
        ) : (
          <div className="rounded-sm border border-info bg-info-subtle p-4 text-small text-text-secondary">
            恢复合作后，该供应商将重新出现在采购寻源和下单范围内，但如需推送金蝶仍需重新校验映射。
          </div>
        )}

        {error ? <StatusNotice notice={{ tone: "error", title: "操作被拦截", description: error }} /> : null}

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>取消</Button>
          <Button variant={mode === "disable" ? "danger" : "primary"} onClick={handleConfirm}>
            {mode === "disable" ? "确认停止合作" : "确认恢复合作"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
