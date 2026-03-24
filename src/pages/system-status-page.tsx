import { AlertTriangle, Clock3, LockKeyhole, SearchX } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ExceptionState } from "../components/ui/exception-state";
import { SegmentedControl } from "../components/ui/segmented-control";

export function SystemStatusPage({
  activeVariant,
  onVariantChange,
}: {
  activeVariant: "403" | "404" | "session-expired" | "system-maintenance";
  onVariantChange: (variant: "403" | "404" | "session-expired" | "system-maintenance") => void;
}) {
  const variantMeta = {
    "403": {
      label: "403无权限",
      hint: "用于当前账号没有菜单或数据权限的场景。",
      icon: LockKeyhole,
    },
    "404": {
      label: "404页面不存在",
      hint: "用于路由失效、链接错误或页面下线场景。",
      icon: SearchX,
    },
    "session-expired": {
      label: "登录过期",
      hint: "用于会话失效、需要重新登录的场景。",
      icon: Clock3,
    },
    "system-maintenance": {
      label: "系统维护",
      hint: "用于全局维护、功能未开放或临时停机场景。",
      icon: AlertTriangle,
    },
  } as const;

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div>
          <div className="page-title">系统状态参考页</div>
          <div className="mt-2 text-body text-text-secondary">
            统一展示403、404、登录过期和系统维护4类系统状态页，用于后续系统级异常页复用。
          </div>
        </div>
        <Badge tone="processing">异常页组件族</Badge>
      </div>

      <Card title="状态切换" extra={<Badge tone="draft">系统参考</Badge>}>
        <div className="space-y-3">
          <SegmentedControl
            items={[
              { label: "403无权限", value: "403" },
              { label: "404页面不存在", value: "404" },
              { label: "登录过期", value: "session-expired" },
              { label: "系统维护", value: "system-maintenance" },
            ]}
            value={activeVariant}
            onChange={onVariantChange}
          />
          <div className="text-small text-text-muted">{variantMeta[activeVariant].hint}</div>
        </div>
      </Card>

      <Card title="状态预览">
        <ExceptionState
          variant={activeVariant}
          primaryAction={
            activeVariant === "session-expired" ? (
              <Button variant="primary">重新登录</Button>
            ) : activeVariant === "system-maintenance" ? (
              <Button variant="primary">查看系统通知</Button>
            ) : (
              <Button variant="primary">返回首页</Button>
            )
          }
          secondaryAction={
            activeVariant === "403" ? (
              <Button>联系管理员</Button>
            ) : activeVariant === "404" ? (
              <Button>返回上一级</Button>
            ) : activeVariant === "session-expired" ? (
              <Button>取消</Button>
            ) : (
              <Button>稍后重试</Button>
            )
          }
        />
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {Object.entries(variantMeta).map(([key, meta]) => {
          const Icon = meta.icon;
          return (
            <Card key={key}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary-subtle text-primary">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <div className="text-body font-section-title text-text-primary">{meta.label}</div>
                  <div className="text-small leading-ui-relaxed text-text-muted">{meta.hint}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
