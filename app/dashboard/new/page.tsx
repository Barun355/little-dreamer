import { StoryCreateForm } from "@/features/story/components/story-create-form"

export default function NewStoryPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <StoryCreateForm
        title="New storybook"
        description="Share a few details about the child, choose a theme, and start a brand-new adventure."
      />
    </div>
  )
}
