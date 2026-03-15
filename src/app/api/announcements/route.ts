export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDefaultSchoolId } from "@/lib/school"

export async function GET() {
  try {
    const schoolId = await getDefaultSchoolId()
    if (!schoolId) return NextResponse.json([])

    const announcements = await prisma.announcement.findMany({
      where: { schoolId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error("/api/announcements GET failed", error)
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const schoolId = await getDefaultSchoolId()
    if (!schoolId) return NextResponse.json({ error: "Okul bulunamadi" }, { status: 404 })

    const body = await req.json()
    const announcement = await prisma.announcement.create({ data: { schoolId, ...body } })
    return NextResponse.json(announcement)
  } catch (error) {
    console.error("/api/announcements POST failed", error)
    return NextResponse.json({ error: "Kayit olusturulamadi" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...data } = body
    const announcement = await prisma.announcement.update({ where: { id }, data })
    return NextResponse.json(announcement)
  } catch (error) {
    console.error("/api/announcements PUT failed", error)
    return NextResponse.json({ error: "Kayit guncellenemedi" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 })

    await prisma.announcement.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("/api/announcements DELETE failed", error)
    return NextResponse.json({ error: "Kayit silinemedi" }, { status: 500 })
  }
}

