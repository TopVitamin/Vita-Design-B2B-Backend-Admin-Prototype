export type ExportTaskStatus = "processing" | "success" | "failed" | "downloaded";

export type ExportTaskStatusFilter = "all" | ExportTaskStatus;

export type ExportTaskTarget =
  | "purchase-list"
  | "supplier-list"
  | "customer-list"
  | "inventory-query"
  | "inventory-flow-query";

export type ExportTaskRecord = {
  id: string;
  taskName: string;
  sourceLabel: string;
  sourceTarget?: ExportTaskTarget;
  rangeLabel: string;
  format: "xlsx" | "csv";
  fieldCount: number;
  recordCount: number;
  requestedBy: string;
  createdAt: string;
  finishedAt?: string;
  status: ExportTaskStatus;
  fileName: string;
  failureReason?: string;
  detailSections: Array<{ label: string; value: string }>;
  detailBlocks: Array<{ title: string; content: string }>;
};

export const exportTaskStatusFilters: Array<{ id: ExportTaskStatusFilter; label: string }> = [
  { id: "all", label: "全部任务" },
  { id: "processing", label: "处理中" },
  { id: "success", label: "导出成功" },
  { id: "failed", label: "导出失败" },
  { id: "downloaded", label: "已下载" },
];

export const initialExportTaskRecords: ExportTaskRecord[] = [
  {
    id: "EXP-20260324-001",
    taskName: "采购订单列表导出",
    sourceLabel: "采购订单列表",
    sourceTarget: "purchase-list",
    rangeLabel: "当前筛选结果（38条）",
    format: "xlsx",
    fieldCount: 8,
    recordCount: 38,
    requestedBy: "当前用户",
    createdAt: "2026-03-24 09:18:10",
    finishedAt: "2026-03-24 09:18:18",
    status: "success",
    fileName: "采购订单列表_20260324_091810.xlsx",
    detailSections: [
      { label: "任务名称", value: "采购订单列表导出" },
      { label: "来源页面", value: "采购订单列表" },
      { label: "导出范围", value: "当前筛选结果（38条）" },
      { label: "文件格式", value: "Excel (.xlsx)" },
      { label: "记录数", value: "38条" },
      { label: "字段数", value: "8个" },
      { label: "发起人", value: "当前用户" },
      { label: "创建时间", value: "2026-03-24 09:18:10" },
    ],
    detailBlocks: [
      {
        title: "任务说明",
        content: "该任务根据当前采购订单筛选条件生成，适合在复盘和线下核对时直接下载Excel。",
      },
      {
        title: "结果状态",
        content: "任务已完成，文件已生成，可直接下载；若数据有变更，建议重新发起最新导出任务。",
      },
    ],
  },
  {
    id: "EXP-20260324-002",
    taskName: "库存流水查询导出",
    sourceLabel: "库存流水查询",
    sourceTarget: "inventory-flow-query",
    rangeLabel: "当前筛选结果（126条）",
    format: "csv",
    fieldCount: 12,
    recordCount: 126,
    requestedBy: "当前用户",
    createdAt: "2026-03-24 09:06:42",
    status: "processing",
    fileName: "库存流水查询_20260324_090642.csv",
    detailSections: [
      { label: "任务名称", value: "库存流水查询导出" },
      { label: "来源页面", value: "库存流水查询" },
      { label: "导出范围", value: "当前筛选结果（126条）" },
      { label: "文件格式", value: "CSV (.csv)" },
      { label: "记录数", value: "126条" },
      { label: "字段数", value: "12个" },
      { label: "发起人", value: "当前用户" },
      { label: "创建时间", value: "2026-03-24 09:06:42" },
    ],
    detailBlocks: [
      {
        title: "任务说明",
        content: "库存流水记录较多时，系统会进入后台排队处理，处理中任务可在导出任务中心持续查看状态。",
      },
      {
        title: "当前状态",
        content: "任务正在生成文件，完成后可直接下载；如长时间未完成，可稍后刷新中心页面或重试导出。",
      },
    ],
  },
  {
    id: "EXP-20260324-003",
    taskName: "供应商主数据导出",
    sourceLabel: "供应商主数据",
    sourceTarget: "supplier-list",
    rangeLabel: "全部数据（4条）",
    format: "xlsx",
    fieldCount: 10,
    recordCount: 4,
    requestedBy: "当前用户",
    createdAt: "2026-03-24 08:55:03",
    finishedAt: "2026-03-24 08:55:04",
    status: "downloaded",
    fileName: "供应商主数据_20260324_085503.xlsx",
    detailSections: [
      { label: "任务名称", value: "供应商主数据导出" },
      { label: "来源页面", value: "供应商主数据" },
      { label: "导出范围", value: "全部数据（4条）" },
      { label: "文件格式", value: "Excel (.xlsx)" },
      { label: "记录数", value: "4条" },
      { label: "字段数", value: "10个" },
      { label: "发起人", value: "当前用户" },
      { label: "创建时间", value: "2026-03-24 08:55:03" },
    ],
    detailBlocks: [
      {
        title: "任务说明",
        content: "供应商主数据任务量较小，通常会即时完成。系统会保留最近一次下载记录，方便复查。",
      },
      {
        title: "结果状态",
        content: "文件已下载。若需导出最新审核状态、金蝶推送结果或合作状态，请重新发起一次导出任务。",
      },
    ],
  },
  {
    id: "EXP-20260324-004",
    taskName: "客户主数据导出",
    sourceLabel: "客户主数据",
    sourceTarget: "customer-list",
    rangeLabel: "仅选中数据（2条）",
    format: "xlsx",
    fieldCount: 9,
    recordCount: 2,
    requestedBy: "当前用户",
    createdAt: "2026-03-24 08:41:27",
    finishedAt: "2026-03-24 08:41:30",
    status: "failed",
    fileName: "客户主数据_20260324_084127.xlsx",
    failureReason: "文件生成节点超时，请重试或稍后再次发起。",
    detailSections: [
      { label: "任务名称", value: "客户主数据导出" },
      { label: "来源页面", value: "客户主数据" },
      { label: "导出范围", value: "仅选中数据（2条）" },
      { label: "文件格式", value: "Excel (.xlsx)" },
      { label: "记录数", value: "2条" },
      { label: "字段数", value: "9个" },
      { label: "发起人", value: "当前用户" },
      { label: "创建时间", value: "2026-03-24 08:41:27" },
    ],
    detailBlocks: [
      {
        title: "失败原因",
        content: "文件生成节点超时，请重试或稍后再次发起。若多次失败，建议确认字段选择与文件格式配置。",
      },
      {
        title: "处理建议",
        content: "优先点击重试导出；如果仍失败，可先切换CSV格式或缩小导出范围，再次提交任务。",
      },
    ],
  },
];
