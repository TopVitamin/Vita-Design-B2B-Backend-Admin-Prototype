export type MessageFeedTab = "message" | "notice" | "todo";

export type MessageCategoryId =
  | "all"
  | "operation"
  | "document-approval"
  | "replenishment"
  | "supply-chain"
  | "system";

export type MessageActionTarget =
  | "purchase-detail"
  | "purchase-list"
  | "supplier-list"
  | "inventory-flow-query";

export type MessageRecord = {
  id: string;
  sender: string;
  avatarLabel: string;
  avatarBackground: string;
  feedTab: MessageFeedTab;
  category: Exclude<MessageCategoryId, "all">;
  title: string;
  summary: string;
  previewTime: string;
  time: string;
  messageType: string;
  unread: boolean;
  relatedDocumentNo?: string;
  actionLabel?: string;
  actionTarget?: MessageActionTarget;
  detailSections: Array<{ label: string; value: string }>;
  detailBlocks: Array<{ title: string; content: string }>;
};

export const messageCenterCategories: Array<{
  id: MessageCategoryId;
  label: string;
}> = [
  { id: "all", label: "全部消息" },
  { id: "operation", label: "运营消息" },
  { id: "document-approval", label: "单据审批" },
  { id: "replenishment", label: "补货建议" },
  { id: "supply-chain", label: "供应链消息" },
  { id: "system", label: "系统消息" },
];

export const messageFeedTabs: Array<{
  id: MessageFeedTab;
  label: string;
}> = [
  { id: "message", label: "消息" },
  { id: "notice", label: "通知" },
  { id: "todo", label: "待办" },
];

