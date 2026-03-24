import type { ReactNode } from "react";
import { AlertTriangle, Clock3, LockKeyhole, SearchX } from "lucide-react";
import { Button } from "./button";

const presetMap = {
  "403": {
    title: "无权限访问",
    description: "当前账号没有访问该页面或数据范围的权限，请联系管理员开通对应菜单和数据权限。",
    icon: LockKeyhole,
  },
  "404": {
    title: "页面不存在",
    description: "你访问的页面已下线、链接失效或当前环境未配置该页面，请返回上一级重新进入。",
    icon: SearchX,
  },
  "session-expired": {
    title: "登录已过期",
    description: "当前会话已失效，请重新登录后继续操作。未保存内容可能需要重新录入。",
    icon: Clock3,
  },
  "system-maintenance": {
    title: "系统维护中",
    description: "当前系统正在维护或该功能暂时未开放，请稍后再试，或关注系统通知获取恢复时间。",
    icon: AlertTriangle,
  },
} as const;

export function ExceptionState({
  variant,
  title,
  description,
  primaryAction,
  secondaryAction,
}: {
  variant: "403" | "404" | "session-expired" | "system-maintenance";
  title?: string;
  description?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
}) {
  const preset = presetMap[variant];
  const Icon = preset.icon;

  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-md border border-dashed border-border bg-bg-subtle px-6 py-10">
      <div className="max-w-[560px] text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-subtle text-primary">
          <Icon aria-hidden="true" className="h-7 w-7" />
        </div>
        <div className="mt-5 text-page-title font-page-title text-text-primary">{title ?? preset.title}</div>
        <div className="mt-3 text-body leading-ui-relaxed text-text-secondary">{description ?? preset.description}</div>
        {primaryAction || secondaryAction ? (
          <div className="mt-6 flex justify-center gap-2">
            {secondaryAction}
            {primaryAction}
          </div>
        ) : null}
      </div>
    </div>
  );
}
