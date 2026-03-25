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
  customerExportFields,
  customerImportFailures,
  type CustomerAddress,
  type CustomerApprovalLog,
  type CustomerChangeLog,
  type CustomerOperationLog,
  type CustomerRecord,
} from "../data/customer-master";

export type CustomerListScenario = "normal" | "loading" | "empty" | "no-result" | "no-auth" | "push-warning";
export type CustomerEditScenario = "normal" | "duplicate" | "credit-invalid" | "submit-failed" | "conflict" | "read-only";
export type CustomerDetailScenario = "normal" | "push-failed" | "no-auth";
export type CustomerImportStage = "select" | "loading" | "success" | "partial" | "file-error";
export type CustomerDetailTab = "contact" | "address" | "finance" | "approvals" | "logs" | "changes";
export type CustomerNotice = {
  tone: "success" | "warning" | "error";
  title: string;
  description: string;
} | null;

export type CustomerFormData = {
  code: string;
  name: string;
  group: string;
  type: string;
  parentGroup: string;
  status: CustomerRecord["status"];
  kingdeeStatus: CustomerRecord["kingdeeStatus"];
  currency: string;
  socialCreditCode: string;
  note: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  address: CustomerAddress;
};

type FieldOption = {
  label: string;
  value: string;
};

type CustomerListFilters = {
  code: string;
  name: string;
  group: string;
  type: string;
  parentGroup: string;
  status: string;
  kingdeeStatus: string;
  currency: string;
};

type CustomerQueryField = {
  key: string;
  label: string;
  value: string;
  kind?: "input" | "select";
  options?: FieldOption[];
  placeholder?: string;
  queryColumns?: 1 | 2;
  onChange: (value: string) => void;
};

const customerListTabs = [
  { label: "正常", value: "normal" },
  { label: "加载中", value: "loading" },
  { label: "空数据", value: "empty" },
  { label: "查询无结果", value: "no-result" },
  { label: "无权限", value: "no-auth" },
  { label: "推送异常", value: "push-warning" },
] as const;

const customerEditTabs = [
  { label: "正常", value: "normal" },
  { label: "重复客户", value: "duplicate" },
  { label: "信用代码错误", value: "credit-invalid" },
  { label: "提交失败", value: "submit-failed" },
  { label: "并发冲突", value: "conflict" },
  { label: "只读", value: "read-only" },
] as const;

const customerDetailTabs = [
  { label: "正常", value: "normal" },
  { label: "推送失败", value: "push-failed" },
  { label: "无权限", value: "no-auth" },
] as const;

const groupOptions: FieldOption[] = [
  { label: "连锁零售客户", value: "连锁零售客户" },
  { label: "电商渠道客户", value: "电商渠道客户" },
  { label: "跨境分销客户", value: "跨境分销客户" },
  { label: "集团关联客户", value: "集团关联客户" },
  { label: "KA商超客户", value: "KA商超客户" },
];

const typeOptions: FieldOption[] = [
  { label: "直营网点客户", value: "直营网点客户" },
  { label: "平台旗舰店客户", value: "平台旗舰店客户" },
  { label: "区域分销客户", value: "区域分销客户" },
  { label: "集团结算主体", value: "集团结算主体" },
  { label: "团购客户", value: "团购客户" },
];

const parentGroupOptions: FieldOption[] = [
  { label: "星晖商业集团有限公司", value: "星晖商业集团有限公司" },
  { label: "云汐零售控股有限公司", value: "云汐零售控股有限公司" },
  { label: "澄曜品牌运营集团有限公司", value: "澄曜品牌运营集团有限公司" },
  { label: "海岚国际消费品集团有限公司", value: "海岚国际消费品集团有限公司" },
];

const currencyOptions: FieldOption[] = [
  { label: "人民币", value: "人民币" },
  { label: "美元", value: "美元" },
  { label: "港币", value: "港币" },
];

const countryCodeOptions: FieldOption[] = [
  { label: "CN", value: "CN" },
  { label: "HK", value: "HK" },
  { label: "US", value: "US" },
];

