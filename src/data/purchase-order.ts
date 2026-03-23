export type PurchaseOrderRow = {
  id: string;
  type: string;
  status: string;
  supplier: string;
  organization: string;
  warehouse: string;
  amount: string;
  createdAt: string;
  owner: string;
  pushedQty: string;
  inboundQty: string;
};

export const purchaseOrders: PurchaseOrderRow[] = [
  {
    id: "PO20260321001",
    type: "普通采购",
    status: "待提交",
    supplier: "华东生鲜原料供应商有限公司",
    organization: "华东采购中心",
    warehouse: "上海生鲜仓",
    amount: "128,000.00",
    createdAt: "2026-03-21 10:32:11",
    owner: "张敏",
    pushedQty: "0%",
    inboundQty: "0%",
  },
  {
    id: "PO20260321002",
    type: "门店直送",
    status: "待审核",
    supplier: "华北包装耗材供应商",
    organization: "全国采购中心",
    warehouse: "北京中转仓",
    amount: "42,600.00",
    createdAt: "2026-03-21 14:08:02",
    owner: "王磊",
    pushedQty: "0%",
    inboundQty: "0%",
  },
  {
    id: "PO20260321003",
    type: "常温采购",
    status: "已审核",
    supplier: "广州调味品供应商集团",
    organization: "华南采购中心",
    warehouse: "广州常温仓",
    amount: "18,900.00",
    createdAt: "2026-03-20 09:15:47",
    owner: "李慧",
    pushedQty: "30%",
    inboundQty: "0%",
  },
  {
    id: "PO20260321004",
    type: "普通采购",
    status: "已取消",
    supplier: "华中调味料供应商",
    organization: "华中采购中心",
    warehouse: "武汉常温仓",
    amount: "25,600.00",
    createdAt: "2026-03-20 15:48:09",
    owner: "赵晨",
    pushedQty: "0%",
    inboundQty: "0%",
  },
  {
    id: "PO20260321005",
    type: "寄售采购",
    status: "待提交",
    supplier: "苏州包装辅料有限公司",
    organization: "华东采购中心",
    warehouse: "杭州冷链仓",
    amount: "66,300.00",
    createdAt: "2026-03-22 09:26:55",
    owner: "张敏",
    pushedQty: "0%",
    inboundQty: "0%",
  },
  {
    id: "PO20260321006",
    type: "普通采购",
    status: "待审核",
    supplier: "成都冻品供应商",
    organization: "西南采购中心",
    warehouse: "成都冷链仓",
    amount: "93,200.00",
    createdAt: "2026-03-22 11:05:32",
    owner: "陈涛",
    pushedQty: "0%",
    inboundQty: "0%",
  },
  {
    id: "PO20260321007",
    type: "门店直送",
    status: "已审核",
    supplier: "北京饮品物料服务商",
    organization: "全国采购中心",
    warehouse: "北京中转仓",
    amount: "41,880.00",
    createdAt: "2026-03-21 16:33:40",
    owner: "王磊",
    pushedQty: "10%",
    inboundQty: "0%",
  },
  {
    id: "PO20260321008",
    type: "常温采购",
    status: "已取消",
    supplier: "深圳设备备件供应商",
    organization: "华南采购中心",
    warehouse: "深圳设备仓",
    amount: "12,500.00",
    createdAt: "2026-03-19 10:20:18",
    owner: "李慧",
    pushedQty: "0%",
    inboundQty: "0%",
  },
];

export const lineItems = [
  {
    sku: "SKU-10086",
    name: "冷冻鸡腿排",
    spec: "2kg/袋",
    unit: "袋",
    qty: "120",
    price: "86.00",
    taxRate: "13%",
    amount: "11,661.60",
    eta: "2026-03-25",
  },
  {
    sku: "SKU-20012",
    name: "番茄酱",
    spec: "1kg/瓶",
    unit: "瓶",
    qty: "240",
    price: "22.50",
    taxRate: "13%",
    amount: "6,102.00",
    eta: "2026-03-26",
  },
];

export const relatedDocuments = [
  {
    relation: "上游",
    id: "PR20260318009",
    type: "采购申请单",
    status: "已审批",
    createdAt: "2026-03-18 08:12:10",
  },
  {
    relation: "下游",
    id: "RN20260322003",
    type: "入库通知单",
    status: "部分入库",
    createdAt: "2026-03-22 16:20:05",
  },
];

export const operationLogs = [
  { time: "2026-03-21 10:32:11", actor: "张敏", action: "新建采购订单", result: "成功" },
  { time: "2026-03-21 10:45:22", actor: "王建国", action: "提交审核", result: "成功" },
  { time: "2026-03-21 11:03:55", actor: "采购主管", action: "审核通过", result: "成功" },
];

export const approvalLogs = [
  { node: "采购主管审批", actor: "王建国", opinion: "同意采购", time: "2026-03-21 11:03:55" },
];
