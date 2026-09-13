import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-slate-800 text-slate-100 hover:bg-slate-800/80",
        destructive: "border-transparent bg-danger text-destructive-foreground hover:bg-danger/80",
        outline: "text-foreground",
        critical: "border-transparent bg-critical text-white",
        high: "border-transparent bg-danger text-white",
        medium: "border-transparent bg-warning text-white",
        low: "border-transparent bg-success text-white",
        used: "border-transparent bg-success/20 text-success border-success/30",
        unused: "border-transparent bg-slate-700 text-slate-300",
        excessive: "border-transparent bg-danger/20 text-danger border-danger/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