const defaultListFilters: CustomerListFilters = {
  code: "",
  name: "",
  group: "全部",
  type: "全部",
  parentGroup: "全部",
  status: "全部",
  kingdeeStatus: "全部",
  currency: "全部",
};

function createEmptyAddress(): CustomerAddress {
  return {
    contact: "",
    phone: "",
    email: "",
    countryCode: "CN",
    state: "",
    city: "",
    district: "",
    town: "",
    detail: "",
    postalCode: "",
  };
}

export function createCustomerDraft(record?: CustomerRecord): CustomerFormData {
  if (record) {
    return {
      code: record.code,
      name: record.name,
      group: record.group,
      type: record.type,
      parentGroup: record.parentGroup,
      status: record.status,
      kingdeeStatus: record.kingdeeStatus,
      currency: record.currency,
      socialCreditCode: record.socialCreditCode,
      note: record.note,
      contactName: record.contactName,
      contactPhone: record.contactPhone,
      contactEmail: record.contactEmail,
      address: { ...record.address },
    };
  }

  return {
    code: "",
    name: "",
    group: "连锁零售客户",
    type: "直营网点客户",
    parentGroup: "星晖商业集团有限公司",
    status: "待提交",
    kingdeeStatus: "未推送",
    currency: "人民币",
    socialCreditCode: "",
    note: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    address: createEmptyAddress(),
  };
}

function formatAddress(address: CustomerAddress) {
  return `${address.countryCode} ${address.state} ${address.city} ${address.district} ${address.town} ${address.detail}`.trim();
}

