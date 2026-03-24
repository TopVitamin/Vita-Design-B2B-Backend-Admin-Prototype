import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, ExternalLink, RotateCw } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { DateRangePicker } from "../components/ui/date-range-picker";
import { Drawer } from "../components/ui/drawer";
import { ExceptionState } from "../components/ui/exception-state";
import { SegmentedControl } from "../components/ui/segmented-control";
import {
  exportTaskStatusFilters,
  type ExportTaskRecord,
  type ExportTaskStatusFilter,
} from "../data/export-task-center";

function statusTone(status: ExportTaskRecord["status"]) {
  if (status === "processing") {
    return "processing" as const;
  }
  if (status === "success") {
    return "success" as const;
  }
  if (status === "failed") {
    return "error" as const;
  }
  return "draft" as const;
}

function statusLabel(status: ExportTaskRecord["status"]) {
  if (status === "processing") {
    return "处理中";
  }
  if (status === "success") {
    return "导出成功";
  }
  if (status === "failed") {
    return "导出失败";
  }
  return "已下载";
}

export function ExportTaskCenterPage({
  records,
  activeStatus,
  activeTaskId,
  onStatusChange,
  onOpenTask,
  onCloseTask,
  onOpenSource,
  onDownloadTask,
  onRetryTask,
  onClearFinished,
}: {
  records: ExportTaskRecord[];
  activeStatus: ExportTaskStatusFilter;
  activeTaskId: string | null;
  onStatusChange: (status: ExportTaskStatusFilter) => void;
  onOpenTask: (id: string) => void;
  onCloseTask: () => void;
  onOpenSource: (task: ExportTaskRecord) => void;
  onDownloadTask: (task: ExportTaskRecord) => void;
  onRetryTask: (task: ExportTaskRecord) => void;
  onClearFinished: () => void;
}) {
  const [dateRange, setDateRange] = useState({
    start: "2026-01-22",
    end: "2026-03-23",
  });

  const filteredRecords = useMemo(
    () =>
      records.filter((item) => {
        if (activeStatus !== "all" && item.status !== activeStatus) {
          return false;
        }

        const recordDate = item.createdAt.slice(0, 10);
        if (dateRange.start && recordDate < dateRange.start) {
          return false;
        }
        if (dateRange.end && recordDate > dateRange.end) {
          return false;
        }

        return true;
      }),
    [activeStatus, dateRange.end, dateRange.start, records],
  );

  const activeTask = useMemo(
    () => records.find((item) => item.id === activeTaskId) ?? null,
    [activeTaskId, records],
  );

  const currentIndex = filteredRecords.findIndex((item) => item.id === activeTaskId);
  const prevTaskId = currentIndex > 0 ? filteredRecords[currentIndex - 1]?.id : null;
  const nextTaskId = currentIndex >= 0 && currentIndex < filteredRecords.length - 1 ? filteredRecords[currentIndex + 1]?.id : null;

  const statusItems = exportTaskStatusFilters.map((item) => ({
    ...item,
    count: item.id === "all" ? records.length : records.filter((record) => record.status === item.id).length,
  }));

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div>
          <div className="page-title">导出任务中心</div>
          <div className="mt-2 text-body text-text-secondary">
            统一承接列表、主数据和报表导出任务，集中查看状态、下载文件和重试失败任务。
          </div>
        </div>
      </div>

      <section className="page-section relative overflow-hidden p-0">
        <div className="min-h-[680px]">
          <div className="flex h-12 items-center justify-between border-b border-border bg-white px-section">
            <div className="flex flex-wrap items-center gap-3">
              <DateRangePicker value={dateRange} onChange={setDateRange} />
              <SegmentedControl
                items={statusItems.map((item) => ({
                  value: item.id,
                  label: `${item.label}(${item.count})`,
                }))}
                value={activeStatus}
                onChange={onStatusChange}
              />
            </div>

            <Button size="sm" onClick={onClearFinished}>
              清理已完成
            </Button>
          </div>

          <div className="overflow-auto">
            <table>
              <thead>
                <tr>
                  <th>任务名称</th>
                  <th className="w-36">来源页面</th>
                  <th className="w-40">导出范围</th>
                  <th className="w-24">格式</th>
                  <th className="w-24 text-right">记录数</th>
                  <th className="w-28">状态</th>
                  <th className="w-44">创建时间</th>
                  <th className="w-40">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((task) => (
                  <tr
                    key={task.id}
                    className={`cursor-pointer transition hover:bg-bg-hover ${task.id === activeTaskId ? "bg-bg-hover" : ""}`}
                    onClick={() => onOpenTask(task.id)}
                  >
                    <td>
                      <div className="min-w-0">
                        <div className="truncate text-body font-body-strong text-text-primary">{task.taskName}</div>
                        <div className="mt-1 truncate text-small text-text-muted">{task.fileName}</div>
                      </div>
                    </td>
                    <td>{task.sourceLabel}</td>
                    <td>{task.rangeLabel}</td>
                    <td className="uppercase">{task.format}</td>
                    <td className="text-right tabular-nums">{task.recordCount}</td>
                    <td>
                      <Badge tone={statusTone(task.status)}>{statusLabel(task.status)}</Badge>
                    </td>
                    <td className="tabular-nums text-body text-text-secondary">{task.createdAt}</td>
                    <td>
                      <div className="flex items-center gap-actions" onClick={(event) => event.stopPropagation()}>
                        {(task.status === "success" || task.status === "downloaded") ? (
                          <button className="text-link" type="button" onClick={() => onDownloadTask(task)}>
                            下载
                          </button>
                        ) : null}
                        {task.status === "failed" ? (
                          <button className="text-link" type="button" onClick={() => onRetryTask(task)}>
                            重试
                          </button>
                        ) : null}
                        {task.sourceTarget ? (
                          <button className="text-link" type="button" onClick={() => onOpenSource(task)}>
                            来源页
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRecords.length === 0 ? (
              <div className="p-section">
                <ExceptionState
                  variant="404"
                  title="暂无导出任务"
                  description="当前筛选条件下没有命中的导出任务，请切换状态、调整日期范围或稍后刷新后再查看。"
                  primaryAction={<Button variant="primary" onClick={() => onStatusChange("all")}>查看全部任务</Button>}
                  secondaryAction={<Button onClick={onClearFinished}>清理已完成</Button>}
                />
              </div>
            ) : null}
          </div>

        </div>
      </section>
      {activeTask ? (
        <Drawer
          open={Boolean(activeTask)}
          onClose={onCloseTask}
          headerExtra={
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!prevTaskId}
                onClick={() => prevTaskId && onOpenTask(prevTaskId)}
                className="inline-flex h-btn-sm w-btn-sm items-center justify-center rounded-sm border border-border bg-white text-text-secondary transition hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={!nextTaskId}
                onClick={() => nextTaskId && onOpenTask(nextTaskId)}
                className="inline-flex h-btn-sm w-btn-sm items-center justify-center rounded-sm border border-border bg-white text-text-secondary transition hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </button>
              <span className="tabular-nums text-small text-text-muted">{activeTask.createdAt}</span>
            </div>
          }
        >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-page-title font-page-title text-text-primary">{activeTask.taskName}</div>
                        <Badge tone={statusTone(activeTask.status)}>{statusLabel(activeTask.status)}</Badge>
                      </div>
                      <div className="mt-2 text-body text-text-secondary">
                        {activeTask.status === "failed"
                          ? activeTask.failureReason
                          : `任务文件名：${activeTask.fileName}`}
                      </div>
                    </div>

                    {activeTask.sourceTarget ? (
                      <button
                        type="button"
                        onClick={() => onOpenSource(activeTask)}
                        className="inline-flex items-center gap-1 text-body text-primary transition hover:text-primary-hover"
                      >
                        <span>打开来源页</span>
                        <ExternalLink aria-hidden="true" className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-0 overflow-hidden rounded-md border border-border">
                    {activeTask.detailSections.map((section, index) => (
                      <div
                        key={`${section.label}-${index}`}
                        className={`grid grid-cols-[120px_minmax(0,1fr)] gap-4 bg-white px-section py-3 ${
                          index === 0 ? "" : "border-t border-border"
                        }`}
                      >
                        <div className="text-small text-text-muted">{section.label}</div>
                        <div className="text-body text-text-primary">{section.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-4">
                    {activeTask.detailBlocks.map((block) => (
                      <section key={block.title} className="rounded-md border border-border bg-bg-subtle p-section">
                        <div className="text-body font-section-title text-text-primary">{block.title}</div>
                        <div className="mt-2 text-body leading-ui-relaxed text-text-secondary">{block.content}</div>
                      </section>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <Button size="sm" variant="secondary" onClick={onCloseTask}>
                      关闭
                    </Button>
                    {activeTask.status === "failed" ? (
                      <Button size="sm" variant="secondary" onClick={() => onRetryTask(activeTask)}>
                        <RotateCw aria-hidden="true" className="h-4 w-4" />
                        重试导出
                      </Button>
                    ) : null}
                    {(activeTask.status === "success" || activeTask.status === "downloaded") ? (
                      <Button size="sm" variant="primary" onClick={() => onDownloadTask(activeTask)}>
                        <Download aria-hidden="true" className="h-4 w-4" />
                        下载文件
                      </Button>
                    ) : null}
                  </div>
        </Drawer>
      ) : null}
    </div>
  );
}
