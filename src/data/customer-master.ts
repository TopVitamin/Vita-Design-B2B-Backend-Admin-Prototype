export type CustomerAddress = {
  contact: string;
  phone: string;
  email: string;
  countryCode: string;
  state: string;
  city: string;
  district: string;
  town: string;
  detail: string;
  postalCode: string;
};

export type CustomerOperationLog = {
  time: string;
  actor: string;
  action: string;
  result: string;
  remark?: string;
};

export type CustomerChangeLog = {
  time: string;
  actor: string;
  field: string;
  before: string;
  after: string;
};

export type CustomerApprovalLog = {
  node: string;
  actor: string;
  result: string;
  opinion: string;
  time: string;
};

export type CustomerRecord = {
  code: string;
  name: string;
  group: string;
  type: string;
  parentGroup: string;
  status: "待提交" | "待审核" | "已审核" | "已驳回";
  kingdeeStatus: "未推送" | "推送中" | "推送成功" | "推送失败";
  currency: string;
  socialCreditCode: string;
  note: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  address: CustomerAddress;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  reviewedBy: string;
  reviewedAt: string;
  operationLogs: CustomerOperationLog[];
  changeLogs: CustomerChangeLog[];
  approvalLogs: CustomerApprovalLog[];
};

const shanghaiRetailAddress: CustomerAddress = {
  contact: "林若岚",
  phone: "13600136001",
  email: "store@qingyu-retail.example.com",
  countryCode: "CN",
  state: "上海市",
  city: "上海市",
  district: "静安区",
  town: "南京西路街道",
  detail: "铜仁路58号静安零售中心8层",
  postalCode: "200041",
};

