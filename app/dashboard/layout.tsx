import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getRecentStorybooks } from "@/features/story/actions/get-recent-storybooks"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const stories = await getRecentStorybooks()

  return <DashboardShell stories={stories}>{children}</DashboardShell>
}
