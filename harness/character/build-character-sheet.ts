/** Seed guidance for the model when locking a reusable character visual sheet. */
export function buildCharacterSheetHints(params: {
  childName: string
  childAge: number
  themeTitle: string
  hasAttachedPhoto?: boolean
}): string {
  const photoLine = params.hasAttachedPhoto
    ? "A reference photo of the child is attached to this message. Study it carefully and lock character.visualDescription to the child's real appearance (hair, skin tone, eyes, face shape, typical clothing if visible)."
    : "No reference photo was attached; invent a concrete, consistent look for the child."

  return `Character lock requirements:
- Hero name: ${params.childName}
- Age: ${params.childAge}
- Theme: ${params.themeTitle}
- ${photoLine}
- character.name must equal "${params.childName}".
- character.visualDescription must be a concrete, reusable look sheet: hair, skin tone, eyes, typical clothing/colors, approximate size/age look.
- Keep the same outfit and features across every page unless a page scene explicitly changes clothes.
- Do not put action or setting details in visualDescription.
- Do not invent features that contradict the attached photo when a photo is present.`
}
