export type DesignSystemSection = {
  id: string;
  label: string;
  description: string;
};

export type DesignSystemSwatch = {
  label: string;
  token: string;
  description?: string;
  kind?: "fill" | "text" | "border";
  borderToken?: string;
};

export type DesignSystemRule = {
  label: string;
  token: string;
  description: string;
  sample?: string;
  fontSizeToken?: string;
  fontWeightToken?: string;
  lineHeightToken?: string;
  preview?: "height" | "width" | "gap" | "inset";
  previewToken?: string;
};

export type DesignSystemTokenSample = {
  label: string;
  token: string;
  value: string;
  description: string;
};

export type DesignSystemFormatSample = {
  label: string;
  example: string;
  description: string;
};

export type DesignSystemTableRow = {
  orderNo: string;
  supplier: string;
  amount: string;
  eta: string;
  status: "draft" | "pending" | "processing" | "success";
};

export const designSystemSections: DesignSystemSection[] = [
  { id: "overview", label: "总览", description: "视觉定位与版本入口" },
  { id: "colors", label: "颜色", description: "主色、中性色与语义色" },
  { id: "typography", label: "字体", description: "字号、字重与行高" },
  { id: "density", label: "密度", description: "间距、留白与尺寸基线" },
  { id: "surface", label: "圆角与阴影", description: "圆角、阴影与卡片容器" },
  { id: "controls", label: "控件", description: "按钮、表单与Tag" },
  { id: "data", label: "数据与表格", description: "表格承载与数据格式" },
  { id: "shell", label: "壳层", description: "侧栏、Tab、分页与Modal" },
  { id: "feedback", label: "反馈", description: "顶部轻量Alert、Banner、空状态与错误提示" },
];

export const designSystemPrinciples = [
  {
    title: "稳定一致",
    description: "所有展示统一映射到ui-foundation.css和tailwind-preset.ts，不再维护第二套视觉真相源。",
  },
  {
    title: "高密度后台",
    description: "默认白底、32px控件、48px工作台Tab和紧凑留白，服务ERP/WMS一类信息密集后台。",
  },
  {
    title: "可移植基线",
    description: "Design System只展示跨项目仍成立的视觉与控件基线，不绑定采购订单业务事实。",
  },
];

export const designSystemColorGroups = [
  {
    title: "主色与交互色",
    description: "主操作、激活态和关键跳转统一使用蓝色系，不铺大面积品牌底。",
    swatches: [
      { label: "Primary", token: "--primary" },
      { label: "Primary Hover", token: "--primary-hover" },
      { label: "Primary Active", token: "--primary-active" },
      { label: "Primary Subtle", token: "--primary-subtle" },
      { label: "Link", token: "--link" },
    ] as DesignSystemSwatch[],
  },
  {
    title: "中性色与文字",
    description: "页面、容器、边框和文字最多4层层级，保证信息密度高但不拥挤。",
    swatches: [
      { label: "Page", token: "--bg-page", borderToken: "--border-default" },
      { label: "Container", token: "--bg-container", borderToken: "--border-default" },
      { label: "Subtle", token: "--bg-subtle", borderToken: "--border-default" },
      { label: "Border", token: "--border-default", kind: "border" },
      { label: "Border Strong", token: "--border-strong", kind: "border" },
      { label: "Text Primary", token: "--text-primary", kind: "text", borderToken: "--border-default" },
      { label: "Text Secondary", token: "--text-secondary", kind: "text", borderToken: "--border-default" },
      { label: "Text Muted", token: "--text-muted", kind: "text", borderToken: "--border-default" },
    ] as DesignSystemSwatch[],
  },
  {
    title: "语义反馈色",
    description: "Success、Warning、Error、Info只承载语义，不承担品牌表达。",
    swatches: [
      { label: "Success", token: "--success" },
      { label: "Success Subtle", token: "--success-subtle" },
      { label: "Warning", token: "--warning" },
      { label: "Warning Subtle", token: "--warning-subtle" },
      { label: "Danger", token: "--danger" },
      { label: "Danger Subtle", token: "--danger-subtle" },
      { label: "Info", token: "--info" },
      { label: "Info Subtle", token: "--info-subtle" },
    ] as DesignSystemSwatch[],
  },
];

