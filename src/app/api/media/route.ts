export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDefaultSchoolId } from "@/lib/school"
import { writeFile, mkdir, unlink } from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const schoolId = await getDefaultSchoolId()
    if (!schoolId) return NextResponse.json([])

    const items = await prisma.mediaItem.findMany({
      where: { schoolId },
      orderBy: { sortOrder: "asc" },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("/api/media GET failed", error)
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const schoolId = await getDefaultSchoolId()
    if (!schoolId) return NextResponse.json({ error: "Okul bulunamadi" }, { status: 404 })

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const title = (formData.get("title") as string) || null
    const subtitle = (formData.get("subtitle") as string) || null
    const duration = parseInt((formData.get("duration") as string) || "5", 10)

    if (!file) {
      return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Desteklenmeyen dosya turu" }, { status: 400 })
    }

    const maxSize = file.type.startsWith("video/")
      ? parseInt(process.env.UPLOAD_MAX_VIDEO_MB || "50", 10) * 1024 * 1024
      : parseInt(process.env.UPLOAD_MAX_IMAGE_MB || "10", 10) * 1024 * 1024

    if (file.size > maxSize) {
      return NextResponse.json({ error: `Dosya boyutu cok buyuk. Maksimum: ${maxSize / 1024 / 1024}MB` }, { status: 400 })
    }

    const ext = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const uploadDir = path.join(process.cwd(), "public", "uploads", schoolId, "media")
    await mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${schoolId}/media/${fileName}`
    const type = file.type.startsWith("video/") ? "video" : "image"
    const count = await prisma.mediaItem.count({ where: { schoolId } })

    const mediaItem = await prisma.mediaItem.create({
      data: {
        schoolId,
        type,
        fileUrl,
        title,
        subtitle,
        durationSeconds: duration,
        sortOrder: count,
      },
    })

    return NextResponse.json(mediaItem)
  } catch (error) {
    console.error("/api/media POST failed", error)
    return NextResponse.json({ error: "Yukleme basarisiz" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 })

    const item = await prisma.mediaItem.findUnique({ where: { id } })
    if (item) {
      try {
        const relativePath = item.fileUrl.replace(/^\/+/, "")
        const filePath = path.join(process.cwd(), "public", relativePath)
        await unlink(filePath)
      } catch {
        // ignore missing file
      }
      await prisma.mediaItem.delete({ where: { id } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("/api/media DELETE failed", error)
    return NextResponse.json({ error: "Kayit silinemedi" }, { status: 500 })
  }
}

