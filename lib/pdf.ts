import { PDFDocument } from "pdf-lib"

const PDF_PAGE_SIZE = 612
const STORYBOOK_IMAGE_COUNT = 7

type GenerateStorybookPdfInput = {
  images: readonly Uint8Array[]
  title: string
}

function isPng(bytes: Uint8Array) {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
}

function isJpeg(bytes: Uint8Array) {
  return (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  )
}

export function createStorybookPdfFileName(title: string) {
  const safeTitle = title
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .toLowerCase()
    .slice(0, 80)

  return `${safeTitle || "storybook"}.pdf`
}

export async function generateStorybookPdf({
  images,
  title,
}: GenerateStorybookPdfInput) {
  if (images.length !== STORYBOOK_IMAGE_COUNT) {
    throw new Error("A storybook PDF requires exactly 7 images.")
  }

  const document = await PDFDocument.create()
  document.setTitle(title)
  document.setCreator("Little Dreamer")
  document.setProducer("Little Dreamer")

  for (const bytes of images) {
    const image = isPng(bytes)
      ? await document.embedPng(bytes)
      : isJpeg(bytes)
        ? await document.embedJpg(bytes)
        : null

    if (!image) {
      throw new Error("Storybook PDFs support PNG and JPEG images only.")
    }

    const page = document.addPage([PDF_PAGE_SIZE, PDF_PAGE_SIZE])
    const size = image.scaleToFit(PDF_PAGE_SIZE, PDF_PAGE_SIZE)

    page.drawImage(image, {
      x: (PDF_PAGE_SIZE - size.width) / 2,
      y: (PDF_PAGE_SIZE - size.height) / 2,
      width: size.width,
      height: size.height,
    })
  }

  return document.save({ useObjectStreams: true })
}
