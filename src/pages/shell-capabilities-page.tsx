import {
  AlertCircle,
  Bell,
  Download,
  LayoutGrid,
  PanelRightOpen,
  Search,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import type { FloatingAlertInput } from "../components/ui/floating-alert";

const capabilityCards = [
  {
    title: "全局搜索",
    description: "顶部搜索默认只检索左侧可用菜单，支持点击触发、/ 唤起、↑/↓切换高亮和 Enter 跳转。",
    points: ["只搜菜单，不搜顶部页签和用户动作", "结果面板与输入框同宽", "Esc关闭搜索面板"],
    icon: Search,
  },
  {
    title: "消息通知",
    description: "铃铛入口承载未读徽标、预览面板和查看更多路径，适合高频待办与提醒处理。",
    points: ["预览面板支持消息 / 通知 / 待办", "底部统一保留全部已读 / 查看更多", "查看更多进入消息中心"],
    icon: Bell,
  },
  {
    title: "用户菜单",
    description: "头像入口统一承载个人中心、主题切换、语言切换和退出登录等全局动作。",
    points: ["单独头像入口，不包白底胶囊", "占位能力走顶部轻提示", "主题切换属于全局偏好配置"],
    icon: UserCircle2,
  },
  {
    title: "工作台Tab",
    description: "首页Tab固定存在，业务页签单实例打开，常见系统能力也可作为独立工作台Tab承载。",
    points: ["首页Tab不可关闭", "消息中心与壳层能力可独立成Tab", "业务页签关闭后可重新从首页打开"],
    icon: LayoutGrid,
  },
  {
    title: "覆盖式抽屉",
    description: "查看态详情优先使用覆盖式右侧抽屉，不通过分栏硬挤主体内容宽度。",
    points: ["抽屉带遮罩和阴影", "主列表宽度保持稳定", "查看型动作放在抽屉内完成"],
    icon: PanelRightOpen,
  },
  {
    title: "顶部轻提示",
    description: "壳层级占位能力和系统反馈统一走顶部浮层Alert，不回退浏览器原生alert。",
    points: ["成功 / 提醒 / 错误三类语气", "默认约2秒自动消失", "不打断当前工作流"],
    icon: AlertCircle,
  },
  {
    title: "导出任务中心",
    description: "统一承接采购、主数据和报表导出任务，集中查看状态、下载结果和失败重试。",
    points: ["右上角独立icon入口", "导出任务统一沉淀，不再散落提示", "处理失败任务时可直接重试"],
    icon: Download,
  },
] as const;

export function ShellCapabilitiesPage({
  onOpenMessageCenter,
  onOpenMessageDrawer,
  onOpenExportTaskCenter,
  onOpenSystemStatus,
  onOpenPurchaseList,
  onOpenThemeModal,
  onShowAlert,
}: {
  onOpenMessageCenter: () => void;
  onOpenMessageDrawer: () => void;
  onOpenExportTaskCenter: () => void;
  onOpenSystemStatus: () => void;
  onOpenPurchaseList: () => void;
  onOpenThemeModal: () => void;
  onShowAlert: (notice: FloatingAlertInput) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="page-header">
        <div>
          <h1 className="page-title">壳层能力参考页</h1>
          <div className="mt-2 text-small text-text-muted">
            集中演示全局搜索、消息通知、用户菜单、工作台Tab、覆盖式抽屉和顶部轻提示这6类系统级能力。
          </div>
        </div>
        <Badge tone="processing">系统级参考</Badge>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {capabilityCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <div className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary-subtle text-primary">
                    <Icon aria-hidden="true" strokeWidth={1.8} className="h-5 w-5" />
                  </div>
                  <Badge tone="draft">壳层能力</Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-body font-section-title text-text-primary">{item.title}</div>
                  <div className="text-small leading-ui-relaxed text-text-muted">{item.description}</div>
                </div>

                <div className="space-y-2">
                  {item.points.map((point) => (
                    <div key={point} className="flex items-start gap-2 text-small text-text-secondary">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card title="联动入口" extra={<Badge tone="pending">交互示范</Badge>}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Button variant="primary" onClick={onOpenMessageCenter}>
            打开消息中心
          </Button>
          <Button variant="secondary" onClick={onOpenExportTaskCenter}>
            打开导出任务中心
          </Button>
          <Button variant="secondary" onClick={onOpenSystemStatus}>
            打开系统状态页
          </Button>
          <Button variant="secondary" onClick={onOpenMessageDrawer}>
            打开抽屉查看态
          </Button>
          <Button variant="secondary" onClick={onOpenPurchaseList}>
            打开采购订单列表
          </Button>
          <Button variant="secondary" onClick={onOpenThemeModal}>
            打开主题切换
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              onShowAlert({
                tone: "success",
                title: "成功提示示例",
                description: "顶部轻提示适合承载系统级轻反馈，不打断当前浏览路径。",
              })
            }
          >
            触发成功提示
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              onShowAlert({
                tone: "warning",
                title: "提醒提示示例",
                description: "全局搜索、消息预览和未开放入口都应复用统一的轻提示口径。",
              })
            }
          >
            触发提醒提示
          </Button>
        </div>
      </Card>

      <Card title="使用建议">
        <div className="space-y-3 text-small leading-ui-relaxed text-text-secondary">
          <div>
            这页不是业务页面，而是系统级能力示范页。后续新增系统能力时，优先在这里补一段说明和一条联动入口，再决定是否沉淀成独立案例。
          </div>
          <div>
            如果要体验全局搜索，请直接点击顶部搜索框或按`/`；如果要体验覆盖式抽屉，请打开消息中心并查看任意一条消息。
          </div>
          <div className="inline-flex items-center gap-2 rounded-sm border border-border bg-bg-subtle px-3 py-2 text-text-muted">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            <span>系统级能力优先强调稳定、秩序和一致性，不为了展示感引入第二套交互语言。</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
