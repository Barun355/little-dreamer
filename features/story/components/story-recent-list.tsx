"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import type { StorybookSummary } from "../types"
import { StoryStatusBadge } from "./story-status-badge"

type StoryRecentListProps = {
  stories: StorybookSummary[]
}

export function StoryRecentList({ stories }: StoryRecentListProps) {
  const pathname = usePathname()

  if (stories.length === 0) {
    return (
      <Empty className="border-none p-4">
        <EmptyHeader>
          <EmptyMedia variant="icon" />
          <EmptyTitle>No stories yet</EmptyTitle>
          <EmptyDescription>
            Create your first personalized storybook to see it here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ScrollArea className="h-full max-h-[calc(100vh-16rem)]">
      <SidebarMenu>
        {stories.map((story) => {
          const href = `/dashboard/story/${story.id}`
          const isActive = pathname === href

          return (
            <SidebarMenuItem key={story.id}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                className="h-auto items-start py-2.5"
              >
                <Link href={href}>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate font-medium">
                        {story.childName}&apos;s {story.themeTitle.split(" ")[0]}
                      </span>
                    </div>
                    <StoryStatusBadge status={story.status} className="w-fit" />
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </ScrollArea>
  )
}
