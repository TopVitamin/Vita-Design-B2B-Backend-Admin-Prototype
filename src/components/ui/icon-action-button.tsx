import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Button } from "./button";

type IconActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
};

export function IconActionButton({
  label,
  className,
  children,
  ...props
}: IconActionButtonProps) {
  return (
    <div className="group relative inline-flex">
      <Button
        size="sm"
        className={cn("w-btn-sm px-0", className)}
        aria-label={label}
        {...props}
      >
        {children}
      </Button>
      <div className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-[80] -translate-x-1/2 opacity-0 transition duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        <div className="relative whitespace-nowrap rounded-sm bg-[#1f2430] px-2 py-1 text-mini text-white shadow-sm">
          {label}
          <span className="absolute bottom-full left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1 rotate-45 bg-[#1f2430]" />
        </div>
      </div>
    </div>
  );
}