export const designSystemColorRules: DesignSystemRule[] = [
  {
    label: "主色使用边界",
    token: "--primary / --primary-hover / --primary-active",
    description: "主色只用于主操作、激活态和关键链接，不把品牌色铺成大面积背景。",
  },
  {
    label: "中性色层级",
    token: "--bg-page / --bg-container / --bg-subtle",
    description: "页面背景、容器背景和轻辅助背景最多3层，避免层级混乱。",
  },
  {
    label: "语义色职责",
    token: "--success / --warning / --danger / --info",
    description: "语义色只表达状态含义，不能替代业务分类颜色体系。",
  },
];

export const designSystemTypographyRules: DesignSystemRule[] = [
  {
    label: "Page Title",
    token: "--font-size-page-title / --font-weight-page-title",
    description: "页面级标题只用于页面入口和主标题，不向下扩散到卡片内部。",
    sample: "Design System 总览",
    fontSizeToken: "--font-size-page-title",
    fontWeightToken: "--font-weight-page-title",
    lineHeightToken: "--line-height-tight",
  },
  {
    label: "Section Title",
    token: "--font-size-section-title / --font-weight-section-title",
    description: "区块标题用于卡片和分组标题，比页面标题低一层。",
    sample: "区块标题",
    fontSizeToken: "--font-size-section-title",
    fontWeightToken: "--font-weight-section-title",
    lineHeightToken: "--line-height-tight",
  },
  {
    label: "Body",
    token: "--font-size-body / --font-weight-body",
    description: "正文是后台信息承载主层，默认保持清晰、不过度强调。",
    sample: "正文信息用于描述字段、说明文案和一般操作文案。",
    fontSizeToken: "--font-size-body",
    fontWeightToken: "--font-weight-body",
    lineHeightToken: "--line-height-normal",
  },
  {
    label: "Small",
    token: "--font-size-small / --font-weight-body",
    description: "辅助说明、Label和次级提示使用小字号，但仍保持可读。",
    sample: "辅助说明、Label与弱提示。",
    fontSizeToken: "--font-size-small",
    fontWeightToken: "--font-weight-body",
    lineHeightToken: "--line-height-normal",
  },
];

export const designSystemTypographyMeta: DesignSystemRule[] = [
  {
    label: "默认字重",
    token: "--font-weight-body / --font-weight-page-title",
    description: "顶部Tab和常规按钮默认常规字重，不依赖加粗制造层级。",
  },
  {
    label: "行高别名",
    token: "leading-ui-tight / leading-ui-normal / leading-ui-relaxed",
    description: "标题、正文和说明文案统一走语义化行高，不暴露不可预测的别名。",
  },
];

export const designSystemDensityRules: DesignSystemRule[] = [
  {
    label: "页面留白",
    token: "--padding-page-x / --padding-page-y",
    description: "页面默认左右24px、上下24px，形成统一的外层留白边界。",
    preview: "inset",
    previewToken: "--padding-page-x",
  },
  {
    label: "卡片内边距",
    token: "--padding-section",
    description: "区块与卡片默认16px内边距，局部紧凑版使用tight变体。",
    preview: "inset",
    previewToken: "--padding-section",
  },
  {
    label: "控件高度",
    token: "--input-height-md / --button-height-md",
    description: "默认按钮和输入控件统一使用32px高度。",
    preview: "height",
    previewToken: "--input-height-md",
  },
  {
    label: "工作台Tab高度",
    token: "--tabs-height",
    description: "顶部Tab默认48px，保持后台精致密度而不是浏览器式大页签。",
    preview: "height",
    previewToken: "--tabs-height",
  },
  {
    label: "侧栏宽度",
    token: "--layout-sidebar-width / --layout-sidebar-collapsed-width",
    description: "展开态220px，收起后保留图标态72px。",
    preview: "width",
    previewToken: "--layout-sidebar-width",
  },
  {
    label: "Label间距",
    token: "--field-label-gap",
    description: "Label与控件上下间距默认6px，不拉大表单节奏。",
    preview: "gap",
    previewToken: "--field-label-gap",
  },
  {
    label: "查询区节奏",
    token: "query-section-grid / query-section-actions",
    description: "查询区优先控制为横向16px、纵向12px的节奏，按钮区和筛选控件区分层但不拉开过大间距。",
  },
  {
    label: "工具条密度",
    token: "table-toolbar / list-toolbar-group",
    description: "列表工具条优先保持48px到52px的紧凑密度，左侧批量操作和右侧弱操作之间留出清晰但克制的分组距离。",
  },
];

