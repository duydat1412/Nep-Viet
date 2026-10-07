import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-nep-red text-white hover:bg-nep-red/80",
        secondary:
          "border-transparent bg-nep-ink/10 text-nep-ink hover:bg-nep-ink/20",
        destructive:
          "border-transparent bg-rose-500 text-white hover:bg-rose-600",
        outline: "text-nep-ink border-nep-ink/20",
        xanh: "border-emerald-200 bg-emerald-50 text-emerald-800",
        vang: "border-amber-200 bg-amber-50 text-amber-800",
        do: "border-rose-200 bg-rose-50 text-rose-800",
        chuaducancu: "border-gray-200 bg-gray-50 text-gray-800",
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
