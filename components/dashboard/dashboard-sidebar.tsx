"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  ChevronDown,
  LogOut,
  Plus,
  Settings,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { StoryRecentList } from "@/features/story/components/story-recent-list"
import type { StorybookSummary } from "@/features/story/types"

type DashboardSidebarProps = {
  stories: StorybookSummary[]
}

export function DashboardSidebar({ stories }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles />
                </span>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Little Dreamer</span>
                  <span className="text-xs text-muted-foreground">
                    Story studio
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Button asChild className="w-full justify-start">
              <Link href="/dashboard/new">
                <Plus data-icon="inline-start" />
                New Story
              </Link>
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup className="flex min-h-0 flex-1 flex-col">
          <SidebarGroupLabel>Recent</SidebarGroupLabel>
          <SidebarGroupContent className="min-h-0 flex-1">
            <StoryRecentList stories={stories} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/dashboard/notifications"}>
              <Link href="/dashboard">
                <Bell />
                <span>Notifications</span>
                <Badge variant="secondary" className="ml-auto">
                  1
                </Badge>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="size-8">
                    <AvatarFallback>AL</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium">Alex</span>
                    <span className="text-xs text-muted-foreground">Guest</span>
                  </div>
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>My account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
