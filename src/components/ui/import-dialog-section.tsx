import type { ReactNode } from "react";
import { Banner } from "./banner";
import { Button } from "./button";
import { SegmentedControl } from "./segmented-control";
import { UploadDropzone } from "./upload-dropzone";

type ImportModeItem = {
  label: string;
  value: string;
};

type ImportSelectStageProps = {
  intro: ReactNode;
  templateName: string;
  templateDescription: ReactNode;
  modeItems: ImportModeItem[];
  modeValue: string;
  onModeChange: (value: string) => void;
  onClose: () => void;
  onStart: () => void;
};

type ImportLoadingStateProps = {
  title: ReactNode;
  description: ReactNode;
};

export function ImportSelectStage({
  intro,
  templateName,
  templateDescription,
  modeItems,
  modeValue,
  onModeChange,
  onClose,
  onStart,
}: ImportSelectStageProps) {
  return (
    <div className="space-y-3">
      <Banner tone="info" title={intro} />
      <div className="rounded-md border border-border bg-white px-4 py-4 shadow-xs">
        <div className="text-body font-body-strong text-text-primary">{templateName}</div>
        <div className="mt-1.5 text-small leading-ui-relaxed text-text-muted">{templateDescription}</div>
        <Button className="mt-2.5" size="sm">
          下载模板
        </Button>
      </div>
      <UploadDropzone />
      <div className="rounded-md border border-border bg-white px-4 py-3 shadow-xs">
        <div className="mb-2 text-small text-text-muted">结果演示模式</div>
        <div className="flex gap-2">
          <SegmentedControl items={modeItems} value={modeValue} onChange={onModeChange} />
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-border pt-3">
        <Button onClick={onClose}>取消</Button>
        <Button variant="primary" onClick={onStart}>
          开始导入
        </Button>
      </div>
    </div>
  );
}

export function ImportLoadingState({
  title,
  description,
}: ImportLoadingStateProps) {
  return (
    <div className="space-y-3 py-7 text-center">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-bg-hover border-t-primary" />
      <div className="text-body text-text-primary">{title}</div>
      <div className="text-small leading-ui-relaxed text-text-muted">{description}</div>
    </div>
  );
}
