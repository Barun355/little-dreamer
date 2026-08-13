import { StoryCreateForm } from "@/features/story/components/story-create-form"
import { getRecentStorybooks } from "@/features/story/actions/get-recent-storybooks"

export default async function DashboardPage() {
  const stories = await getRecentStorybooks()
  const isFirstStory = stories.length === 0

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <StoryCreateForm
        title={
          isFirstStory ? "Create your first storybook" : "Create a storybook"
        }
        description="Tell us about your child and we'll craft a magical personalized story where they're the hero."
      />
    </div>
  )
}
