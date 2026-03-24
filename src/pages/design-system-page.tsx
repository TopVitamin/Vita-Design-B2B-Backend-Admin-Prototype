import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ClipboardList,
  House,
  Inbox,
  LayoutGrid,
  Minus,
  Palette,
  PanelLeft,
  Rows3,
  SwatchBook,
  X,
} from "lucide-react";
import { Banner } from "../components/ui/banner";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { DateRangePicker } from "../components/ui/date-range-picker";
import { DescriptionList } from "../components/ui/description-list";
import { Drawer } from "../components/ui/drawer";
import { ExceptionState } from "../components/ui/exception-state";
import { FilterChip } from "../components/ui/filter-chip";
import { FloatingAlert, type FloatingAlertInput } from "../components/ui/floating-alert";
import { Input } from "../components/ui/input";
import { AttachmentPanel } from "../components/ui/attachment-panel";
import { ListPageMainCard, ListPageToolbar } from "../components/ui/list-page-layout";
import { Pagination } from "../components/ui/pagination";
import { PageHeader } from "../components/ui/page-header";
import { SegmentedControl } from "../components/ui/segmented-control";
import { Select } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Tabs } from "../components/ui/tabs";
import { Timeline } from "../components/ui/timeline";
import { Textarea } from "../components/ui/textarea";
import { UploadDropzone } from "../components/ui/upload-dropzone";
import {
  type ColumnSettingsField,
  ColumnSettingsModal,
  usePersistedColumnSettings,
} from "../components/ui/column-settings";
import {
  designSystemColorGroups,
  designSystemColorRules,
  designSystemControlRules,
  designSystemDataRules,
  designSystemDensityRules,
  designSystemFeedbackRules,
  designSystemFormatSamples,
  designSystemPrinciples,
  designSystemRadiusSamples,
  designSystemSections,
  designSystemShellRules,
  designSystemShadowSamples,
  designSystemSurfaceRules,
  designSystemTableRows,
  designSystemTypographyMeta,
  designSystemTypographyRules,
  type DesignSystemFormatSample,
  type DesignSystemRule,
  type DesignSystemSwatch,
  type DesignSystemTableRow,
  type DesignSystemTokenSample,
} from "../data/design-system";

const principleIcons = [SwatchBook, LayoutGrid, Palette] as const;

const tagExamples = [
  { label: "草稿", tone: "draft" as const },
  { label: "待审核", tone: "pending" as const },
  { label: "进行中", tone: "processing" as const },
  { label: "已完成", tone: "success" as const },
  { label: "已关闭", tone: "closed" as const },
  { label: "异常", tone: "error" as const },
];

const statusOptions = [
  { label: "草稿", value: "draft" },
  { label: "进行中", value: "processing" },
  { label: "已完成", value: "success" },
];

const pageSizeOptions = [20, 50, 100];

const columnSettingsFields: ColumnSettingsField[] = [
  { id: "company", label: "公司", group: "基础信息", required: true, defaultFixed: true },
  { id: "employeeNo", label: "工号", group: "基础信息", required: true, defaultFixed: true },
  { id: "department", label: "部门", group: "基础信息", defaultFixed: true },
  { id: "name", label: "姓名", group: "基础信息" },
  { id: "mobile", label: "联系方式", group: "基础信息" },
  { id: "email", label: "邮箱", group: "基础信息" },
  { id: "role", label: "权限角色", group: "权限信息" },
  { id: "status", label: "状态", group: "权限信息" },
  { id: "enabled", label: "激活", group: "权限信息" },
  { id: "language", label: "语言", group: "扩展字段", defaultVisible: false },
  { id: "createdAt", label: "创建日期", group: "制单信息" },
  { id: "updatedAt", label: "最后更新日期", group: "制单信息", defaultVisible: false },
  { id: "createdBy", label: "创建人", group: "制单信息", defaultVisible: false },
  { id: "updatedBy", label: "最后更新人", group: "制单信息", defaultVisible: false },
];

