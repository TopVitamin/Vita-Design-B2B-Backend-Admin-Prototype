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
    description: "默认白底、32px控件、40px工作台Tab和紧凑留白，服务ERP/WMS一类信息密集后台。",
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
    description: "顶部Tab默认40px，保持后台精致密度而不是浏览器式大页签。",
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
    token: "自定义下拉触发器 + 选项面板",
    description: "后台原型默认不直接依赖浏览器原生下拉面板，避免箭头贴边和菜单缩进漂移。",
  },
  {
    label: "占位文案基线",
    token: "input / textarea = 请输入；select / date / time = 请选择",
    description: "业务表单、查询区、表格内嵌编辑控件统一使用简洁默认placeholder，不留空白占位。",
  },
];

export const designSystemDataRules: DesignSystemRule[] = [
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
