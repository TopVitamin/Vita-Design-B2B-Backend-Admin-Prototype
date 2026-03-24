import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, X } from "lucide-react";

type DateRangeValue = {
  start: string;
  end: string;
};

type DateRangePreset = {
  label: string;
  start: string;
  end: string;
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function subtractDays(days: number) {
  const next = new Date();
  next.setDate(next.getDate() - days);
  return formatDate(next);
}

export function DateRangePicker({
  value,
  onChange,
  presets,
}: {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  presets?: DateRangePreset[];
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRangeValue>(value);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const builtinPresets = useMemo<DateRangePreset[]>(
    () =>
      presets ?? [
        { label: "今天", start: formatDate(new Date()), end: formatDate(new Date()) },
        { label: "近7天", start: subtractDays(6), end: formatDate(new Date()) },
        { label: "近30天", start: subtractDays(29), end: formatDate(new Date()) },
      ],
    [presets],
  );

  useEffect(() => {
    setDraft(value);
  }, [value.end, value.start]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current) {
        return;
      }
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const displayText =
    draft.start && draft.end ? `${draft.start} - ${draft.end}` : "请选择日期范围";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-input-md items-center gap-2 rounded-sm border border-border bg-white px-3 text-body text-text-secondary transition hover:bg-bg-hover"
      >
        <CalendarDays aria-hidden="true" className="h-4 w-4" />
        <span>{displayText}</span>
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-30 w-[320px] rounded-md border border-border bg-white p-4 shadow-md">
          <div className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              {builtinPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setDraft({ start: preset.start, end: preset.end })}
                  className="rounded-full border border-border bg-white px-3 py-1 text-small text-text-secondary transition hover:bg-bg-hover hover:text-text-primary"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="field-label">开始日期</div>
                <input
                  className="field-control"
                  type="date"
                  value={draft.start}
                  onChange={(event) => setDraft((current) => ({ ...current, start: event.target.value }))}
                />
              </div>
              <div>
                <div className="field-label">结束日期</div>
                <input
                  className="field-control"
                  type="date"
                  value={draft.end}
                  onChange={(event) => setDraft((current) => ({ ...current, end: event.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <button
                type="button"
                onClick={() => {
                  setDraft({ start: "", end: "" });
                  onChange({ start: "", end: "" });
                  setOpen(false);
                }}
                className="inline-flex items-center gap-1 text-small text-text-muted transition hover:text-text-primary"
              >
                <X aria-hidden="true" className="h-4 w-4" />
                清空
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraft(value);
                    setOpen(false);
                  }}
                  className="inline-flex h-btn-sm items-center rounded-sm border border-border bg-white px-btn-sm-x text-small text-text-secondary transition hover:bg-bg-hover"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange(draft);
                    setOpen(false);
                  }}
                  className="inline-flex h-btn-sm items-center rounded-sm border border-primary bg-primary px-btn-sm-x text-small text-white transition hover:bg-primary-hover hover:border-primary-hover"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
