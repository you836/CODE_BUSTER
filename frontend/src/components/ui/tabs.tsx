import React, { useState, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextType {
  value: string;
  onValueChange: (v: string) => void;
}
const TabsContext = createContext<TabsContextType>({ value: '', onValueChange: () => {} });

export const Tabs = ({ value, onValueChange, defaultValue, className, children }: { value?: string, onValueChange?: (v: string) => void, defaultValue?: string, className?: string, children: React.ReactNode }) => {
  const [internalVal, setInternalVal] = useState(defaultValue || '');
  const activeValue = value !== undefined ? value : internalVal;
  const changeHandler = onValueChange || setInternalVal;

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: changeHandler }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-slate-800 p-1 text-slate-400", className)} {...props} />
);

export const TabsTrigger = ({ value, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) => {
  const ctx = useContext(TabsContext);
  const isActive = ctx.value === value;
  return (
    <button
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-slate-950 text-slate-50 shadow-sm" : "hover:text-slate-100 hover:bg-slate-700/50",
        className
      )}
      {...props}
    />
  );
};

export const TabsContent = ({ value, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { value: string }) => {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;
  return (
    <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)} {...props} />
  );
};