export const initialMessageRecords: MessageRecord[] = [
  {
    id: "msg-001",
    sender: "郑曦月",
    avatarLabel: "郑",
    avatarBackground: "#D9C85D",
    feedTab: "message",
    category: "document-approval",
    title: "郑曦月的私信",
    summary: "采购计划PP260318001已提交审批，请尽快查收并处理。",
    previewTime: "今天 12:30:01",
    time: "2026-03-23 12:30:01",
    messageType: "采购计划",
    unread: true,
    relatedDocumentNo: "PP260318001",
    actionLabel: "查看采购计划",
    actionTarget: "purchase-detail",
    detailSections: [
      { label: "消息类型", value: "单据审批" },
      { label: "关联单据", value: "PP260318001" },
      { label: "发送人", value: "郑曦月" },
      { label: "接收时间", value: "2026-03-23 12:30:01" },
    ],
    detailBlocks: [
      {
        title: "消息内容",
        content: "采购计划PP260318001已由业务负责人提交审批，当前待你确认采购策略、数量和到货节奏。",
      },
      {
        title: "处理建议",
        content: "建议优先核对门店需求汇总、供应商库存和交期风险，再进入单据详情继续审批。",
      },
    ],
  },
  {
    id: "msg-002",
    sender: "宁波",
    avatarLabel: "宁",
    avatarBackground: "#FFB46F",
    feedTab: "message",
    category: "system",
    title: "宁波的私信",
    summary: "列设置的固定列能力已经优化，如有异常请先刷新页面再试。",
    previewTime: "今天 11:08:14",
    time: "2026-03-23 11:08:14",
    messageType: "系统消息",
    unread: true,
    actionLabel: "查看库存流水",
    actionTarget: "inventory-flow-query",
    detailSections: [
      { label: "消息类型", value: "系统消息" },
      { label: "来源模块", value: "列表能力升级" },
      { label: "发送人", value: "宁波" },
      { label: "接收时间", value: "2026-03-23 11:08:14" },
    ],
    detailBlocks: [
      {
        title: "消息内容",
        content: "列设置中的固定列和拖拽排序能力已完成优化，若你在采购或库存列表页看到旧缓存，请刷新页面重新进入。",
      },
      {
        title: "影响范围",
        content: "本次更新覆盖采购订单列表、库存流水查询、供应商主数据和客户主数据列表。",
      },
    ],
  },
  {
    id: "msg-003",
    sender: "宁静",
    avatarLabel: "静",
    avatarBackground: "#A8B7F3",
    feedTab: "message",
    category: "operation",
    title: "宁静的私信",
    summary: "今日门店动销日报已生成，可直接进入消息中心查看关键异常项。",
    previewTime: "今天 09:42:33",
    time: "2026-03-23 09:42:33",
    messageType: "运营消息",
    unread: true,
    actionLabel: "查看采购列表",
    actionTarget: "purchase-list",
    detailSections: [
      { label: "消息类型", value: "运营消息" },
      { label: "来源模块", value: "门店运营日报" },
      { label: "发送人", value: "宁静" },
      { label: "接收时间", value: "2026-03-23 09:42:33" },
    ],
    detailBlocks: [
      {
        title: "消息内容",
        content: "今日门店动销日报已生成，Top20异常SKU和门店缺货风险已整理完毕，请及时查看并补充采购动作。",
      },
      {
        title: "处理建议",
        content: "可优先关注高动销SKU、补货建议和采购计划的时间差，避免门店端继续积压缺货单。",
      },
    ],
  },
  {
    id: "msg-004",
    sender: "供应链协同",
    avatarLabel: "供",
    avatarBackground: "#7FD0C3",
    feedTab: "notice",
    category: "supply-chain",
    title: "供应商送货异常提醒",
    summary: "供应商深汕设备在途送货延迟4小时，请重新评估入库时间窗。",
    previewTime: "今天 08:15:09",
    time: "2026-03-23 08:15:09",
    messageType: "供应链消息",
    unread: true,
    actionLabel: "查看供应商列表",
    actionTarget: "supplier-list",
    detailSections: [
      { label: "消息类型", value: "供应链消息" },
      { label: "供应商", value: "深汕设备备件供应商" },
      { label: "影响仓库", value: "深圳设备仓" },
      { label: "接收时间", value: "2026-03-23 08:15:09" },
    ],
    detailBlocks: [
      {
        title: "消息内容",
        content: "供应商反馈车辆晚点，到仓时间预计较计划延后4小时，可能影响今日入库排班和后续上架节奏。",
      },
      {
        title: "处理建议",
        content: "建议同步仓库作业人员调整时段，并确认是否需要对关联采购单和入库通知单重新排期。",
      },
    ],
  },
  {
    id: "msg-005",
    sender: "补货建议引擎",
    avatarLabel: "补",
    avatarBackground: "#97C97B",
    feedTab: "notice",
    category: "replenishment",
    title: "华东补货建议已更新",
    summary: "SKU69100062在上海生鲜仓的可用库存低于安全线，建议今日补货100件。",
    previewTime: "今天 07:40:26",
    time: "2026-03-23 07:40:26",
    messageType: "补货建议",
    unread: false,
    actionLabel: "查看采购列表",
    actionTarget: "purchase-list",
    detailSections: [
      { label: "消息类型", value: "补货建议" },
      { label: "SKU", value: "69100062" },
      { label: "仓库", value: "上海生鲜仓" },
      { label: "接收时间", value: "2026-03-23 07:40:26" },
    ],
    detailBlocks: [
      {
        title: "消息内容",
        content: "补货建议引擎监测到SKU69100062的可用库存跌破安全库存，结合未来三日动销预测，建议补货100件。",
      },
      {
        title: "处理建议",
        content: "可结合供应商交期、门店分仓需求和在途数量，决定是否直接生成采购计划或先发起询价。",
      },
    ],
  },
  {
    id: "msg-006",
    sender: "审批中心",
    avatarLabel: "审",
    avatarBackground: "#8CB4FF",
    feedTab: "todo",
    category: "document-approval",
    title: "采购单PO260203003待审批",
    summary: "Ralo提交的采购单PO260203003待审批，请在17:00前完成审批处理。",
    previewTime: "2026-03-22 18:01:58",
    time: "2026-03-22 18:01:58",
    messageType: "采购单",
    unread: true,
    relatedDocumentNo: "PO260203003",
    actionLabel: "查看采购订单",
    actionTarget: "purchase-detail",
    detailSections: [
      { label: "消息类型", value: "单据审批" },
      { label: "关联单据", value: "PO260203003" },
      { label: "提交人", value: "Ralo" },
      { label: "接收时间", value: "2026-03-22 18:01:58" },
    ],
    detailBlocks: [
      {
        title: "消息内容",
        content: "采购单PO260203003已提交审批，涉及默认仓库到货和门店直送两种履约方式，需要你确认业务类型和金额边界。",
      },
      {
        title: "处理建议",
        content: "建议优先检查供应商状态、税率和金额汇总，再决定是否通过审批并推进下游入库。",
      },
    ],
  },
  {
    id: "msg-007",
    sender: "审批中心",
    avatarLabel: "审",
    avatarBackground: "#8CB4FF",
    feedTab: "todo",
    category: "document-approval",
    title: "采购计划PP260203002待审批",
    summary: "Ralo提交的采购计划PP260203002待审批，计划采购量与历史均值偏差较大。",
    previewTime: "2026-03-22 18:00:34",
    time: "2026-03-22 18:00:34",
    messageType: "采购计划",
    unread: true,
    relatedDocumentNo: "PP260203002",
    actionLabel: "查看采购计划",
    actionTarget: "purchase-detail",
    detailSections: [
      { label: "消息类型", value: "单据审批" },
      { label: "关联单据", value: "PP260203002" },
      { label: "提交人", value: "Ralo" },
      { label: "接收时间", value: "2026-03-22 18:00:34" },
    ],
    detailBlocks: [
      {
        title: "消息内容",
        content: "采购计划PP260203002待审批，本次计划量较近30天均值高出28%，建议重点核对补货理由和目标门店。",
      },
      {
        title: "处理建议",
        content: "若门店促销或活动因素属实，可继续放行；否则建议退回调整计划采购量。",
      },
    ],
  },
  {
    id: "msg-008",
    sender: "系统通知",
    avatarLabel: "系",
    avatarBackground: "#A9AEB8",
    feedTab: "notice",
    category: "system",
    title: "消息中心能力已上线",
    summary: "你可以在消息中心统一查看审批、运营和系统消息，并支持侧边抽屉查看详情。",
    previewTime: "2026-03-22 09:16:00",
    time: "2026-03-22 09:16:00",
    messageType: "系统消息",
    unread: false,
    detailSections: [
      { label: "消息类型", value: "系统消息" },
      { label: "来源模块", value: "工作台更新" },
      { label: "发送人", value: "系统通知" },
      { label: "接收时间", value: "2026-03-22 09:16:00" },
    ],
    detailBlocks: [
      {
        title: "消息内容",
        content: "消息中心现已支持顶部铃铛预览、分类列表查看、批量标记已读和右侧抽屉详情。",
      },
      {
        title: "使用建议",
        content: "高频审批提醒建议从顶部铃铛快速处理，复杂消息再进入消息中心统一查看。",
      },
    ],
  },
  {
    id: "msg-009",
    sender: "供应链协同",
    avatarLabel: "链",
    avatarBackground: "#62C7D8",
    feedTab: "todo",
    category: "supply-chain",
    title: "供应商资质待复核",
    summary: "供应商SUP20260322003的合作状态已变更，请复核后决定是否继续下单。",
    previewTime: "2026-03-21 16:45:12",
    time: "2026-03-21 16:45:12",
    messageType: "供应链消息",
    unread: false,
    actionLabel: "查看供应商列表",
    actionTarget: "supplier-list",
    detailSections: [
      { label: "消息类型", value: "供应链消息" },
      { label: "供应商编码", value: "SUP20260322003" },
      { label: "来源模块", value: "供应商生命周期" },
      { label: "接收时间", value: "2026-03-21 16:45:12" },
    ],
    detailBlocks: [
      {
        title: "消息内容",
        content: "供应商SUP20260322003的合作状态发生变化，若继续下单需先完成资质复核并确认金蝶同步状态。",
      },
      {
        title: "处理建议",
        content: "建议先进入供应商主数据查看生命周期状态、审批记录和推送结果，再决定是否恢复合作。",
      },
    ],
  },
];