export const designSystemSurfaceRules: DesignSystemRule[] = [
  {
    label: "圆角递进",
    token: "--radius-xs / --radius-sm / --radius-md / --radius-lg / --radius-xl",
    description: "圆角只在4px到12px之间递进，后台默认不使用夸张的大圆角。",
  },
  {
    label: "主卡片圆角",
    token: "--radius-md",
    description: "筛选区、表格容器、详情卡片默认8px圆角，不混用多种大圆角。",
  },
  {
    label: "阴影层级",
    token: "--shadow-xs / --shadow-sm / --shadow-md",
    description: "普通卡片优先用xs或sm，浮层和更高层容器再升到md，不叠加多层阴影。",
  },
  {
    label: "卡片容器",
    token: "page-section / page-section-tight",
    description: "后台容器以白底、边框、轻阴影为主，靠结构和密度而不是装饰表达层级。",
  },
];

export const designSystemControlRules: DesignSystemRule[] = [
  {
    label: "基础控件族",
    token: "input / textarea / checkbox / radio group / switch",
    description: "表单基础控件优先复用共享组件，不再在业务页里长期直接拼原生标签和散落class。",
  },
  {
    label: "按钮层级",
    token: "primary / secondary / ghost / danger",
    description: "一个页面默认只保留一个最突出主操作，其他按钮回到次级层级。",
  },
  {
    label: "表单控件焦点态",
    token: "--border-focus / --primary-subtle",
    description: "Input、Select等控件必须显式定义focus态，不能只有默认边框。",
  },
  {
    label: "Select实现",
    token: "自定义下拉触发器 + 选项面板 + 自动翻转",
    description: "后台原型默认不直接依赖浏览器原生下拉面板；触发器和选项统一单行截断，靠近底边时自动向上展开，避免裁切和页面抖动。",
  },
  {
    label: "占位文案基线",
    token: "input / textarea = 请输入；select / date / time = 请选择",
    description: "业务表单、查询区、表格内嵌编辑控件统一使用简洁默认placeholder，不留空白占位。",
  },
  {
    label: "切换器分层",
    token: "workspace tab / status tab / content tab / segmented control / chip",
    description: "切换器必须先按语义分层，再决定样式，不允许所有地方只用一种Tab或胶囊切换。",
  },
  {
    label: "分段控件口径",
    token: "capsule active item / transparent outer shell / 32px height",
    description: "分段控件允许胶囊激活项，但外层不再套灰底边框壳，并优先与32px输入框和按钮保持同高。",
  },
  {
    label: "筛选Chip",
    token: "filter chip / single-select | multi-select",
    description: "轻量快速筛选优先使用FilterChip，视觉上比Tab更轻，不承担主导航职责。",
  },
  {
    label: "日期区间控件",
    token: "trigger + popover + date inputs + presets",
    description: "DateRangePicker默认采用触发器 + 轻量弹层 + 原生日期输入，不依赖第三方日期库。",
  },
  {
    label: "附件与上传",
    token: "attachment panel / upload trigger / list / retry",
    description: "附件能力默认抽成统一组件，编辑态和详情态共用，不再用文本字段冒充附件。",
  },
  {
    label: "基础控件族",
    token: "input / textarea / checkbox / radio group / switch",
    description: "表单控件优先复用共享基础组件，统一placeholder、禁用态、错误态和交互密度，不再每页各写一套原生标签样式。",
  },
  {
    label: "Select交互口径",
    token: "single-line truncate / smart placement / portal overlay",
    description: "Select触发器和选项统一单行截断；靠近视口边缘时自动翻转，并脱离父容器裁切，避免下拉被挡住或打开时页面抖动。",
  },
  {
    label: "筛选Chip",
    token: "filter chip / light filter",
    description: "FilterChip用于轻量快速过滤，不冒充Tab，不做厚重胶囊，支持单选或多选条件收口。",
  },
];