export const customerRecords: CustomerRecord[] = [
  {
    code: "CUS20260322001",
    name: "晴屿零售发展有限公司",
    group: "连锁零售客户",
    type: "直营网点客户",
    parentGroup: "星晖商业集团有限公司",
    status: "已审核",
    kingdeeStatus: "推送成功",
    currency: "人民币",
    socialCreditCode: "91310106MA1J5N8L2Q",
    note: "华东区域直营网点结算主体，已完成金蝶客户分组与结算币别映射。",
    contactName: "林若岚",
    contactPhone: "13600136001",
    contactEmail: "finance@qingyu-retail.example.com",
    address: shanghaiRetailAddress,
    createdBy: "陈思宇",
    createdAt: "2026-03-17 09:18:24",
    updatedBy: "陈思宇",
    updatedAt: "2026-03-22 10:36:18",
    reviewedBy: "销售平台主管",
    reviewedAt: "2026-03-18 15:12:09",
    operationLogs: [
      { time: "2026-03-17 09:18:24", actor: "陈思宇", action: "新建客户资料", result: "成功" },
      { time: "2026-03-17 18:03:11", actor: "陈思宇", action: "提交审核", result: "成功" },
      { time: "2026-03-18 15:12:09", actor: "销售平台主管", action: "审核通过", result: "成功", remark: "主体资料完整，可启用结算" },
      { time: "2026-03-18 15:40:55", actor: "系统", action: "推送金蝶", result: "成功" },
    ],
    changeLogs: [
      {
        time: "2026-03-22 10:36:18",
        actor: "陈思宇",
        field: "备注",
        before: "华东区域直营网点结算主体",
        after: "华东区域直营网点结算主体，已完成金蝶客户分组与结算币别映射。",
      },
    ],
    approvalLogs: [
      {
        node: "客户主数据审批",
        actor: "销售平台主管",
        result: "通过",
        opinion: "客户主体、联系人与币别信息完整，可推送金蝶。",
        time: "2026-03-18 15:12:09",
      },
    ],
  },
  {
    code: "CUS20260322002",
    name: "澜序电商运营有限公司",
    group: "电商渠道客户",
    type: "平台旗舰店客户",
    parentGroup: "云汐零售控股有限公司",
    status: "待审核",
    kingdeeStatus: "未推送",
    currency: "人民币",
    socialCreditCode: "91440101MA5X7C9R4P",
    note: "新接入平台直营网店主体，待审核后同步至金蝶客户档案。",
    contactName: "许芷宁",
    contactPhone: "13700137012",
    contactEmail: "ops@lanxu-ecom.example.com",
    address: {
      contact: "许芷宁",
      phone: "13700137012",
      email: "ops@lanxu-ecom.example.com",
      countryCode: "CN",
      state: "广东省",
      city: "广州市",
      district: "天河区",
      town: "猎德街道",
      detail: "珠江新城华夏路28号营销中心16层",
      postalCode: "510623",
    },
    createdBy: "苏宁",
    createdAt: "2026-03-21 11:04:47",
    updatedBy: "苏宁",
    updatedAt: "2026-03-21 14:26:03",
    reviewedBy: "-",
    reviewedAt: "-",
    operationLogs: [
      { time: "2026-03-21 11:04:47", actor: "苏宁", action: "新建客户资料", result: "成功" },
      { time: "2026-03-21 14:26:03", actor: "苏宁", action: "提交审核", result: "成功" },
    ],
    changeLogs: [
      {
        time: "2026-03-21 13:48:19",
        actor: "苏宁",
        field: "客户类型",
        before: "电商直营客户",
        after: "平台旗舰店客户",
      },
    ],
    approvalLogs: [
      {
        node: "客户主数据审批",
        actor: "待销售平台主管处理",
        result: "待审核",
        opinion: "等待审批",
        time: "-",
      },
    ],
  },
  {
    code: "CUS20260322003",
    name: "Virelia APAC Trading Limited",
    group: "跨境分销客户",
    type: "区域分销客户",
    parentGroup: "海岚国际消费品集团有限公司",
    status: "已审核",
    kingdeeStatus: "推送失败",
    currency: "美元",
    socialCreditCode: "91440300MA5J8E6H9M",
    note: "境外客户结算已审批通过，但金蝶映射缺少地区税码，需修正后重推。",
    contactName: "Ariel Wong",
    contactPhone: "+852-61234567",
    contactEmail: "apac@virelia-trading.example.com",
    address: {
      contact: "Ariel Wong",
      phone: "+852-61234567",
      email: "apac@virelia-trading.example.com",
      countryCode: "HK",
      state: "九龙",
      city: "香港",
      district: "观塘",
      town: "九龙湾",
      detail: "宏照道33号国际贸易中心12楼",
      postalCode: "999077",
    },
    createdBy: "周佳怡",
    createdAt: "2026-03-14 10:16:05",
    updatedBy: "周佳怡",
    updatedAt: "2026-03-22 09:24:10",
    reviewedBy: "销售平台主管",
    reviewedAt: "2026-03-15 16:08:52",
    operationLogs: [
      { time: "2026-03-15 16:08:52", actor: "销售平台主管", action: "审核通过", result: "成功" },
      { time: "2026-03-15 16:43:26", actor: "系统", action: "推送金蝶", result: "失败", remark: "缺少境外地区税码映射" },
      { time: "2026-03-22 09:24:10", actor: "周佳怡", action: "修改结算币别", result: "成功" },
    ],
    changeLogs: [
      {
        time: "2026-03-22 09:24:10",
        actor: "周佳怡",
        field: "结算币别",
        before: "港币",
        after: "美元",
      },
    ],
    approvalLogs: [
      {
        node: "客户主数据审批",
        actor: "销售平台主管",
        result: "通过",
        opinion: "跨境客户资料完整，允许建立金蝶客户档案。",
        time: "2026-03-15 16:08:52",
      },
    ],
  },
  {
    code: "CUS20260322004",
    name: "北辰团采服务有限公司",
    group: "集团关联客户",
    type: "集团结算主体",
    parentGroup: "澄曜品牌运营集团有限公司",
    status: "已驳回",
    kingdeeStatus: "未推送",
    currency: "人民币",
    socialCreditCode: "91110108MA00A9KQ3X",
    note: "统一社会信用代码与客户所属集团证明材料待补充，当前仅保留草稿记录。",
    contactName: "赵晨",
    contactPhone: "13800138026",
    contactEmail: "service@beichen-b2b.example.com",
    address: {
      contact: "赵晨",
      phone: "13800138026",
      email: "service@beichen-b2b.example.com",
      countryCode: "CN",
      state: "北京市",
      city: "北京市",
      district: "海淀区",
      town: "学院路街道",
      detail: "知春路68号集团服务中心5层",
      postalCode: "100086",
    },
    createdBy: "李晓雯",
    createdAt: "2026-03-12 13:30:18",
    updatedBy: "李晓雯",
    updatedAt: "2026-03-20 17:56:34",
    reviewedBy: "销售平台主管",
    reviewedAt: "2026-03-13 09:42:11",
    operationLogs: [
      { time: "2026-03-12 13:30:18", actor: "李晓雯", action: "新建客户资料", result: "成功" },
      { time: "2026-03-13 09:42:11", actor: "销售平台主管", action: "审核驳回", result: "成功", remark: "请补充集团归属证明和完整信用代码" },
      { time: "2026-03-20 17:56:34", actor: "李晓雯", action: "修改客户备注", result: "成功" },
    ],
    changeLogs: [
      {
        time: "2026-03-20 17:56:34",
        actor: "李晓雯",
        field: "备注",
        before: "统一社会信用代码待补充",
        after: "统一社会信用代码与客户所属集团证明材料待补充，当前仅保留草稿记录。",
      },
    ],
    approvalLogs: [
      {
        node: "客户主数据审批",
        actor: "销售平台主管",
        result: "驳回",
        opinion: "客户所属集团证明缺失，请补齐后重新提交。",
        time: "2026-03-13 09:42:11",
      },
    ],
  },
];

export const customerExportFields = [
  "客户编码",
  "客户名称",
  "客户分组",
  "客户类型",
  "客户所属集团",
  "状态",
  "推送金蝶状态",
  "结算币别",
  "联系人",
  "联系电话",
  "国家/地区二字码",
  "创建人",
  "创建时间",
];

export const customerImportFailures = [
  {
    rowNo: "08",
    field: "客户所属集团",
    value: "测试集团",
    reason: "客户所属集团未建立映射，不允许推送至金蝶。",
  },
  {
    rowNo: "16",
    field: "统一社会信用代码",
    value: "91310ABC",
    reason: "统一社会信用代码长度不合法，请按18位规则填写。",
  },
  {
    rowNo: "23",
    field: "结算币别",
    value: "欧元",
    reason: "当前业务组织未开通该币别结算配置。",
  },
];
