import { Check, Loader2, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { StorybookStatus } from "@/lib/generated/prisma/client"
import { cn } from "@/lib/utils"

const statusConfig: Record<
  StorybookStatus,
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
    icon: typeof Check
    className?: string
  }
> = {
  COMPLETED: {
    label: "Completed",
    variant: "secondary",
    icon: Check,
    className: "text-emerald-700 dark:text-emerald-300",
  },
  GENERATING: {
    label: "Generating",
    variant: "outline",
    icon: Loader2,
    className: "text-amber-700 dark:text-amber-300",
  },
  FAILED: {
    label: "Failed",
    variant: "destructive",
    icon: XCircle,
  },
  DRAFT: {
    label: "Draft",
    variant: "outline",
    icon: Loader2,
  },
}

type StoryStatusBadgeProps = {
  status: StorybookStatus
  className?: string
}

export function StoryStatusBadge({ status, className }: StoryStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={cn("gap-1", config.className, className)}>
      <Icon className={cn(status === "GENERATING" && "animate-spin")} />
      {config.label}
    </Badge>
  )
}