export const designSystemDataRules: DesignSystemRule[] = [
  {
    label: "列表页骨架",
    token: "page header / list-page-main-card / table-toolbar / pagination",
    description: "列表页优先复用共享页头、主卡片和工具条骨架，业务差异留在工具条内容、统计区和表格列定义里。",
  },
  {
    label: "表格承载",
    token: "table / list-page-main-card",
    description: "列表和明细数据优先用表格承载，外层放在主卡片容器里，不拆成营销式卡片流。",
  },
  {
    label: "表格基线",
    token: "--table-header-height / --table-row-height-default / --table-cell-padding-x",
    description: "表头40px、默认行高40px、单元格左右12px，保持高密度但可读。",
  },
  {
    label: "数据格式",
    token: "金额: 2位小数 / 时间: YYYY-MM-DD HH:mm:ss",
    description: "金额和时间展示优先保持统一口径，避免同系统里每个页面各写一套格式。",
  },
  {
    label: "列设置",
    token: "显示隐藏 / 顺序调整 / 固定列 / 用户自动记忆",
    description: "字段多、岗位差异大的列表页默认提供列设置，按用户自动记忆当前页面配置，不把模板管理作为基线能力。",
  },
  {
    label: "查询报表页工具条",
    token: "query report toolbar / export / column-settings",
    description: "纯查询报表页默认不额外放无意义刷新，也不补一行装饰性的共X条记录；工具条右侧保留导出、列设置等弱次级操作即可。",
  },
  {
    label: "列表页骨架",
    token: "page header / list-page-main-card / table-toolbar / pagination",
    description: "列表页优先复用统一页头、主卡片和工具条骨架，把差异留给Tab、统计区、批量操作和表格列定义，不从零拼装外层结构。",
  },
  {
    label: "宽表格策略",
    token: "column width / fixed columns / truncate / tabular-nums",
    description: "宽表格必须按字段语义分配列宽，并优先评估固定列、长文本截断和数量/时间/单号的稳定对齐语法。",
  },
];

export const designSystemShellRules: DesignSystemRule[] = [
  {
    label: "首页Tab",
    token: "home tab / non-closable",
    description: "顶部首个页签默认是带Home图标的首页Tab，作为系统回退锚点。",
  },
  {
    label: "业务页签",
    token: "workspace tab / closable",
    description: "业务页签默认可关闭，关闭后应能从首页或左侧导航重新进入。",
  },
  {
    label: "侧栏组织",
    token: "3-level nav + divider",
    description: "业务菜单和Design System入口用分割线隔开，收起后保留图标态。",
  },
  {
    label: "分页与Modal",
    token: "compact pagination / icon close",
    description: "分页保持精简，Modal右上角关闭使用线性icon，不用文字按钮。",
  },
  {
    label: "导入弹窗骨架",
    token: "template card / upload dropzone / import loading / import result",
    description: "导入弹窗的选择阶段、加载阶段和结果阶段优先复用共享骨架，不再让采购、客户、供应商各自维护一套结构。",
  },
  {
    label: "分段控件",
    token: "segmented control / capsule active item",
    description: "模式切换和轻过滤切换允许使用胶囊分段，但外层容器不做厚重灰底边框壳；系统级工具条行高优先保持紧凑。",
  },
  {
    label: "查看态抽屉",
    token: "drawer / fixed overlay / full-screen mask",
    description: "查看态详情默认使用共享Drawer，遮罩覆盖整个视口，不通过分栏挤压主体内容。",
  },
  {
    label: "样例调试面板",
    token: "floating demo toolbar / draggable",
    description: "演示控件必须和业务按钮分离，默认以弱化悬浮面板提供，并支持鼠标拖动，避免遮挡宽表格和详情内容。",
  },
  {
    label: "导入弹窗骨架",
    token: "import dialog / template card / upload dropzone / result scaffold",
    description: "导入弹窗优先复用选择阶段、加载阶段和结果阶段骨架；业务页只保留文案、统计值和失败明细数据，不再各自搭一套容器结构。",
  },
];

