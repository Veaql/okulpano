export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDefaultSchoolId } from "@/lib/school"

export async function GET(req: NextRequest) {
  try {
    const schoolId = await getDefaultSchoolId()
    if (!schoolId) return NextResponse.json([])

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const weekday = searchParams.get("weekday")

    if (type === "assignments") {
      const assignments = await prisma.dutyAssignment.findMany({
        where: {
          schoolId,
          ...(weekday ? { weekday: parseInt(weekday, 10) } : {}),
        },
        include: { dutyLocation: true },
        orderBy: { sortOrder: "asc" },
      })
      return NextResponse.json(assignments)
    }

    const locations = await prisma.dutyLocation.findMany({
      where: { schoolId },
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json(locations)
  } catch (error) {
    console.error("/api/duty GET failed", error)
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const schoolId = await getDefaultSchoolId()
    if (!schoolId) return NextResponse.json({ error: "Okul bulunamadi" }, { status: 404 })

    const body = await req.json()
    const { type, ...data } = body

    if (type === "assignment") {
      const assignment = await prisma.dutyAssignment.create({
        data: { schoolId, ...data },
        include: { dutyLocation: true },
      })
      return NextResponse.json(assignment)
    }

    const location = await prisma.dutyLocation.create({
      data: { schoolId, ...data },
    })
    return NextResponse.json(location)
  } catch (error) {
    console.error("/api/duty POST failed", error)
    return NextResponse.json({ error: "Kayit olusturulamadi" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, id, ...data } = body

    if (type === "assignment") {
      const assignment = await prisma.dutyAssignment.update({
        where: { id },
        data,
        include: { dutyLocation: true },
      })
      return NextResponse.json(assignment)
    }

    const location = await prisma.dutyLocation.update({ where: { id }, data })
    return NextResponse.json(location)
  } catch (error) {
    console.error("/api/duty PUT failed", error)
    return NextResponse.json({ error: "Kayit guncellenemedi" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const type = searchParams.get("type")

    if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 })

    if (type === "assignment") {
      await prisma.dutyAssignment.delete({ where: { id } })
    } else {
      await prisma.dutyLocation.delete({ where: { id } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("/api/duty DELETE failed", error)
    return NextResponse.json({ error: "Kayit silinemedi" }, { status: 500 })
  }
}

