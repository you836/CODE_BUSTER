import React from "react";
import { cn } from "@/lib/utils";

export const Tooltip = ({ children, content, className }: { children: React.ReactNode, content: React.ReactNode, className?: string }) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className={cn("invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity bg-slate-800 text-slate-200 text-xs rounded py-1 px-2 absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap border border-slate-700 shadow-md", className)}>
        {content}
      </div>
    </div>
  );
};