export function DesignSystemPage() {
  const [activeSection, setActiveSection] = useState("colors");
  const [selectValue, setSelectValue] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [checked, setChecked] = useState(true);
  const [switchOn, setSwitchOn] = useState(true);
  const [feedbackAlert, setFeedbackAlert] = useState<FloatingAlertInput | null>(null);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "2026-03-01", end: "2026-03-24" });
  const {
    state: columnSettingsState,
    defaultState: columnSettingsDefaultState,
    applyState: applyColumnSettingsState,
  } = usePersistedColumnSettings({
    storageKey: "column-settings:demo-user:design-system",
    fields: columnSettingsFields,
    defaultDensity: "medium",
  });

  const visibleSections = useMemo(
    () => designSystemSections.filter((section) => section.id !== "overview"),
    [],
  );

  const sectionItems = useMemo(
    () => visibleSections.map((section) => ({ label: section.label, value: section.id })),
    [visibleSections],
  );

  const activeSectionMeta = useMemo(
    () => visibleSections.find((section) => section.id === activeSection),
    [activeSection, visibleSections],
  );

  useEffect(() => {
    if (!feedbackAlert) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setFeedbackAlert(null);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [feedbackAlert]);

  function showFeedbackAlert(notice: FloatingAlertInput) {
    setFeedbackAlert({
      ...notice,
    });
  }

  return (
    <div className="space-y-4">
      <section className="space-y-4">
        <div className="page-header">
          <div>
            <h1 className="page-title">Design System</h1>
            <div className="mt-2 text-small text-text-muted">
              维他命B端后台模板的视觉规范总览，只展示稳定可复用的UI基线和控件约束。
            </div>
          </div>
          <Badge tone="processing">V1.1</Badge>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {designSystemPrinciples.map((item, index) => {
            const Icon = principleIcons[index] ?? SwatchBook;
            return (
              <Card key={item.title}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary-subtle text-primary">
                    <Icon aria-hidden="true" strokeWidth={1.8} className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-body font-section-title text-text-primary">{item.title}</div>
                    <div className="text-small leading-ui-relaxed text-text-muted">{item.description}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="page-section-tight">
          <div className="space-y-3">
            <Tabs items={sectionItems} value={activeSection} onChange={setActiveSection} />
            {activeSectionMeta ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-border bg-bg-subtle px-3 py-2">
                <div className="text-small text-text-primary">{activeSectionMeta.label}</div>
                <div className="text-small text-text-muted">{activeSectionMeta.description}</div>
              </div>
            ) : null}
          </div>
        </Card>
      </section>

      {activeSection === "colors" ? (
      <section className="space-y-3">
        <SectionHeader
          title="颜色"
          description="主色、中性色和语义色统一从Token映射，不在页面里再发明第二套视觉口径。"
        />
        <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-4">
            {designSystemColorGroups.map((group) => (
              <Card key={group.title} title={group.title}>
                <div className="mb-4 text-small text-text-muted">{group.description}</div>
                <SwatchGrid swatches={group.swatches} />
              </Card>
            ))}
            <Card title="Tag语义色">
              <div className="mb-4 text-small text-text-muted">
                Tag / Badge只承担状态语义，不承担业务分类颜色表达。
              </div>
              <div className="flex flex-wrap gap-2">
                {tagExamples.map((item) => (
                  <Badge key={item.label} tone={item.tone}>
                    {item.label}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
          <RuleList title="颜色规则" items={designSystemColorRules} />
        </div>
      </section>
      ) : null}

      {activeSection === "typography" ? (
      <section className="space-y-3">
        <SectionHeader
          title="字体"
          description="页面标题、区块标题、正文和辅助正文维持4层文字层级，避免后台页面层次失控。"
        />
        <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-4">
            <Card title="文字层级">
              <div className="space-y-5">
                {designSystemTypographyRules.map((item) => (
                  <div key={item.label} className="space-y-2 border-b border-border pb-4 last:border-0 last:pb-0">
                    <div
                      style={getTypographyStyle(item)}
                      className="text-text-primary"
                    >
                      {item.sample}
                    </div>
                    <div className="flex flex-wrap gap-2 text-mini text-text-muted">
                      <code className="rounded bg-bg-subtle px-2 py-0.5">{item.token}</code>
                      {item.lineHeightToken ? (
                        <code className="rounded bg-bg-subtle px-2 py-0.5">{item.lineHeightToken}</code>
                      ) : null}
                    </div>
                    <div className="text-small text-text-muted">{item.description}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <RuleList title="字体规则" items={designSystemTypographyMeta} />
        </div>
      </section>
      ) : null}

      {activeSection === "density" ? (
      <section className="space-y-3">
        <SectionHeader
          title="间距与密度"
          description="高密度后台的关键不是把所有间距压到最小，而是让页面、卡片、控件和壳层保持同一节奏。"
        />
        <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          <Card title="密度基线">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {designSystemDensityRules.map((item) => (
                <MetricCard key={item.label} item={item} />
              ))}
            </div>
          </Card>
          <RuleList title="密度规则" items={designSystemDensityRules} />
        </div>
      </section>
      ) : null}

      {activeSection === "surface" ? (
      <section className="space-y-3">
        <SectionHeader
          title="圆角与阴影"
          description="圆角、阴影和卡片容器一起决定后台界面的边界感，重点是克制一致，而不是做出强装饰效果。"
        />
        <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-4">
            <Card title="圆角梯度">
              <TokenSampleGrid items={designSystemRadiusSamples} variant="radius" />
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card title="阴影层级">
                <TokenSampleGrid items={designSystemShadowSamples} variant="shadow" />
              </Card>
              <Card title="卡片容器">
                <SurfaceCardShowcase />
              </Card>
            </div>
          </div>
          <RuleList title="圆角与阴影规则" items={designSystemSurfaceRules} />
        </div>
      </section>
      ) : null}

      {activeSection === "controls" ? (
      <section className="space-y-3">
        <SectionHeader
          title="表单与基础控件"
          description="控件展示强调后台高频输入和状态承载，不展示营销型组件，也不混入第二套组件风格。"
        />
        <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <Card title="按钮">
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">主操作</Button>
                  <Button>次操作</Button>
                  <Button variant="ghost">弱操作</Button>
                  <Button variant="danger">危险操作</Button>
                </div>
              </Card>

              <Card title="Tag / Badge">
                <div className="flex flex-wrap gap-2">
                  {tagExamples.map((item) => (
                    <Badge key={item.label} tone={item.tone}>
                      {item.label}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>

            <Card title="表单控件">
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <div className="field-label">输入框</div>
                  <Input placeholder="请输入" />
                </div>
                <div>
                  <div className="field-label">下拉选择</div>
                  <Select
                    className="bg-white"
                    value={selectValue}
                    onValueChange={setSelectValue}
                    options={statusOptions}
                  />
                </div>
                <div>
                  <div className="field-label">Checkbox</div>
                  <Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} label="默认勾选" variant="card" />
                </div>
                <div>
                  <div className="field-label">Switch</div>
                  <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
                </div>
                <div className="lg:col-span-2">
                  <div className="field-label">Textarea</div>
                  <Textarea placeholder="请输入" />
                </div>
              </div>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card title="DateRangePicker">
                <div className="space-y-3">
                  <div className="text-small leading-ui-relaxed text-text-muted">
                    系统级工具条和查询区优先复用统一日期区间控件，不再用假按钮占位。
                  </div>
                  <DateRangePicker value={dateRange} onChange={setDateRange} />
                </div>
              </Card>

              <Card title="AttachmentPanel">
                <AttachmentPanel
                  items={[
                    { id: "demo-1", name: "采购合同.pdf", size: "1.6MB", status: "uploaded" },
                    { id: "demo-2", name: "价格核对单.xlsx", size: "320KB", status: "failed" },
                  ]}
                  onUpload={() => {}}
                  onDownload={() => {}}
                  onDelete={() => {}}
                  onRetry={() => {}}
                />
              </Card>
            </div>
          </div>
          <RuleList title="控件规则" items={designSystemControlRules} />
        </div>
      </section>
      ) : null}

      {activeSection === "data" ? (
      <section className="space-y-3">
        <SectionHeader
          title="数据与表格"
          description="列表和明细的核心数据承载仍然是表格，数据格式也应统一，不因为业务不同在每个页面各自发明规则。"
        />
        <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-4">
            <Card title="数据表格">
              <DataTableShowcase rows={designSystemTableRows} />
            </Card>

            <Card title="数据格式规范">
              <DataFormatGrid items={designSystemFormatSamples} />
            </Card>

            <Card title="列设置">
              <div className="space-y-3">
                <div className="text-small leading-ui-relaxed text-text-muted">
                  适用于字段较多、岗位关注点不同的列表页。默认支持显示隐藏、拖拽排序、固定列和表格行高切换，
                  并按当前用户自动记忆最近一次配置。
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="draft">自动记忆用户配置</Badge>
                  <Badge tone="processing">拖拽排序</Badge>
                  <Badge tone="pending">固定列</Badge>
                </div>
                <div className="rounded-sm border border-border bg-bg-subtle p-4">
                  <div className="mb-2 text-small text-text-muted">默认推荐列</div>
                  <div className="flex flex-wrap gap-2">
                    {columnSettingsState.order
                      .filter((id) => columnSettingsState.visible.includes(id))
                      .slice(0, 8)
                      .map((id) => {
                        const field = columnSettingsFields.find((item) => item.id === id);
                        return field ? (
                          <span key={id} className="rounded-sm border border-border bg-white px-2 py-1 text-small text-text-secondary">
                            {field.label}
                          </span>
                        ) : null;
                      })}
                  </div>
                </div>
                <Button onClick={() => setColumnSettingsOpen(true)}>打开列设置示例</Button>
              </div>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card title="查询报表页工具条">
                <div className="space-y-3">
                  <div className="text-small leading-ui-relaxed text-text-muted">
                    纯查询报表页默认不额外补无意义的刷新，也不在工具条左侧放装饰性的“共X条记录”。重点保留导出、列设置等弱次级动作。
                  </div>
                  <div className="rounded-sm border border-border bg-bg-subtle p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="primary">导出</Button>
                      <Button size="sm">列设置</Button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="宽表格规则">
                <div className="space-y-3">
                  <div className="text-small leading-ui-relaxed text-text-muted">
                    宽表格不按平均列宽硬挤。时间、单号、货主、仓库、数量前后值等字段应按语义给宽，并结合固定列、截断和等宽数字提升可读性。
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="processing">固定列</Badge>
                    <Badge tone="pending">长文本截断</Badge>
                    <Badge tone="draft">等宽数字</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          <RuleList title="数据规则" items={designSystemDataRules} />
        </div>
      </section>
      ) : null}

      {activeSection === "shell" ? (
      <section className="space-y-3">
        <SectionHeader
          title="壳层与导航"
          description="Design System只展示跨业务稳定成立的壳层模式，包括首页Tab、工作台页签、分页和Modal头部。"
        />
        <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-4">
            <Card title="侧栏与独立入口">
              <div className="rounded-md border border-border bg-bg-page p-4">
                <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                  <div className="rounded-md border border-border bg-white">
                    <div className="flex h-tabs items-center border-b border-border px-section">
                      <span className="text-section-title font-section-title text-text-primary">维他命B端后台模板</span>
                    </div>
                    <div className="space-y-4 p-3">
                      <div className="space-y-2">
                        <MiniNavRow icon={ClipboardList} label="采购协同" active />
                        <MiniNavRow icon={Rows3} label="执行作业" />
                        <MiniNavRow icon={PanelLeft} label="主数据" />
                      </div>
                      <div className="border-t border-border pt-3">
                        <MiniNavRow icon={Palette} label="Design System" active />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-md border border-border bg-white">
                      <div className="workspace-tab-strip">
                        <div className="workspace-tab-item is-active">
                          <span className="workspace-tab-label">
                            <House aria-hidden="true" strokeWidth={1.8} className="workspace-tab-icon" />
                            <span className="workspace-tab-text">首页</span>
                          </span>
                        </div>
                        <div className="workspace-tab-item">
                          <span className="workspace-tab-label">
                            <Palette aria-hidden="true" strokeWidth={1.8} className="workspace-tab-icon" />
                            <span className="workspace-tab-text">Design System</span>
                          </span>
                          <button type="button" className="workspace-tab-close" aria-label="关闭Design System">
                            <X aria-hidden="true" strokeWidth={1.8} className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="workspace-tab-item">
                          <span className="workspace-tab-label">
                            <ClipboardList aria-hidden="true" strokeWidth={1.8} className="workspace-tab-icon" />
                            <span className="workspace-tab-text">采购订单列表</span>
                          </span>
                          <button type="button" className="workspace-tab-close" aria-label="关闭采购订单列表">
                            <X aria-hidden="true" strokeWidth={1.8} className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <Card title="分页">
                        <MiniPagination pageSize={pageSize} onPageSizeChange={setPageSize} />
                      </Card>
                      <Card title="Modal头部">
                        <div className="rounded-md border border-border bg-white shadow-xs">
                          <div className="flex items-center justify-between border-b border-border px-modal py-section-tight">
                            <div className="text-section-title font-section-title text-text-primary">确认操作</div>
                            <button
                              type="button"
                              className="inline-flex h-btn-sm w-btn-sm items-center justify-center rounded-sm text-text-muted"
                              aria-label="关闭弹窗"
                            >
                              <X aria-hidden="true" strokeWidth={1.8} className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="p-modal text-small text-text-muted">弹窗右上角关闭统一使用线性icon按钮。</div>
                        </div>
                      </Card>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <Card title="列表页骨架">
                        <div className="space-y-3">
                          <div className="text-small leading-ui-relaxed text-text-muted">
                            列表页优先复用共享`PageHeader`、`ListPageMainCard`和`ListPageToolbar`骨架，业务差异留在工具条内容和表格定义里。
                          </div>
                          <div className="rounded-md border border-border bg-bg-subtle p-3">
                            <PageHeader
                              title="供应商主数据"
                              description="共享页头负责标题、说明和动作位，不重复写外层结构。"
                              actions={
                                <div className="flex gap-2">
                                  <Button size="sm">导入</Button>
                                  <Button size="sm" variant="primary">
                                    新增
                                  </Button>
                                </div>
                              }
                            />
                            <ListPageMainCard>
                              <ListPageToolbar className="justify-end">
                                <Button size="sm">列设置</Button>
                              </ListPageToolbar>
                              <div className="px-4 py-6 text-small text-text-muted">查询区、表格区和分页区继续放在主卡片结构内。</div>
                            </ListPageMainCard>
                          </div>
                        </div>
                      </Card>

                      <Card title="UploadDropzone">
                        <div className="space-y-3">
                          <div className="text-small leading-ui-relaxed text-text-muted">
                            导入弹窗优先复用共享上传区与骨架结构，不再每个业务页各自拼一块虚线容器。
                          </div>
                          <UploadDropzone description="支持点击或拖拽上传，业务页只保留文案和结果逻辑差异。" />
                        </div>
                      </Card>
                    </div>

                    <Card title="样例调试面板">
                      <div className="space-y-3">
                        <div className="text-small leading-ui-relaxed text-text-muted">
                          样例调试面板只用于切换展示状态，不进入业务操作区。默认采用弱化悬浮样式，并支持鼠标拖动，避免挡住宽表格和详情内容。
                        </div>
                        <div className="rounded-lg border border-dashed border-border-strong bg-white/80 p-3 shadow-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-small font-section-title text-text-secondary">样例调试面板</span>
                            <span className="text-mini text-text-muted">可拖动</span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="demo-scenario-chip is-active">正常</span>
                            <span className="demo-scenario-chip">加载中</span>
                            <span className="demo-scenario-chip">无权限</span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card title="切换器体系">
                      <div className="space-y-4">
                        <div>
                          <div className="text-small text-text-muted">工作台 / 状态 / 内容切换：继续使用线性Tab</div>
                          <div className="mt-2">
                            <Tabs
                              items={[
                                { label: "首页", value: "home" },
                                { label: "消息中心", value: "message" },
                                { label: "采购订单", value: "purchase" },
                              ]}
                              value="home"
                              onChange={() => {}}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="text-small text-text-muted">模式 / 轻过滤切换：使用胶囊分段控件</div>
                          <div className="mt-2">
                            <SegmentedControl
                              items={[
                                { label: "消息(3)", value: "message" },
                                { label: "通知(1)", value: "notice" },
                                { label: "待办(2)", value: "todo" },
                              ]}
                              value="message"
                              onChange={() => {}}
                            />
                          </div>
                          <div className="mt-2 text-mini text-text-muted">
                            允许胶囊激活项，但外层不再包灰底边框壳；控件本身优先与32px按钮、输入框保持同高。
                          </div>
                        </div>

                        <div>
                          <div className="text-small text-text-muted">快速过滤：可用更轻的Chip，不冒充Tab</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <FilterChip active>高优先级</FilterChip>
                            <FilterChip>近7天</FilterChip>
                            <FilterChip>仅异常</FilterChip>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card title="Drawer">
                      <div className="space-y-3">
                        <div className="text-small leading-ui-relaxed text-text-muted">
                          查看态详情优先用共享Drawer，遮罩覆盖整个视口，不通过分栏硬挤主体内容。
                        </div>
                        <Button onClick={() => setDrawerOpen(true)}>打开Drawer示例</Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <RuleList title="壳层规则" items={designSystemShellRules} />
        </div>
      </section>
      ) : null}

      {activeSection === "feedback" ? (
      <section className="space-y-3">
        <SectionHeader
          title="状态与反馈"
          description="反馈样式以简洁、就近、可理解为原则，不用高存在感装饰去替代真实状态表达。"
        />
        <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-4">
            <Card title="顶部轻量Alert">
              <div className="space-y-3">
                <div className="text-small leading-ui-relaxed text-text-muted">
                  适合保存成功、配置恢复、暂未开放功能等轻量反馈。默认出现在页面中间靠近顶部的位置，约2秒自动消失，不阻断当前流程。
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() =>
                      showFeedbackAlert({
                        tone: "success",
                        title: "保存成功",
                        description: "采购订单筛选条件已更新。",
                      })
                    }
                  >
                    触发Success
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      showFeedbackAlert({
                        tone: "info",
                        title: "已恢复默认配置",
                        description: "当前列表列设置已恢复为系统默认值。",
                      })
                    }
                  >
                    触发Info
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      showFeedbackAlert({
                        tone: "warning",
                        title: "功能暂未开放",
                        description: "打印能力尚未纳入当前版本规划。",
                      })
                    }
                  >
                    触发Warning
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      showFeedbackAlert({
                        tone: "error",
                        title: "提交失败",
                        description: "请检查必填项后重新提交。",
                      })
                    }
                  >
                    触发Error
                  </Button>
                </div>
              </div>
            </Card>

            <Card title="Banner">
              <div className="space-y-3">
                <Banner tone="warning" title="需关注的提醒" description="仅用于说明当前区域存在需处理事项，不替代主结构。" />
                <Banner tone="error" title="操作失败" description="错误反馈优先就近展示，并说明后续可执行动作。" />
              </div>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card title="DescriptionList">
                <DescriptionList
                  columns={2}
                  items={[
                    { label: "采购组织", value: "华东采购中心" },
                    { label: "供应商", value: "华东生鲜原料供应商有限公司" },
                    { label: "收货仓库", value: "上海生鲜仓" },
                    { label: "采购员", value: "张敏" },
                  ]}
                />
              </Card>

              <Card title="Timeline">
                <Timeline
                  items={[
                    {
                      id: "timeline-1",
                      time: "2026-03-24 09:18:10",
                      title: "张敏 · 提交审核",
                      description: "系统已将采购订单提交至采购主管审批。",
                      tone: "success",
                    },
                    {
                      id: "timeline-2",
                      time: "2026-03-24 09:25:41",
                      title: "采购主管 · 审核通过",
                      description: "采购策略和数量核对无误，允许继续下推。",
                      tone: "info",
                    },
                  ]}
                />
              </Card>

              <Card title="空状态">
                <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-bg-subtle px-6 text-center">
                  <Inbox aria-hidden="true" strokeWidth={1.8} className="h-8 w-8 text-text-muted" />
                  <div className="text-body text-text-primary">暂无数据</div>
                  <div className="max-w-sm text-small leading-ui-relaxed text-text-muted">
                    当前筛选条件下没有命中结果。请调整筛选条件或稍后再试。
                  </div>
                </div>
              </Card>

              <Card title="错误提示与Tag">
                <div className="space-y-4">
                  <div>
                    <div className="field-label">输入框报错</div>
                    <input
                      className="field-control border-danger focus:border-danger focus:ring-danger-subtle"
                      defaultValue="示例内容"
                    />
                    <div className="mt-2 flex items-center gap-2 text-small text-danger">
                      <AlertCircle aria-hidden="true" strokeWidth={1.8} className="h-4 w-4" />
                      <span>请输入合法值后再提交。</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tagExamples.map((item) => (
                      <Badge key={item.label} tone={item.tone}>
                        {item.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <Card title="ExceptionState">
              <ExceptionState
                variant="system-maintenance"
                primaryAction={<Button variant="primary">查看系统通知</Button>}
                secondaryAction={<Button>稍后重试</Button>}
              />
            </Card>
          </div>
          <RuleList title="反馈规则" items={designSystemFeedbackRules} />
        </div>
      </section>
      ) : null}

      <ColumnSettingsModal
        open={columnSettingsOpen}
        title="列设置示例"
        fields={columnSettingsFields}
        state={columnSettingsState}
        defaultState={columnSettingsDefaultState}
        onClose={() => setColumnSettingsOpen(false)}
        onApply={applyColumnSettingsState}
      />
      <Drawer
        open={drawerOpen}
        title="Drawer示例"
        onClose={() => setDrawerOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setDrawerOpen(false)}>关闭</Button>
            <Button variant="primary" onClick={() => setDrawerOpen(false)}>
              确认
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <DescriptionList
            columns={2}
            items={[
              { label: "任务名称", value: "库存流水导出" },
              { label: "状态", value: "处理中" },
              { label: "创建时间", value: "2026-03-24 10:32:11" },
              { label: "记录数", value: "126条" },
            ]}
          />
          <Timeline
            items={[
              {
                id: "drawer-demo-1",
                time: "2026-03-24 10:32:11",
                title: "系统已创建导出任务",
                description: "任务已进入后台排队处理。",
                tone: "info",
              },
              {
                id: "drawer-demo-2",
                time: "2026-03-24 10:32:42",
                title: "文件生成中",
                description: "当前正在生成CSV文件，请稍后查看结果。",
                tone: "warning",
              },
            ]}
          />
        </div>
      </Drawer>
      <FloatingAlert notice={feedbackAlert} />
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <h2 className="page-section-title mb-0">{title}</h2>
      <div className="text-small text-text-muted">{description}</div>
    </div>
  );
}

function RuleList({ title, items }: { title: string; items: DesignSystemRule[] }) {
  return (
    <Card title={title}>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-sm border border-border bg-bg-subtle px-3 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-body text-text-primary">{item.label}</span>
              <code className="rounded bg-white px-2 py-0.5 text-mini text-text-muted">{item.token}</code>
            </div>
            <div className="mt-2 text-small leading-ui-relaxed text-text-muted">{item.description}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SwatchGrid({ swatches }: { swatches: DesignSystemSwatch[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {swatches.map((swatch) => (
        <div key={`${swatch.label}-${swatch.token}`} className="rounded-sm border border-border bg-bg-subtle p-3">
          <div
            className="flex h-20 items-center justify-center rounded-sm border"
            style={getSwatchStyle(swatch)}
          >
            {swatch.kind === "text" ? (
              <span
                style={{ color: cssVar(swatch.token), fontSize: "var(--font-size-section-title)", fontWeight: 600 }}
              >
                Aa
              </span>
            ) : null}
          </div>
          <div className="mt-3 text-small text-text-primary">{swatch.label}</div>
          <div className="mt-1 text-mini text-text-muted">{swatch.token}</div>
          {swatch.description ? <div className="mt-1 text-mini text-text-muted">{swatch.description}</div> : null}
        </div>
      ))}
    </div>
  );
}

function MetricCard({ item }: { item: DesignSystemRule }) {
  return (
    <div className="rounded-sm border border-border bg-bg-subtle p-3">
      <div className="text-small text-text-primary">{item.label}</div>
      <div className="mt-3 flex min-h-[92px] items-center justify-center rounded-sm border border-dashed border-border bg-white px-4 py-3">
        {renderMetricPreview(item)}
      </div>
      <div className="mt-3 text-mini text-text-muted">{item.token}</div>
      <div className="mt-1 text-small leading-ui-relaxed text-text-muted">{item.description}</div>
    </div>
  );
}

function TokenSampleGrid({
  items,
  variant,
}: {
  items: DesignSystemTokenSample[];
  variant: "radius" | "shadow";
}) {
  return (
    <div className={`grid gap-3 ${variant === "radius" ? "md:grid-cols-2 xl:grid-cols-5" : "md:grid-cols-3"}`}>
      {items.map((item) => (
        <div key={item.token} className="rounded-sm border border-border bg-bg-subtle p-3">
          <div className="flex h-24 items-center justify-center rounded-sm border border-dashed border-border bg-bg-page px-3">
            <div
              className="h-14 w-full border border-border bg-white"
              style={getTokenSampleStyle(item, variant)}
            />
          </div>
          <div className="mt-3 text-small text-text-primary">{item.label}</div>
          <div className="mt-1 text-mini text-text-muted">{item.value}</div>
          <div className="mt-1 text-mini text-text-muted">{item.token}</div>
          <div className="mt-2 text-small leading-ui-relaxed text-text-muted">{item.description}</div>
        </div>
      ))}
    </div>
  );
}

function SurfaceCardShowcase() {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-white p-section shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-body font-section-title text-text-primary">Standard Card</div>
            <div className="text-small leading-ui-relaxed text-text-muted">默认16px内边距，适合筛选区、详情区和主内容容器。</div>
          </div>
          <Badge tone="processing">page-section</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="primary">主操作</Button>
          <Button size="sm">次操作</Button>
        </div>
      </div>

      <div className="rounded-md border border-border bg-bg-subtle p-section-tight shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-body text-text-primary">Compact Card</div>
            <div className="text-small leading-ui-relaxed text-text-muted">紧凑版更适合摘要信息、页内说明和次级分组。</div>
          </div>
          <Badge tone="draft">page-section-tight</Badge>
        </div>
      </div>
    </div>
  );
}

function DataTableShowcase({ rows }: { rows: DesignSystemTableRow[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-white shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-section py-section-tight">
        <div className="space-y-1">
          <div className="text-body font-section-title text-text-primary">列表主卡片容器</div>
          <div className="text-small text-text-muted">表格仍是后台数据承载主形态，外层统一放进白底卡片容器。</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm">导出</Button>
          <Button size="sm" variant="primary">新建</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>采购单号</th>
              <th>供应商</th>
              <th>金额</th>
              <th>预计到货</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.orderNo}>
                <td className="tabular-nums">{row.orderNo}</td>
                <td>{row.supplier}</td>
                <td className="tabular-nums">{row.amount}</td>
                <td className="tabular-nums text-text-secondary">{row.eta}</td>
                <td>
                  <Badge tone={getTableStatusTone(row.status)}>{getTableStatusLabel(row.status)}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-bg-subtle px-section py-section-tight text-small text-text-muted">
        <span>40px表头 / 40px默认行高 / 12px横向单元格内边距</span>
        <span>金额与时间格式统一展示</span>
      </div>
    </div>
  );
}

function DataFormatGrid({ items }: { items: DesignSystemFormatSample[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-sm border border-border bg-bg-subtle p-3">
          <div className="text-small text-text-muted">{item.label}</div>
          <div className="mt-2 rounded-sm border border-border bg-white px-3 py-2 text-body text-text-primary tabular-nums">
            {item.example}
          </div>
          <div className="mt-2 text-small leading-ui-relaxed text-text-muted">{item.description}</div>
        </div>
      ))}
    </div>
  );
}

function MiniNavRow({
  icon: Icon,
  label,
  active = false,
}: {
  icon: typeof Palette;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-control rounded-sm px-3 py-2 text-small ${
        active ? "bg-primary-subtle text-primary" : "text-text-secondary"
      }`}
    >
      <Icon aria-hidden="true" strokeWidth={1.8} className={`h-4 w-4 ${active ? "text-primary" : "text-text-muted"}`} />
      <span>{label}</span>
    </div>
  );
}

function getTokenSampleStyle(item: DesignSystemTokenSample, variant: "radius" | "shadow"): CSSProperties {
  if (variant === "radius") {
    return {
      borderRadius: cssVar(item.token),
      background: "var(--primary-subtle)",
    };
  }

  return {
    borderRadius: "var(--radius-md)",
    boxShadow: cssVar(item.token),
    background: "var(--bg-container)",
  };
}

function getTableStatusTone(status: DesignSystemTableRow["status"]) {
  if (status === "pending") {
    return "pending" as const;
  }

  if (status === "processing") {
    return "processing" as const;
  }

  if (status === "success") {
    return "success" as const;
  }

  return "draft" as const;
}

function getTableStatusLabel(status: DesignSystemTableRow["status"]) {
  if (status === "pending") {
    return "待审核";
  }

  if (status === "processing") {
    return "执行中";
  }

  if (status === "success") {
    return "已完成";
  }

  return "草稿";
}

function MiniPagination({
  pageSize,
  onPageSizeChange,
}: {
  pageSize: number;
  onPageSizeChange: (value: number) => void;
}) {
  return (
    <div className="rounded-md border border-border bg-bg-subtle">
      <Pagination
        currentPage={3}
        totalPages={12}
        totalCount={245}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        className="px-3 py-3"
        onPageChange={() => {}}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}

function getSwatchStyle(swatch: DesignSystemSwatch): CSSProperties {
  const borderColor = cssVar(swatch.borderToken ?? "--border-default");

  if (swatch.kind === "text") {
    return {
      background: "var(--bg-container)",
      borderColor,
    };
  }

  if (swatch.kind === "border") {
    return {
      background: "var(--bg-container)",
      borderColor: cssVar(swatch.token),
      borderWidth: 2,
    };
  }

  return {
    background: cssVar(swatch.token),
    borderColor,
  };
}

function getTypographyStyle(item: DesignSystemRule): CSSProperties {
  return {
    fontSize: item.fontSizeToken ? cssVar(item.fontSizeToken) : undefined,
    fontWeight: item.fontWeightToken ? cssVar(item.fontWeightToken) : undefined,
    lineHeight: item.lineHeightToken ? cssVar(item.lineHeightToken) : undefined,
  };
}

function renderMetricPreview(item: DesignSystemRule) {
  if (!item.previewToken) {
    return <Minus aria-hidden="true" strokeWidth={1.8} className="h-4 w-4 text-text-muted" />;
  }

  if (item.preview === "height") {
    return (
      <div className="flex h-16 w-full items-end justify-center">
        <div
          className="w-3/4 rounded-sm border border-border bg-primary-subtle"
          style={{ height: cssVar(item.previewToken) }}
        />
      </div>
    );
  }

  if (item.preview === "width") {
    return (
      <div className="flex w-full items-center justify-center">
        <div
          className="h-10 rounded-sm border border-border bg-primary-subtle"
          style={{ width: `min(100%, ${cssVar(item.previewToken)})` }}
        />
      </div>
    );
  }

  if (item.preview === "gap") {
    return (
      <div className="flex w-full max-w-[220px] flex-col" style={{ rowGap: cssVar(item.previewToken) }}>
        <div className="text-small text-text-muted">字段Label</div>
        <div className="rounded-sm border border-border bg-bg-subtle px-3 py-2 text-small text-text-secondary">控件区域</div>
      </div>
    );
  }

  if (item.preview === "inset") {
    return (
      <div className="w-full rounded-sm border border-border bg-bg-page p-3">
        <div className="rounded-sm border border-border bg-white" style={{ padding: cssVar(item.previewToken) }}>
          <div className="h-8 rounded-sm border border-dashed border-border bg-bg-subtle" />
        </div>
      </div>
    );
  }

  return <Minus aria-hidden="true" strokeWidth={1.8} className="h-4 w-4 text-text-muted" />;
}

function cssVar(token: string) {
  return `var(${token})`;
}
