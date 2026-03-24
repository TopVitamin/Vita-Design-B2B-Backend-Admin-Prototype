import { useEffect, useMemo, useState } from "react";
import { cn } from "../../lib/cn";
import { Button } from "./button";
import { Select } from "./select";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  pageSizeOptions?: number[];
  showTopBorder?: boolean;
  className?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  pageSizeOptions = [20, 50, 100],
  showTopBorder = false,
  className,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const normalizedTotalPages = Math.max(totalPages, 1);
  const [jumpPage, setJumpPage] = useState(String(currentPage));

  useEffect(() => {
    setJumpPage(String(Math.min(Math.max(currentPage, 1), normalizedTotalPages)));
  }, [currentPage, normalizedTotalPages]);

  const options = useMemo(
    () => pageSizeOptions.map((size) => ({ label: `${size}条`, value: String(size) })),
    [pageSizeOptions],
  );

  function goToPage(rawValue: string) {
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) {
      return;
    }

    const normalized = Math.min(Math.max(parsed, 1), normalizedTotalPages);
    onPageChange(normalized);
    setJumpPage(String(normalized));
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-actions px-4 py-3 text-small text-text-muted",
        showTopBorder && "border-t border-border",
        className,
      )}
    >
      <span>共{totalCount}条</span>
      <div className="flex flex-wrap items-center gap-actions">
        <label className="flex items-center gap-control">
          <span>每页</span>
          <Select
            className="h-input-sm w-[92px] bg-white"
            value={String(pageSize)}
            menuDensity="compact"
            onValueChange={(nextValue) => onPageSizeChange(Number(nextValue))}
            options={options}
          />
        </label>
        <span>
          {Math.min(Math.max(currentPage, 1), normalizedTotalPages)}/{normalizedTotalPages}页
        </span>
        <Button size="sm" disabled={currentPage <= 1} onClick={() => onPageChange(Math.max(currentPage - 1, 1))}>
          上一页
        </Button>
        <Button
          size="sm"
          disabled={totalCount === 0 || currentPage >= normalizedTotalPages}
          onClick={() => onPageChange(Math.min(currentPage + 1, normalizedTotalPages))}
        >
          下一页
        </Button>
        <div className="flex items-center gap-control">
          <span>跳转</span>
          <input
            className="field-control h-input-sm w-14"
            inputMode="numeric"
            placeholder="请输入"
            value={jumpPage}
            onChange={(event) => setJumpPage(event.target.value.replace(/[^\d]/g, ""))}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                goToPage(jumpPage || "1");
              }
            }}
          />
          <Button size="sm" onClick={() => goToPage(jumpPage || "1")}>
            确定
          </Button>
        </div>
      </div>
    </div>
  );
}
