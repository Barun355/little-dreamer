import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getRecentStorybooks } from "@/features/story/actions/get-recent-storybooks"
import { requireUser } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await requireUser()
  const stories = await getRecentStorybooks()

  return (
    <DashboardShell user={user} stories={stories}>
      {children}
    </DashboardShell>
  )
}
