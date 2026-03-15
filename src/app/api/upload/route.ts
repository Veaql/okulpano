export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getDefaultSchoolId } from "@/lib/school"
import { mkdir, writeFile } from "fs/promises"
import path from "path"

const allowedFolders = new Set(["logos", "media"])
const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp"])

export async function POST(req: NextRequest) {
  try {
    const schoolId = await getDefaultSchoolId()
    if (!schoolId) {
      return NextResponse.json({ error: "Okul bulunamadi" }, { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const requestedFolder = (formData.get("folder") as string | null) ?? "logos"
    const folder = allowedFolders.has(requestedFolder) ? requestedFolder : "logos"

    if (!file) {
      return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Desteklenmeyen dosya turu" }, { status: 400 })
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    if (!allowedExtensions.has(ext)) {
      return NextResponse.json({ error: "Gecersiz dosya uzantisi" }, { status: 400 })
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const uploadDir = path.join(process.cwd(), "public", "uploads", schoolId, folder)
    await mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(uploadDir, fileName), buffer)

    return NextResponse.json({ url: `/uploads/${schoolId}/${folder}/${fileName}` })
  } catch (error) {
    console.error("/api/upload POST failed", error)
    return NextResponse.json({ error: "Yukleme basarisiz" }, { status: 500 })
  }
}
