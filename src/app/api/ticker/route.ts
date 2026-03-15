export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDefaultSchoolId } from "@/lib/school"

export async function GET() {
  try {
    const schoolId = await getDefaultSchoolId()
    if (!schoolId) return NextResponse.json([])

    const messages = await prisma.tickerMessage.findMany({
      where: { schoolId },
      orderBy: { sortOrder: "asc" },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("/api/ticker GET failed", error)
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const schoolId = await getDefaultSchoolId()
    if (!schoolId) return NextResponse.json({ error: "Okul bulunamadi" }, { status: 404 })

    const body = await req.json()
    const count = await prisma.tickerMessage.count({ where: { schoolId } })
    const message = await prisma.tickerMessage.create({
      data: { schoolId, sortOrder: count, ...body },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("/api/ticker POST failed", error)
    return NextResponse.json({ error: "Kayit olusturulamadi" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...data } = body
    const message = await prisma.tickerMessage.update({ where: { id }, data })
    return NextResponse.json(message)
  } catch (error) {
    console.error("/api/ticker PUT failed", error)
    return NextResponse.json({ error: "Kayit guncellenemedi" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 })

    await prisma.tickerMessage.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("/api/ticker DELETE failed", error)
    return NextResponse.json({ error: "Kayit silinemedi" }, { status: 500 })
  }
}

