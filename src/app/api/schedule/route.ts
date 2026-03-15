export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDefaultSchoolId } from "@/lib/school"

export async function GET() {
  try {
    const schoolId = await getDefaultSchoolId()
    if (!schoolId) return NextResponse.json([])

    const blocks = await prisma.scheduleBlock.findMany({
      where: { schoolId },
      orderBy: { sortOrder: "asc" },
    })

    return NextResponse.json(blocks)
  } catch (error) {
    console.error("/api/schedule GET failed", error)
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const schoolId = await getDefaultSchoolId()
    if (!schoolId) return NextResponse.json({ error: "Okul bulunamadi" }, { status: 404 })

    const body = await req.json()
    const block = await prisma.scheduleBlock.create({ data: { schoolId, ...body } })
    return NextResponse.json(block)
  } catch (error) {
    console.error("/api/schedule POST failed", error)
    return NextResponse.json({ error: "Kayit olusturulamadi" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...data } = body
    const block = await prisma.scheduleBlock.update({ where: { id }, data })
    return NextResponse.json(block)
  } catch (error) {
    console.error("/api/schedule PUT failed", error)
    return NextResponse.json({ error: "Kayit guncellenemedi" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 })

    await prisma.scheduleBlock.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("/api/schedule DELETE failed", error)
    return NextResponse.json({ error: "Kayit silinemedi" }, { status: 500 })
  }
}