export const designSystemFeedbackRules: DesignSystemRule[] = [
  {
    label: "顶部轻量Alert",
    token: "floating-alert / success | info | warning | error",
    description: "用于轻量反馈和暂未开放功能提示，默认顶部居中出现，约2秒自动消失，不打断当前页面流程。",
  },
  {
    label: "Banner",
    token: "--warning-subtle / --danger-subtle",
    description: "Banner用于全局或分区级提醒，不承担页面主结构职责。",
  },
  {
    label: "空状态",
    token: "text-muted / subtle background",
    description: "空状态使用简洁说明和轻量图标，不做营销化插画大卡片。",
  },
  {
    label: "错误提示",
    token: "--danger / --border-danger",
    description: "错误信息优先就近出现，和对应控件或区域形成明确关联。",
  },
  {
    label: "导入结果卡",
    token: "import result metrics / tabular-nums / aligned cards",
    description: "导入结果区的统计卡优先使用等宽数字、统一字号层级和同高卡片，先强调数量，再承载标签说明。",
  },
  {
    label: "异常页组件",
    token: "exception-state / 403 | 404 | session-expired | system-maintenance",
    description: "系统状态页和页内异常态优先复用统一ExceptionState组件，而不是各写一套版式。",
  },
  {
    label: "时间线",
    token: "timeline / operation log / change log",
    description: "操作日志和变更轨迹优先使用Timeline承载，审批流图后续再独立补充。",
  },
];

export const designSystemRadiusSamples: DesignSystemTokenSample[] = [
  { label: "XS", token: "--radius-xs", value: "4px", description: "最小内嵌元素和轻量容器" },
  { label: "SM", token: "--radius-sm", value: "6px", description: "次级小控件和弱分组" },
  { label: "MD", token: "--radius-md", value: "8px", description: "主卡片、筛选区和表格容器" },
  { label: "LG", token: "--radius-lg", value: "10px", description: "悬浮调试面板和弱强调容器" },
  { label: "XL", token: "--radius-xl", value: "12px", description: "需要更柔和边界的浮层容器" },
];

export const designSystemShadowSamples: DesignSystemTokenSample[] = [
  { label: "Shadow XS", token: "--shadow-xs", value: "0 1px 2px", description: "普通卡片和弱悬浮态" },
  { label: "Shadow SM", token: "--shadow-sm", value: "0 2px 8px", description: "主卡片与轻浮层" },
  { label: "Shadow MD", token: "--shadow-md", value: "0 8px 24px", description: "Modal与更高层容器" },
];

export const designSystemFormatSamples: DesignSystemFormatSample[] = [
  { label: "单据编号", example: "PO202603220001", description: "业务编号保持连续、可扫描，不插入多余空格。" },
  { label: "金额", example: "128,000.00", description: "金额默认2位小数，适合直接出现在列表和详情页。" },
  { label: "日期", example: "2026-03-22", description: "短日期适合列表表格，减少时间信息对列宽的挤压。" },
  { label: "时间", example: "2026-03-22 10:32:11", description: "完整时间默认使用统一时间戳格式展示。" },
  { label: "数量", example: "360", description: "整数数量不展示无意义小数，保持读取效率。" },
  { label: "比率示例", example: "96.5%", description: "比例类数据可直接展示百分号，避免额外单位解释。" },
];

export const designSystemTableRows: DesignSystemTableRow[] = [
  { orderNo: "PO202603220001", supplier: "华东供应商A", amount: "128,000.00", eta: "2026-03-24", status: "pending" },
  { orderNo: "PO202603220018", supplier: "维他命物料中心", amount: "86,500.00", eta: "2026-03-25", status: "processing" },
  { orderNo: "PO202603220031", supplier: "区域采购服务商", amount: "42,300.00", eta: "2026-03-27", status: "success" },
];
