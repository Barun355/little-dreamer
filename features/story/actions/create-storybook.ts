"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { inngest, STORYBOOK_GENERATION_REQUESTED } from "@/inngest/client"
import { requireUser } from "@/lib/auth/session"
import { createStorybookId } from "@/lib/id"
import { prisma } from "@/lib/db"
import { parseInput } from "@/lib/validation"

import { getStoryThemeById } from "../constants/themes"
import {
  createStorybookFormSchema,
  createStorybookInputSchema,
  mapFormErrors,
} from "../schemas"

export async function createStorybook(formData: FormData) {
  const user = await requireUser()
  const photo = formData.get("photo")

  const parsedForm = createStorybookFormSchema.safeParse({
    childName: formData.get("childName"),
    childAge: formData.get("childAge"),
    themeId: formData.get("themeId"),
    photo,
  })

  if (!parsedForm.success) {
    throw new Error(
      Object.values(mapFormErrors(parsedForm.error)).join(", ") ||
        "Invalid storybook form submission."
    )
  }

  const theme = getStoryThemeById(parsedForm.data.themeId)

  if (!theme) {
    throw new Error("Please choose a valid story theme.")
  }

  const storybookId = createStorybookId()
  const photoBuffer = Buffer.from(await parsedForm.data.photo.arrayBuffer())
  const input = parseInput(createStorybookInputSchema, {
    storybookId,
    childName: parsedForm.data.childName,
    childAge: Number(parsedForm.data.childAge),
    themeId: parsedForm.data.themeId,
    photo: {
      base64: photoBuffer.toString("base64"),
      contentType: parsedForm.data.photo.type,
      fileName: parsedForm.data.photo.name,
      size: parsedForm.data.photo.size,
    },
  })

  await prisma.storybook.create({
    data: {
      id: storybookId,
      userId: user.id,
      childName: input.childName,
      childAge: input.childAge,
      theme: {
        title: theme.title,
        baseStory: theme.baseStory,
      },
      status: "GENERATING",
    },
  })

  await inngest.send({
    name: STORYBOOK_GENERATION_REQUESTED,
    data: input,
  })

  revalidatePath("/dashboard")
  redirect(`/dashboard/story/${storybookId}`)
}
