import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getStorybookById } from "@/features/story/actions/get-storybook-by-id"
import { StoryGeneratingPoller } from "@/features/story/components/story-generating-poller"
import { StoryStatusBadge } from "@/features/story/components/story-status-badge"

type StoryDetailPageProps = {
  params: Promise<{ storyId: string }>
}

export default async function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { storyId } = await params
  const storybook = await getStorybookById(storyId)
  const generatedStory = storybook.resources?.story
  const storyImages = storybook.resources?.story_images

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      {storybook.status === "GENERATING" ? <StoryGeneratingPoller /> : null}
      <Button asChild variant="ghost" className="w-fit">
        <Link href="/dashboard">
          <ArrowLeft data-icon="inline-start" />
          Back to dashboard
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-2xl">
                {generatedStory?.title ??
                  `${storybook.childName}'s storybook`}
              </CardTitle>
              <CardDescription>
                {storybook.theme?.title ?? "Personalized adventure"} · Age{" "}
                {storybook.childAge}
              </CardDescription>
            </div>
            <StoryStatusBadge status={storybook.status} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {storybook.status === "GENERATING" ? (
            <p className="text-sm text-muted-foreground">
              We&apos;re creating {storybook.childName}&apos;s storybook now.
              This page will update once the story and illustrations are ready.
            </p>
          ) : null}

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <BookOpen />
              {generatedStory ? "Generated story" : "Theme preview"}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {generatedStory?.baseStory ??
                storybook.theme?.baseStory ??
                "Your personalized story will appear here once generation is complete."}
            </p>
          </div>

          {storyImages?.frontCover ? (
            <div className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={storyImages.frontCover}
                  alt={`${storybook.childName}'s storybook front cover`}
                  className="aspect-square w-full object-cover"
                />
              </div>
            </div>
          ) : null}

          {generatedStory?.pages.length ? (
            <div className="flex flex-col gap-3">
              {generatedStory.pages.map((page, index) => (
                <div key={page.pageNumber} className="rounded-xl border p-4">
                  {storyImages?.stories[index] ? (
                    <div className="mb-4 overflow-hidden rounded-lg border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={storyImages.stories[index]}
                        alt={`Illustration for page ${page.pageNumber}`}
                        className="aspect-square w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Page {page.pageNumber}
                  </p>
                  <p className="text-sm leading-relaxed">{page.text}</p>
                </div>
              ))}
            </div>
          ) : null}

          {storyImages?.backCover ? (
            <div className="overflow-hidden rounded-xl border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={storyImages.backCover}
                alt={`${storybook.childName}'s storybook back cover`}
                className="aspect-square w-full object-cover"
              />
            </div>
          ) : null}

          {storybook.status === "FAILED" ? (
            <p className="text-sm text-destructive">
              Something went wrong while creating this storybook. Please try
              creating a new one.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
