export type SupplierAddress = {
  contact: string;
  phone: string;
  email: string;
  country: string;
  state: string;
  city: string;
  district: string;
  town: string;
  detail: string;
  postalCode: string;
};

export type SupplierOperationLog = {
  time: string;
  actor: string;
  action: string;
  result: string;
  remark?: string;
};

export type SupplierChangeLog = {
  time: string;
  actor: string;
  field: string;
  before: string;
  after: string;
};

export type SupplierApprovalLog = {
  node: string;
  actor: string;
  result: string;
  opinion: string;
  time: string;
};

export type SupplierRecord = {
  code: string;
  name: string;
  category: string;
  lifecycleStatus: "新供应商" | "正常" | "预淘汰" | "合同到期" | "停止合作";
  auditStatus: "待提交" | "待审核" | "已审核" | "已驳回";
  kingdeeStatus: "未推送" | "推送中" | "推送成功" | "推送失败";
  organization: string;
  socialCreditCode: string;
  overseasCompany: "是" | "否";
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
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  reviewedBy: string;
  reviewedAt: string;
  activePurchaseOrders: number;
  riskLevel: "低" | "中" | "高";
  note: string;
  operationLogs: SupplierOperationLog[];
  changeLogs: SupplierChangeLog[];
  approvalLogs: SupplierApprovalLog[];
};

const shanghaiShippingAddress: SupplierAddress = {
  contact: "王洁",
  phone: "13800138001",
  email: "ops@chengyao-beauty.example.com",
  country: "中国",
  state: "上海市",
  city: "上海市",
  district: "浦东新区",
  town: "金桥镇",
  detail: "金穗路88号3号仓",
  postalCode: "200120",
};

const shanghaiReturnAddress: SupplierAddress = {
  contact: "周彦",
  phone: "13800138012",
  email: "return@chengyao-beauty.example.com",
  country: "中国",
  state: "上海市",
  city: "上海市",
  district: "奉贤区",
  town: "海湾镇",
  detail: "平庄西路2299号退货中心",
  postalCode: "201418",
};

