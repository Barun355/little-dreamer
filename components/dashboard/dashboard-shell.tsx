"use client"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import type { StorybookSummary } from "@/features/story/types"

import { DashboardSidebar } from "./dashboard-sidebar"

type DashboardShellProps = {
  children: React.ReactNode
  stories: StorybookSummary[]
}

export function DashboardShell({ children, stories }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <DashboardSidebar stories={stories} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm text-muted-foreground">
            Personalized storybooks
          </span>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