function StatusNotice({
  notice,
  action,
}: {
  notice: CustomerNotice;
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

function statusBadge(status: CustomerRecord["status"]) {
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

function kingdeeBadge(status: CustomerRecord["kingdeeStatus"]) {
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
}: {
  title: string;
  address: CustomerAddress;
  readOnly: boolean;
  onChange: (field: keyof CustomerAddress, value: string) => void;
}) {
  return (
    <Card title={title}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <FormField label="联系人" value={address.contact} readOnly={readOnly} onChange={(value) => onChange("contact", value)} />
        <FormField label="联系电话" value={address.phone} readOnly={readOnly} onChange={(value) => onChange("phone", value)} />
        <FormField label="邮箱" value={address.email} readOnly={readOnly} onChange={(value) => onChange("email", value)} />
        <FormField
          label="国家/地区二字码"
          value={address.countryCode}
          kind="select"
          options={countryCodeOptions}
          readOnly={readOnly}
          onChange={(value) => onChange("countryCode", value)}
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

function editScenarioNotice(scenario: CustomerEditScenario): CustomerNotice {
  if (scenario === "duplicate") {
    return {
      tone: "error",
      title: "保存失败",
      description: "客户名称或统一社会信用代码已存在，禁止重复建档。",
    };
  }
  if (scenario === "credit-invalid") {
    return {
      tone: "error",
      title: "信用代码校验失败",
      description: "统一社会信用代码应按18位规则填写，提交前必须校验通过。",
    };
  }
  if (scenario === "submit-failed") {
    return {
      tone: "error",
      title: "提交失败",
      description: "客户分组、客户类型与金蝶映射不完整，当前不允许提交审核。",
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

export function CustomerListPage({
  records,
  scenario,
  onScenarioChange,
  onOpenCreate,
  onOpenEdit,
  onOpenDetail,
  onOpenImport,
  onOpenExport,
  notice,
  onClearNotice,
}: {
  records: CustomerRecord[];
  scenario: CustomerListScenario;
  onScenarioChange: (value: CustomerListScenario) => void;
  onOpenCreate: () => void;
  onOpenEdit: (code: string) => void;
  onOpenDetail: (code: string) => void;
  onOpenImport: () => void;
  onOpenExport: () => void;
  notice: CustomerNotice;
  onClearNotice: () => void;
}) {
  const [draftFilters, setDraftFilters] = useState<CustomerListFilters>(defaultListFilters);
  const [activeFilters, setActiveFilters] = useState<CustomerListFilters>(defaultListFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCodes, setSelectedCodes] = useState<string[]>(records.slice(0, 2).map((item) => item.code));
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [sortState, setSortState] = useState<TableSortState<string>>(null);

  const customerColumns = useMemo(
    () =>
      [
        { id: "select", label: "选择", group: "基础信息", required: true, defaultFixed: true, width: 56 },
        { id: "code", label: "客户编码", group: "基础信息", required: true, defaultFixed: true, width: 156 },
        { id: "name", label: "客户名称", group: "基础信息", defaultFixed: true, width: 220 },
        { id: "group", label: "客户分组", group: "基础信息", width: 140 },
        { id: "type", label: "客户类型", group: "基础信息", width: 150 },
        { id: "parentGroup", label: "客户所属集团", group: "组织信息", width: 190 },
        { id: "status", label: "状态", group: "状态信息", width: 118 },
        { id: "kingdeeStatus", label: "推送金蝶状态", group: "状态信息", width: 130 },
        { id: "currency", label: "结算币别", group: "状态信息", width: 104 },
        { id: "contactName", label: "联系人", group: "联系信息", width: 110 },
        { id: "createdBy", label: "创建人", group: "制单信息", width: 100 },
        { id: "createdAt", label: "创建时间", group: "制单信息", width: 168, sortType: "datetime" as TableSortType, getSortValue: (row: CustomerRecord) => row.createdAt },
        { id: "socialCreditCode", label: "统一社会信用代码", group: "扩展字段", defaultVisible: false, width: 190 },
        { id: "countryCode", label: "国家/地区二字码", group: "扩展字段", defaultVisible: false, width: 146 },
        { id: "updatedAt", label: "最后修改时间", group: "扩展字段", defaultVisible: false, width: 168, sortType: "datetime" as TableSortType, getSortValue: (row: CustomerRecord) => row.updatedAt },
        { id: "actions", label: "操作", group: "基础信息", required: true, width: 140 },
      ] satisfies Array<ColumnSettingsField & { width: number; sortType?: TableSortType; getSortValue?: (row: CustomerRecord) => unknown }>,
    [],
  );

  const {
    state: customerColumnState,
    defaultState: customerDefaultColumnState,
    applyState: applyCustomerColumnState,
  } = usePersistedColumnSettings({
    storageKey: "column-settings:demo-user:customer-list",
    fields: customerColumns,
    defaultDensity: "medium",
  });
  const { beginResize, widths: columnWidths } = useTableColumnResize({
    state: customerColumnState,
    applyState: applyCustomerColumnState,
  });

  const visibleColumns = useMemo(() => {
    return customerColumnState.order
      .filter((id) => customerColumnState.visible.includes(id))
      .map((id) => customerColumns.find((column) => column.id === id))
      .filter((column): column is (typeof customerColumns)[number] => Boolean(column));
  }, [customerColumnState.order, customerColumnState.visible, customerColumns]);

  const fixedLeftMap = useMemo(() => {
    const fixedSet = new Set(customerColumnState.fixed);
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
  }, [columnWidths, customerColumnState.fixed, visibleColumns]);

  useEffect(() => {
    setSelectedCodes((current) => current.filter((code) => records.some((item) => item.code === code)));
  }, [records]);

  const queryFieldDefinitions: CustomerQueryField[] = [
    {
      key: "code",
      label: "客户编码",
      value: draftFilters.code,
      placeholder: "请输入客户编码",
      onChange: (value: string) => setDraftFilters((current) => ({ ...current, code: value })),
    },
    {
      key: "name",
      label: "客户名称",
      value: draftFilters.name,
      placeholder: "请输入客户名称",
      onChange: (value: string) => setDraftFilters((current) => ({ ...current, name: value })),
    },
    {
      key: "group",
      label: "客户分组",
      kind: "select" as const,
      value: draftFilters.group,
      options: [{ label: "全部", value: "全部" }, ...groupOptions],
      onChange: (value: string) => setDraftFilters((current) => ({ ...current, group: value })),
    },
    {
      key: "type",
      label: "客户类型",
      kind: "select" as const,
      value: draftFilters.type,
      options: [{ label: "全部", value: "全部" }, ...typeOptions],
      onChange: (value: string) => setDraftFilters((current) => ({ ...current, type: value })),
    },
    {
      key: "parentGroup",
      label: "客户所属集团",
      kind: "select" as const,
      value: draftFilters.parentGroup,
      options: [{ label: "全部", value: "全部" }, ...parentGroupOptions],
      onChange: (value: string) => setDraftFilters((current) => ({ ...current, parentGroup: value })),
    },
    {
      key: "status",
      label: "状态",
      kind: "select" as const,
      value: draftFilters.status,
      options: [
        { label: "全部", value: "全部" },
        { label: "待提交", value: "待提交" },
        { label: "待审核", value: "待审核" },
        { label: "已审核", value: "已审核" },
        { label: "已驳回", value: "已驳回" },
      ],
      onChange: (value: string) => setDraftFilters((current) => ({ ...current, status: value })),
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
      key: "currency",
      label: "结算币别",
      kind: "select" as const,
      value: draftFilters.currency,
      options: [{ label: "全部", value: "全部" }, ...currencyOptions],
      onChange: (value: string) => setDraftFilters((current) => ({ ...current, currency: value })),
    },
  ];
  const visibleQueryFields = getVisibleQuerySectionItems(queryFieldDefinitions, showMoreFilters);
  const hasCollapsedQueryFields = hasCollapsedQuerySectionItems(queryFieldDefinitions);
  const sortConfigs = useMemo(
    () =>
      customerColumns.reduce<Partial<Record<string, TableSortConfig<CustomerRecord>>>>((configs, column) => {
        if (!column.sortType || !column.getSortValue) {
          return configs;
        }

        configs[column.id] = {
          type: column.sortType,
          getValue: column.getSortValue,
        };
        return configs;
      }, {}),
    [customerColumns],
  );

  const filteredRows = useMemo(() => {
    return records.filter((row) => {
      const matchesCode = !activeFilters.code || row.code.toLowerCase().includes(activeFilters.code.toLowerCase());
      const matchesName = !activeFilters.name || row.name.toLowerCase().includes(activeFilters.name.toLowerCase());
      const matchesGroup = activeFilters.group === "全部" || row.group === activeFilters.group;
      const matchesType = activeFilters.type === "全部" || row.type === activeFilters.type;
      const matchesParentGroup = activeFilters.parentGroup === "全部" || row.parentGroup === activeFilters.parentGroup;
      const matchesStatus = activeFilters.status === "全部" || row.status === activeFilters.status;
      const matchesKingdee = activeFilters.kingdeeStatus === "全部" || row.kingdeeStatus === activeFilters.kingdeeStatus;
      const matchesCurrency = activeFilters.currency === "全部" || row.currency === activeFilters.currency;

      return (
        matchesCode &&
        matchesName &&
        matchesGroup &&
        matchesType &&
        matchesParentGroup &&
        matchesStatus &&
        matchesKingdee &&
        matchesCurrency
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
      const matchesGroup = draftFilters.group === "全部" || row.group === draftFilters.group;
      const matchesType = draftFilters.type === "全部" || row.type === draftFilters.type;
      const matchesParentGroup = draftFilters.parentGroup === "全部" || row.parentGroup === draftFilters.parentGroup;
      const matchesStatus = draftFilters.status === "全部" || row.status === draftFilters.status;
      const matchesKingdee = draftFilters.kingdeeStatus === "全部" || row.kingdeeStatus === draftFilters.kingdeeStatus;
      const matchesCurrency = draftFilters.currency === "全部" || row.currency === draftFilters.currency;

      return (
        matchesCode &&
        matchesName &&
        matchesGroup &&
        matchesType &&
        matchesParentGroup &&
        matchesStatus &&
        matchesKingdee &&
        matchesCurrency
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

  function getCustomerColumnCell(row: CustomerRecord, columnId: string) {
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

    if (columnId === "group") {
      return row.group;
    }

    if (columnId === "type") {
      return row.type;
    }

    if (columnId === "parentGroup") {
      return row.parentGroup;
    }

    if (columnId === "status") {
      return statusBadge(row.status);
    }

    if (columnId === "kingdeeStatus") {
      return kingdeeBadge(row.kingdeeStatus);
    }

    if (columnId === "currency") {
      return row.currency;
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

    if (columnId === "countryCode") {
      return row.address.countryCode;
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
        </div>
      );
    }

    return "-";
  }

  const showTable = scenario === "normal" || scenario === "push-warning";

  return (
    <div className="space-y-page-block">
      <DemoToolbar label="列表页" items={customerListTabs} value={scenario} onChange={onScenarioChange} />

      <PageHeader
        title="客户主数据"
        description="用于维护客户建档、审核、推送金蝶与结算主体信息。"
        actions={
          <>
            <Button variant="primary" onClick={onOpenCreate}>
              新增客户
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
          description="当前用户没有客户主数据访问权限，需开通主数据菜单及集团数据范围后方可进入。"
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
          description="当前集团下还没有客户资料，请从“新增客户”开始创建主数据。"
          primaryAction={<Button variant="primary" onClick={onOpenCreate}>新增客户</Button>}
        />
      ) : null}

      {scenario === "no-result" ? (
        <ExceptionState
          variant="404"
          title="查询无结果"
          description="没有符合当前筛选条件的客户，请调整条件后重试。"
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
                description: "当前有1条客户资料推送失败，应支持查看失败原因并进行重推。",
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

            <HorizontalScrollArea viewportClassName={getDensityClassName(customerColumnState.density)}>
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
                  {pageRows.map((row) => (
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
                            {getCustomerColumnCell(row, column.id)}
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
        title="客户列表列设置"
        fields={customerColumns}
        state={customerColumnState}
        defaultState={customerDefaultColumnState}
        onClose={() => setColumnSettingsOpen(false)}
        onApply={applyCustomerColumnState}
      />
    </div>
  );
}

export function CustomerEditPage({
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
  scenario: CustomerEditScenario;
  record?: CustomerRecord;
  existingRecords: CustomerRecord[];
  onScenarioChange: (value: CustomerEditScenario) => void;
  onBackToList: () => void;
  onSaveDraft: (draft: CustomerFormData) => string;
  onSubmit: (draft: CustomerFormData) => string;
  onOpenDetail: (code: string) => void;
}) {
  const [form, setForm] = useState<CustomerFormData>(() => createCustomerDraft(record));
  const [notice, setNotice] = useState<CustomerNotice>(null);

  useEffect(() => {
    setForm(createCustomerDraft(record));
    setNotice(null);
  }, [mode, record?.code]);

  const readOnly = scenario === "read-only";
  const forcedScenarioNotice = editScenarioNotice(scenario);

  function updateField<K extends keyof CustomerFormData>(key: K, value: CustomerFormData[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateAddress(field: keyof CustomerAddress, value: string) {
    setForm((current) => ({
      ...current,
      address: {
        ...current.address,
        [field]: value,
      },
    }));
  }

  function validate(action: "save" | "submit") {
    if (!form.name.trim()) {
      return {
        tone: "error" as const,
        title: "保存失败",
        description: "客户名称不能为空。",
      };
    }

    if (!form.group || !form.type || !form.parentGroup) {
      return {
        tone: "error" as const,
        title: "保存失败",
        description: "客户分组、客户类型和客户所属集团不能为空。",
      };
    }

    if (!form.currency) {
      return {
        tone: "error" as const,
        title: "保存失败",
        description: "结算币别不能为空。",
      };
    }

    const normalizedCreditCode = form.socialCreditCode.trim();
    if (normalizedCreditCode && normalizedCreditCode.length !== 18) {
      return {
        tone: "error" as const,
        title: "信用代码不合法",
        description: "统一社会信用代码应按18位规则填写。",
      };
    }

    const duplicate = existingRecords.find(
      (item) =>
        item.code !== record?.code &&
        (item.name === form.name.trim() || (normalizedCreditCode && item.socialCreditCode === normalizedCreditCode)),
    );

    if (duplicate) {
      return {
        tone: "error" as const,
        title: "存在重复客户",
        description: `系统中已存在客户${duplicate.code}，请核对名称或统一社会信用代码。`,
      };
    }

    if (action === "submit") {
      if (!normalizedCreditCode) {
        return {
          tone: "error" as const,
          title: "提交失败",
          description: "统一社会信用代码不能为空，提交审核前必须补齐企业主体信息。",
        };
      }

      if (!form.contactName.trim() || !form.contactPhone.trim() || !form.contactEmail.trim()) {
        return {
          tone: "error" as const,
          title: "提交失败",
          description: "联系人、联系电话和邮箱不能为空。",
        };
      }

      if (!form.address.detail.trim()) {
        return {
          tone: "error" as const,
          title: "提交失败",
          description: "详细地址不能为空，提交前必须补齐联系信息。",
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
    setForm((current) => ({ ...current, code, status: "待提交" }));
    setNotice({
      tone: "success",
      title: mode === "create" ? "保存成功" : "更新成功",
      description:
        mode === "create"
          ? `系统已生成客户编码${code}，当前记录处于待提交状态。`
          : "客户资料已保存，后续修改需重新提交审核。",
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
    setForm((current) => ({ ...current, code, status: "待审核" }));
    setNotice({
      tone: "success",
      title: "提交成功",
      description: `客户${code}已提交审核，审核通过后才允许推送金蝶。`,
    });
  }

  const currentCode = form.code || "保存后自动生成";

  return (
    <div className="space-y-page-block">
      <DemoToolbar label={mode === "create" ? "新增页" : "编辑页"} items={customerEditTabs} value={scenario} onChange={onScenarioChange} />

      <PageHeader
        title={mode === "create" ? "新增客户主数据" : `编辑客户 ${currentCode}`}
        description="客户主数据在提交审核前允许反复保存；提交后进入待审核状态，审核通过后才能推送金蝶。"
        actions={
          <>
            <Button onClick={onBackToList}>返回列表</Button>
            {form.code ? <Button onClick={() => onOpenDetail(form.code)}>查看详情</Button> : null}
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

      <Card title="基本信息卡片" extra={<span className="text-small text-text-muted">客户编码、状态与推送状态由系统维护</span>}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FormField label="客户编码" value={currentCode} readOnly />
          <FormField label="客户名称" value={form.name} readOnly={readOnly} onChange={(value) => updateField("name", value)} />
          <FormField
            label="客户分组"
            kind="select"
            value={form.group}
            options={groupOptions}
            readOnly={readOnly}
            onChange={(value) => updateField("group", value)}
          />
          <FormField
            label="客户类型"
            kind="select"
            value={form.type}
            options={typeOptions}
            readOnly={readOnly}
            onChange={(value) => updateField("type", value)}
          />
          <FormField
            label="客户所属集团"
            kind="select"
            value={form.parentGroup}
            options={parentGroupOptions}
            readOnly={readOnly}
            onChange={(value) => updateField("parentGroup", value)}
          />
          <FormField label="状态" value={form.status} readOnly />
          <FormField label="推送金蝶状态" value={form.kingdeeStatus} readOnly />
          <FormField
            label="结算币别"
            kind="select"
            value={form.currency}
            options={currencyOptions}
            readOnly={readOnly}
            onChange={(value) => updateField("currency", value)}
          />
          <FormField
            label="统一社会信用代码"
            value={form.socialCreditCode}
            readOnly={readOnly}
            onChange={(value) => updateField("socialCreditCode", value)}
          />
        </div>
      </Card>

      <Card title="联系信息卡片">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FormField label="联系人" value={form.contactName} readOnly={readOnly} onChange={(value) => updateField("contactName", value)} />
          <FormField label="联系电话" value={form.contactPhone} readOnly={readOnly} onChange={(value) => updateField("contactPhone", value)} />
          <FormField label="邮箱" value={form.contactEmail} readOnly={readOnly} onChange={(value) => updateField("contactEmail", value)} />
          <div className="md:col-span-2 xl:col-span-4">
            <FormField
              label="备注"
              kind="textarea"
              value={form.note}
              readOnly={readOnly}
              placeholder="用于补充客户分组、渠道说明、结算提示或推送备注"
              onChange={(value) => updateField("note", value)}
            />
          </div>
        </div>
      </Card>

      <AddressFields title="地址信息卡片" address={form.address} readOnly={readOnly} onChange={updateAddress} />
    </div>
  );
}

export function CustomerDetailPage({
  record,
  scenario,
  activeTab,
  onScenarioChange,
  onTabChange,
  onOpenEdit,
  onApprove,
  onRetryPush,
}: {
  record: CustomerRecord;
  scenario: CustomerDetailScenario;
  activeTab: CustomerDetailTab;
  onScenarioChange: (value: CustomerDetailScenario) => void;
  onTabChange: (value: CustomerDetailTab) => void;
  onOpenEdit: (code: string) => void;
  onApprove: (code: string) => void;
  onRetryPush: (code: string) => void;
}) {
  const [notice, setNotice] = useState<CustomerNotice>(null);

  useEffect(() => {
    setNotice(null);
  }, [record.code]);

  if (scenario === "no-auth") {
    return (
      <div className="space-y-page-block">
        <DemoToolbar label="详情页" items={customerDetailTabs} value={scenario} onChange={onScenarioChange} />
        <PageHeader title="客户详情" description="详情页必须覆盖无权限和推送异常状态。" />
        <ExceptionState
          variant="403"
          description="当前用户可以看客户列表，但没有客户详情访问权限。"
          primaryAction={<Button variant="primary">联系管理员</Button>}
          secondaryAction={<Button>返回列表</Button>}
        />
      </div>
    );
  }

  const pushFailed = scenario === "push-failed" || record.kingdeeStatus === "推送失败";

  function handleApprove() {
    if (record.status === "已审核") {
      setNotice({
        tone: "warning",
        title: "无需重复审核",
        description: "当前客户资料已经审核通过，可直接处理金蝶推送。",
      });
      return;
    }

    onApprove(record.code);
    setNotice({
      tone: "success",
      title: "审核通过",
      description: "客户资料已通过审核，当前可进入金蝶推送流程。",
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
      <DemoToolbar label="详情页" items={customerDetailTabs} value={scenario} onChange={onScenarioChange} />
      <PageHeader title="客户详情" description="详情页展示客户分组、审核记录、推送状态和主数据变更轨迹。" />

      <section className="detail-hero">
        <div className="detail-hero-main">
          <div className="detail-hero-title-row">
            <h2 className="page-title">{record.code}</h2>
            {statusBadge(record.status)}
            {kingdeeBadge(record.kingdeeStatus)}
          </div>
          <div className="detail-hero-meta">
            <span>客户名称：{record.name}</span>
            <span>客户所属集团：{record.parentGroup}</span>
            <span>创建人：{record.createdBy}</span>
            <span>创建时间：{record.createdAt}</span>
          </div>
        </div>
        <div className="detail-hero-actions">
          <Button onClick={() => onOpenEdit(record.code)}>
            编辑
          </Button>
          <Button onClick={handleApprove} disabled={record.status === "已审核"}>
            审核通过
          </Button>
          <Button variant="primary" onClick={handleRetryPush} disabled={record.status !== "已审核"}>
            重推金蝶
          </Button>
        </div>
      </section>

      <StatusNotice notice={notice} />

      {pushFailed ? (
        <StatusNotice
          notice={{
            tone: "warning",
            title: "推送金蝶失败",
            description: "当前记录存在金蝶同步异常，建议先核对客户类型、集团映射和结算币别后再重推。",
          }}
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="基本信息">
          <InfoGrid
            items={[
              ["客户编码", record.code],
              ["客户名称", record.name],
              ["客户分组", record.group],
              ["客户类型", record.type],
              ["客户所属集团", record.parentGroup],
              ["状态", record.status],
              ["推送金蝶状态", record.kingdeeStatus],
              ["结算币别", record.currency],
            ]}
          />
        </Card>
        <Card title="制单信息">
          <InfoGrid
            items={[
              ["统一社会信用代码", record.socialCreditCode],
              ["创建人", record.createdBy],
              ["创建时间", record.createdAt],
              ["修改人", record.updatedBy],
              ["修改时间", record.updatedAt],
              ["审核人", record.reviewedBy],
              ["审核时间", record.reviewedAt],
            ]}
          />
        </Card>
      </div>

      <Card title="Tab区">
        <Tabs
          items={[
            { label: "联系信息", value: "contact" },
            { label: "地址信息", value: "address" },
            { label: "结算与备注", value: "finance" },
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
                    ["国家/地区二字码", record.address.countryCode],
                  ]}
                />
              </Card>
              <Card title="客户说明">
                <InfoGrid
                  items={[
                    ["客户分组", record.group],
                    ["客户类型", record.type],
                    ["备注", record.note || "-"],
                  ]}
                />
              </Card>
            </div>
          ) : null}

          {activeTab === "address" ? (
            <Card title="地址信息">
              <InfoGrid
                items={[
                  ["联系人", record.address.contact],
                  ["联系电话", record.address.phone],
                  ["邮箱", record.address.email],
                  ["国家/地区二字码", record.address.countryCode],
                  ["地址", formatAddress(record.address)],
                  ["邮编", record.address.postalCode],
                ]}
              />
            </Card>
          ) : null}

          {activeTab === "finance" ? (
            <div className="grid gap-4 xl:grid-cols-2">
              <Card title="结算信息">
                <InfoGrid
                  items={[
                    ["结算币别", record.currency],
                    ["统一社会信用代码", record.socialCreditCode],
                    ["客户所属集团", record.parentGroup],
                  ]}
                />
              </Card>
              <Card title="备注信息">
                <InfoGrid
                  items={[
                    ["推送金蝶状态", record.kingdeeStatus],
                    ["备注", record.note || "-"],
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

function ApprovalTable({ items }: { items: CustomerApprovalLog[] }) {
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

function OperationLogTable({ items }: { items: CustomerOperationLog[] }) {
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

function ChangeLogTable({ items }: { items: CustomerChangeLog[] }) {
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

export function CustomerImportModal({
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
  stage: CustomerImportStage;
  mode: Exclude<CustomerImportStage, "select" | "loading">;
  onModeChange: (value: Exclude<CustomerImportStage, "select" | "loading">) => void;
  onClose: () => void;
  onStart: () => void;
  onReset: () => void;
  onFinish: (result: Exclude<CustomerImportStage, "select" | "loading">) => void;
}) {
  return (
    <Modal open={open} title="导入客户主数据" onClose={onClose}>
      {stage === "select" ? (
        <ImportSelectStage
          intro="建议先下载模板，并按“客户分组、客户类型可识别、统一社会信用代码完整、结算币别已开通”的规则填写。"
          templateName="客户主数据导入模板.xlsx"
          templateDescription="包含基本信息、联系信息、地址信息与制单信息字段说明。"
          modeItems={[
            { label: "全部成功", value: "success" },
            { label: "部分失败", value: "partial" },
            { label: "文件失败", value: "file-error" },
          ]}
          modeValue={mode}
          onModeChange={(value) => onModeChange(value as Exclude<CustomerImportStage, "select" | "loading">)}
          onClose={onClose}
          onStart={onStart}
        />
      ) : null}

      {stage === "loading" ? (
        <ImportLoadingState
          title="正在导入客户数据，请稍候…"
          description="系统会校验信用代码、客户类型映射、集团权限与结算币别配置。"
        />
      ) : null}

      {stage === "success" ? (
        <CustomerImportResult
          tone="success"
          title="导入成功"
          description="全部28条客户资料已成功导入。"
          showDetail={false}
          onReset={onReset}
          onClose={() => onFinish("success")}
        />
      ) : null}

      {stage === "partial" ? (
        <CustomerImportResult
          tone="warning"
          title="导入完成（部分失败）"
          description="共28条，成功25条，3条因校验错误被跳过。"
          showDetail
          onReset={onReset}
          onClose={() => onFinish("partial")}
        />
      ) : null}

      {stage === "file-error" ? (
        <CustomerImportResult
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

function CustomerImportResult({
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
        { value: "28", label: "导入总数" },
        { value: showDetail ? "25" : "28", label: "成功写入", tone: "success" },
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
          ? customerImportFailures.map((item) => ({
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

export function CustomerExportModal({
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
    <Modal open={open} title="导出客户主数据" onClose={onClose}>
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
            <span>已选{customerExportFields.length}/{customerExportFields.length}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {customerExportFields.map((field) => (
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
          <span className="text-small text-text-muted">将导出2条记录，共{customerExportFields.length}个字段。</span>
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