export const supplierRecords: SupplierRecord[] = [
  {
    code: "SUP20260322001",
    name: "澄曜美妆科技有限公司",
    category: "美妆成品供应商",
    lifecycleStatus: "正常",
    auditStatus: "已审核",
    kingdeeStatus: "推送成功",
    organization: "星瀚零售采购有限公司",
    socialCreditCode: "91310115MA1K4WQX2P",
    overseasCompany: "否",
    countryRegion: "中国",
    bankAccountName: "澄曜美妆科技有限公司",
    bankAccountNo: "310501234567890001",
    bankName: "招商银行上海分行",
    bankBranch: "上海自贸试验区支行",
    contactName: "王洁",
    contactPhone: "13800138001",
    contactEmail: "vendor@chengyao-beauty.example.com",
    contactTitle: "商务经理",
    paymentTerm: "月结30天",
    currency: "人民币",
    invoiceType: "增值税电子专用发票",
    taxRate: "0.13",
    taxpayerType: "一般纳税人",
    shippingAddress: shanghaiShippingAddress,
    returnAddress: shanghaiReturnAddress,
    createdBy: "李晓雯",
    createdAt: "2026-03-18 09:20:16",
    updatedBy: "陈思宇",
    updatedAt: "2026-03-22 11:08:42",
    reviewedBy: "采购主管",
    reviewedAt: "2026-03-19 14:12:38",
    activePurchaseOrders: 2,
    riskLevel: "低",
    note: "支持美妆成品常备货与新品打样，开票信息已完成金蝶映射。",
    operationLogs: [
      { time: "2026-03-18 09:20:16", actor: "李晓雯", action: "新建供应商资料", result: "成功" },
      { time: "2026-03-18 17:42:09", actor: "李晓雯", action: "提交审核", result: "成功" },
      { time: "2026-03-19 14:12:38", actor: "采购主管", action: "审核通过", result: "成功", remark: "资料齐全，允许准入" },
      { time: "2026-03-19 14:30:02", actor: "系统", action: "推送金蝶", result: "成功" },
    ],
    changeLogs: [
      {
        time: "2026-03-22 11:08:42",
        actor: "陈思宇",
        field: "付款条件",
        before: "票到15天",
        after: "月结30天",
      },
      {
        time: "2026-03-22 11:08:42",
        actor: "陈思宇",
        field: "退货地址",
        before: "奉贤区海湾旅游区环湖西一路",
        after: "平庄西路2299号退货中心",
      },
    ],
    approvalLogs: [
      {
        node: "供应商主数据审批",
        actor: "采购主管",
        result: "通过",
        opinion: "基础资料完整，可同步金蝶。",
        time: "2026-03-19 14:12:38",
      },
    ],
  },
  {
    code: "SUP20260322002",
    name: "岭南优包材料科技有限公司",
    category: "包装材料供应商",
    lifecycleStatus: "新供应商",
    auditStatus: "待审核",
    kingdeeStatus: "未推送",
    organization: "云川品牌供应链有限公司",
    socialCreditCode: "91440101MA59T7NN8Y",
    overseasCompany: "否",
    countryRegion: "中国",
    bankAccountName: "岭南优包材料科技有限公司",
    bankAccountNo: "440501998877660001",
    bankName: "中国银行广州白云支行",
    bankBranch: "机场路支行",
    contactName: "林佳敏",
    contactPhone: "13900139002",
    contactEmail: "contact@lingnan-pack.example.com",
    contactTitle: "客户经理",
    paymentTerm: "票到15天",
    currency: "人民币",
    invoiceType: "增值税普通发票",
    taxRate: "0.13",
    taxpayerType: "一般纳税人",
    shippingAddress: {
      contact: "林佳敏",
      phone: "13900139002",
      email: "delivery@lingnan-pack.example.com",
      country: "中国",
      state: "广东省",
      city: "广州市",
      district: "白云区",
      town: "嘉禾街道",
      detail: "望岗工业一路7号B栋",
      postalCode: "510440",
    },
    returnAddress: {
      contact: "陈东",
      phone: "13900139008",
      email: "return@lingnan-pack.example.com",
      country: "中国",
      state: "广东省",
      city: "广州市",
      district: "白云区",
      town: "嘉禾街道",
      detail: "望岗工业一路7号B栋2楼",
      postalCode: "510440",
    },
    createdBy: "苏宁",
    createdAt: "2026-03-21 15:02:47",
    updatedBy: "苏宁",
    updatedAt: "2026-03-21 15:40:11",
    reviewedBy: "-",
    reviewedAt: "-",
    activePurchaseOrders: 0,
    riskLevel: "中",
    note: "新引入包装材料供应商，待审核后才能推送金蝶。",
    operationLogs: [
      { time: "2026-03-21 15:02:47", actor: "苏宁", action: "新建供应商资料", result: "成功" },
      { time: "2026-03-21 15:40:11", actor: "苏宁", action: "提交审核", result: "成功" },
    ],
    changeLogs: [
      {
        time: "2026-03-21 15:35:18",
        actor: "苏宁",
        field: "开户银行",
        before: "空白",
        after: "中国银行广州白云支行",
      },
    ],
    approvalLogs: [
      {
        node: "供应商主数据审批",
        actor: "待采购主管处理",
        result: "待审核",
        opinion: "等待审批",
        time: "-",
      },
    ],
  },
  {
    code: "SUP20260322003",
    name: "Virelia Beauty HK Limited",
    category: "跨境品牌代理商",
    lifecycleStatus: "预淘汰",
    auditStatus: "已审核",
    kingdeeStatus: "推送失败",
    organization: "星瀚零售采购有限公司",
    socialCreditCode: "91440300MA5GHY0R1K",
    overseasCompany: "是",
    countryRegion: "中国香港",
    bankAccountName: "Virelia Beauty HK Limited",
    bankAccountNo: "012-998877-665544",
    bankName: "HSBC Hong Kong",
    bankBranch: "Kowloon Bay Branch",
    contactName: "Ivy Chan",
    contactPhone: "+852-55667788",
    contactEmail: "ops@virelia-hk.example.com",
    contactTitle: "Regional Sales",
    paymentTerm: "月结7天",
    currency: "美元",
    invoiceType: "增值税普通发票",
    taxRate: "0.00",
    taxpayerType: "一般纳税人",
    shippingAddress: {
      contact: "Ivy Chan",
      phone: "+852-55667788",
      email: "ship@virelia-hk.example.com",
      country: "中国香港",
      state: "九龙",
      city: "香港",
      district: "观塘",
      town: "九龙湾",
      detail: "宏开道16号德福大厦9楼",
      postalCode: "999077",
    },
    returnAddress: {
      contact: "Maggie Lee",
      phone: "+852-55669911",
      email: "return@virelia-hk.example.com",
      country: "中国香港",
      state: "九龙",
      city: "香港",
      district: "观塘",
      town: "九龙湾",
      detail: "宏开道16号德福大厦10楼",
      postalCode: "999077",
    },
    createdBy: "周佳怡",
    createdAt: "2026-03-12 10:03:22",
    updatedBy: "周佳怡",
    updatedAt: "2026-03-22 09:48:50",
    reviewedBy: "采购主管",
    reviewedAt: "2026-03-13 16:28:19",
    activePurchaseOrders: 0,
    riskLevel: "高",
    note: "金蝶映射缺少境外银行地区码，当前重推会失败。",
    operationLogs: [
      { time: "2026-03-13 16:28:19", actor: "采购主管", action: "审核通过", result: "成功" },
      { time: "2026-03-13 17:03:51", actor: "系统", action: "推送金蝶", result: "失败", remark: "缺少银行地区码映射" },
      { time: "2026-03-22 09:48:50", actor: "周佳怡", action: "修改付款条件", result: "成功" },
    ],
    changeLogs: [
      {
        time: "2026-03-22 09:48:50",
        actor: "周佳怡",
        field: "付款条件",
        before: "预付100%",
        after: "月结7天",
      },
      {
        time: "2026-03-22 09:48:50",
        actor: "周佳怡",
        field: "供应商生命周期状态",
        before: "正常",
        after: "预淘汰",
      },
    ],
    approvalLogs: [
      {
        node: "供应商主数据审批",
        actor: "采购主管",
        result: "通过",
        opinion: "供应链资质通过，允许启用。",
        time: "2026-03-13 16:28:19",
      },
    ],
  },
  {
    code: "SUP20260322004",
    name: "北辰商贸结算服务有限公司",
    category: "结算服务供应商",
    lifecycleStatus: "停止合作",
    auditStatus: "已驳回",
    kingdeeStatus: "未推送",
    organization: "云川品牌供应链有限公司",
    socialCreditCode: "91110108MA00ABCD6Y",
    overseasCompany: "否",
    countryRegion: "中国",
    bankAccountName: "北辰商贸结算服务有限公司",
    bankAccountNo: "110104445566778899",
    bankName: "工商银行北京海淀支行",
    bankBranch: "中关村支行",
    contactName: "赵晨",
    contactPhone: "13700137007",
    contactEmail: "service@beichen-settlement.example.com",
    contactTitle: "结算专员",
    paymentTerm: "预付30%",
    currency: "人民币",
    invoiceType: "增值税电子普通发票",
    taxRate: "0.06",
    taxpayerType: "小规模纳税人",
    shippingAddress: {
      contact: "赵晨",
      phone: "13700137007",
      email: "service@beichen-settlement.example.com",
      country: "中国",
      state: "北京市",
      city: "北京市",
      district: "海淀区",
      town: "学院路街道",
      detail: "知春路56号物流服务中心",
      postalCode: "100080",
    },
    returnAddress: {
      contact: "赵晨",
      phone: "13700137007",
      email: "service@beichen-settlement.example.com",
      country: "中国",
      state: "北京市",
      city: "北京市",
      district: "海淀区",
      town: "学院路街道",
      detail: "知春路56号物流服务中心",
      postalCode: "100080",
    },
    createdBy: "陈力",
    createdAt: "2026-03-10 13:18:12",
    updatedBy: "陈力",
    updatedAt: "2026-03-20 18:10:23",
    reviewedBy: "采购主管",
    reviewedAt: "2026-03-11 09:26:44",
    activePurchaseOrders: 0,
    riskLevel: "中",
    note: "合同已到期且驳回补充资质，当前仅供历史单据查看。",
    operationLogs: [
      { time: "2026-03-10 13:18:12", actor: "陈力", action: "新建供应商资料", result: "成功" },
      { time: "2026-03-11 09:26:44", actor: "采购主管", action: "审核驳回", result: "成功", remark: "需补充最新开户许可证" },
      { time: "2026-03-20 18:10:23", actor: "陈力", action: "停止合作", result: "成功", remark: "合同到期未续签" },
    ],
    changeLogs: [
      {
        time: "2026-03-20 18:10:23",
        actor: "陈力",
        field: "供应商生命周期状态",
        before: "合同到期",
        after: "停止合作",
      },
    ],
    approvalLogs: [
      {
        node: "供应商主数据审批",
        actor: "采购主管",
        result: "驳回",
        opinion: "开户许可证已过期，请补充后重新提交。",
        time: "2026-03-11 09:26:44",
      },
    ],
  },
];

export const supplierExportFields = [
  "供应商编码",
  "供应商名称",
  "供应商分类",
  "供应商生命周期状态",
  "审核状态",
  "推送金蝶状态",
  "签约采购组织",
  "是否境外公司",
  "国家/地区",
  "联系人",
  "联系电话",
  "付款条件",
  "结算币别",
];

export const supplierImportFailures = [
  {
    rowNo: "12",
    field: "默认税率",
    value: "13",
    reason: "默认税率应传0到1之间的小数，例如0.13。",
  },
  {
    rowNo: "19",
    field: "统一社会信用代码",
    value: "91310ABC",
    reason: "统一社会信用代码长度不合法。",
  },
  {
    rowNo: "27",
    field: "签约采购组织",
    value: "晨屿测试采购有限公司",
    reason: "当前用户无晨屿测试采购有限公司的供应商主数据维护权限。",
  },
];
