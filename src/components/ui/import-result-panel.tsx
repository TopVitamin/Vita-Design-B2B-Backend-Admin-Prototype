import type { ReactNode } from "react";
import { Banner } from "./banner";
import { Button } from "./button";

type ImportResultTone = "success" | "warning" | "error";
type ImportResultMetricTone = "default" | "success" | "error";

type ImportResultMetric = {
  value: ReactNode;
  label: ReactNode;
  tone?: ImportResultMetricTone;
};

type ImportResultDetailColumn = {
  key: string;
  label: ReactNode;
};

type ImportResultDetailRow = Record<string, ReactNode>;

type ImportResultPanelProps = {
  tone: ImportResultTone;
  title: ReactNode;
  description: ReactNode;
  metrics: ImportResultMetric[];
  detailColumns?: ImportResultDetailColumn[];
  detailRows?: ImportResultDetailRow[];
  detailAction?: ReactNode;
  onReset: () => void;
  onClose: () => void;
  resetLabel?: ReactNode;
  closeLabel?: ReactNode;
};

function metricToneClass(tone: ImportResultMetricTone = "default") {
  if (tone === "success") {
    return "text-success";
  }
  if (tone === "error") {
    return "text-danger";
  }
  return "text-text-primary";
}

export function ImportResultPanel({
  tone,
  title,
  description,
  metrics,
  detailColumns = [],
  detailRows = [],
  detailAction,
  onReset,
  onClose,
  resetLabel = "重新导入",
  closeLabel = "完成",
}: ImportResultPanelProps) {
  const showDetail = detailColumns.length > 0 && detailRows.length > 0;

  return (
    <div className="space-y-3">
      <Banner tone={tone} title={title} description={description} />

      <div className="grid gap-2.5 md:grid-cols-3">
        {metrics.map((metric) => (
          <div key={String(metric.label)} className="rounded-md border border-border bg-bg-subtle px-4 py-3.5">
            <div className={`text-[28px] font-section-title leading-none tracking-tight tabular-nums ${metricToneClass(metric.tone)}`}>
              {metric.value}
            </div>
            <div className="mt-3 text-small leading-ui-tight text-text-muted">{metric.label}</div>
          </div>
        ))}
      </div>

      {showDetail ? (
        <div className="rounded-md border border-border bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="font-body-strong text-text-primary">失败明细</span>
            {detailAction}
          </div>
          <table>
            <thead>
              <tr>
                {detailColumns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detailRows.map((row, index) => (
                <tr key={String(row.id ?? index)}>
                  {detailColumns.map((column) => (
                    <td key={column.key}>{row[column.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="flex justify-end gap-2 border-t border-border pt-3">
        <Button onClick={onReset}>{resetLabel}</Button>
        <Button variant="primary" onClick={onClose}>
          {closeLabel}
        </Button>
      </div>
    </div>
  );
}
