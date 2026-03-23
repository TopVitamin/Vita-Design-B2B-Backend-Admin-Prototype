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
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { FloatingAlert, type FloatingAlertInput } from "../components/ui/floating-alert";
import { Select } from "../components/ui/select";
import { Tabs } from "../components/ui/tabs";
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

const pageSizeOptions = [
  { label: "20条", value: "20" },
  { label: "50条", value: "50" },
  { label: "100条", value: "100" },
];

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
  const [pageSize, setPageSize] = useState("20");
  const [checked, setChecked] = useState(true);
  const [switchOn, setSwitchOn] = useState(true);
  const [feedbackAlert, setFeedbackAlert] = useState<FloatingAlertInput | null>(null);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
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
                  <input className="field-control" placeholder="请输入" />
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
                  <label className="choice-control">
                    <input
                      checked={checked}
                      onChange={(event) => setChecked(event.target.checked)}
                      type="checkbox"
                    />
                    <span>默认勾选</span>
                  </label>
                </div>
                <div>
                  <div className="field-label">Switch</div>
                  <button
                    type="button"
                    className={`switch-control ${switchOn ? "is-on" : ""}`}
                    onClick={() => setSwitchOn((current) => !current)}
                  >
                    <span className="switch-track">
                      <span className="switch-thumb" />
                    </span>
                    <span>{switchOn ? "已启用" : "已关闭"}</span>
                  </button>
                </div>
              </div>
            </Card>
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
                            <span>首页</span>
                          </span>
                        </div>
                        <div className="workspace-tab-item">
                          <span className="workspace-tab-label">
                            <Palette aria-hidden="true" strokeWidth={1.8} className="workspace-tab-icon" />
                            <span>Design System</span>
                          </span>
                          <button type="button" className="workspace-tab-close" aria-label="关闭Design System">
                            <X aria-hidden="true" strokeWidth={1.8} className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="workspace-tab-item">
                          <span className="workspace-tab-label">
                            <ClipboardList aria-hidden="true" strokeWidth={1.8} className="workspace-tab-icon" />
                            <span>采购订单列表</span>
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
                <div className="state-banner border-warning bg-warning-subtle text-warning">
                  <div className="space-y-1">
                    <div className="text-body font-section-title text-warning">需关注的提醒</div>
                    <div className="text-small text-text-secondary">仅用于说明当前区域存在需处理事项，不替代主结构。</div>
                  </div>
                </div>
                <div className="state-banner border-danger bg-danger-subtle text-danger">
                  <div className="space-y-1">
                    <div className="text-body font-section-title text-danger">操作失败</div>
                    <div className="text-small text-text-secondary">错误反馈优先就近展示，并说明后续可执行动作。</div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
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
  pageSize: string;
  onPageSizeChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-md border border-border bg-bg-subtle p-3">
      <div className="flex flex-wrap items-center justify-between gap-3 text-small text-text-muted">
        <span>共245条</span>
        <div className="flex flex-wrap items-center gap-actions">
          <label className="flex items-center gap-control">
            <span>每页</span>
            <Select className="h-input-sm w-[92px] bg-white" value={pageSize} onValueChange={onPageSizeChange} options={pageSizeOptions} />
          </label>
          <span>3/12页</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button size="sm">上一页</Button>
          <Button size="sm" variant="primary">
            下一页
          </Button>
        </div>
        <div className="flex items-center gap-2 text-small text-text-muted">
          <span>跳转</span>
          <input className="field-control h-input-sm w-[72px]" defaultValue="3" placeholder="请输入" />
        </div>
      </div>
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
