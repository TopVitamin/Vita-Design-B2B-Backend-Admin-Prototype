import { cn } from "../../lib/cn";

export type TimelineItem = {
  id: string;
  time: string;
  title: string;
  description?: string;
  tone?: "default" | "success" | "warning" | "error" | "info";
  meta?: string;
};

function toneClassName(tone: TimelineItem["tone"]) {
  if (tone === "success") return "bg-success";
  if (tone === "warning") return "bg-warning";
  if (tone === "error") return "bg-danger";
  if (tone === "info") return "bg-info";
  return "bg-border-strong";
}

export function Timeline({
  items,
}: {
  items: TimelineItem[];
}) {
  return (
    <div className="space-y-0">
      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-4 pl-2">
          <div className="relative flex w-5 shrink-0 justify-center">
            <span className={cn("mt-1.5 inline-flex h-2.5 w-2.5 rounded-full", toneClassName(item.tone))} />
            {index < items.length - 1 ? <span className="absolute top-5 h-[calc(100%-10px)] w-px bg-border-default" /> : null}
          </div>
          <div className="min-w-0 flex-1 border-b border-border py-3 last:border-b-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-body font-body-strong text-text-primary">{item.title}</div>
              <div className="tabular-nums text-small text-text-muted">{item.time}</div>
            </div>
            {item.meta ? <div className="mt-1 text-small text-text-secondary">{item.meta}</div> : null}
            {item.description ? <div className="mt-2 text-body leading-ui-relaxed text-text-secondary">{item.description}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
