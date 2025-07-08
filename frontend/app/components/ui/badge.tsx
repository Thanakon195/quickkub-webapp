import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        info:
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
        pending:
          "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200",
        processing:
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
        completed:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        failed:
          "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
        cancelled:
          "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200",
        refunded:
          "border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200",
        active:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        inactive:
          "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200",
        suspended:
          "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
        verified:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        unverified:
          "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <div
          className={cn(
            "mr-1 h-1.5 w-1.5 rounded-full",
            {
              "bg-primary-foreground": variant === "default",
              "bg-secondary-foreground": variant === "secondary",
              "bg-destructive-foreground": variant === "destructive",
              "bg-foreground": variant === "outline",
              "bg-green-600": variant === "success" || variant === "completed" || variant === "active" || variant === "verified",
              "bg-yellow-600": variant === "warning" || variant === "pending" || variant === "unverified",
              "bg-blue-600": variant === "info" || variant === "processing",
              "bg-gray-600": variant === "inactive" || variant === "cancelled",
              "bg-red-600": variant === "failed" || variant === "suspended",
              "bg-purple-600": variant === "refunded",
            }
          )}
        />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }