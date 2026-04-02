import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

async function ensureThemeColumns() {
  const statements = [
    `ALTER TABLE settings ADD COLUMN background_pattern TEXT DEFAULT 'default-grid'`,
    `ALTER TABLE settings ADD COLUMN display_font TEXT DEFAULT 'system'`,
  ]

  for (const statement of statements) {
    try {
      await prisma.$executeRawUnsafe(statement)
    } catch {
      // SQLite duplicate column errors are safe to ignore here.
    }
  }
}

export async function GET() {
  try {
    await ensureThemeColumns()
    const school = await prisma.school.findFirst({ include: { settings: true } })

    if (!school) {
      return NextResponse.json({ error: "Okul bulunamadi" }, { status: 404 })
    }

    const now = new Date()
    const today = now.getDay()
    const weekday = today === 0 ? 7 : today

    const [dutyAssignments, announcements, mediaItems, scheduleBlocks, tickerMessages] = await Promise.all([
      prisma.dutyAssignment.findMany({
        where: { schoolId: school.id, weekday },
        include: { dutyLocation: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.announcement.findMany({
        where: {
          schoolId: school.id,
          isActive: true,
          OR: [
            { startsAt: null, endsAt: null },
            { startsAt: { lte: now }, endsAt: { gte: now } },
            { startsAt: { lte: now }, endsAt: null },
            { startsAt: null, endsAt: { gte: now } },
          ],
        },
        orderBy: [{ priority: "desc" }, { sortOrder: "asc" }],
      }),
      prisma.mediaItem.findMany({
        where: { schoolId: school.id, isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.scheduleBlock.findMany({
        where: { schoolId: school.id, dayType: "weekday" },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.tickerMessage.findMany({
        where: { schoolId: school.id, isActive: true },
        orderBy: [{ isEmergency: "desc" }, { sortOrder: "asc" }],
      }),
    ])

    const settings = school.settings
    const visibilityRows = await prisma.$queryRawUnsafe<
      Array<{
        showWeather: number | boolean | null
        showWidget: number | boolean | null
        backgroundPattern: string | null
        displayFont: string | null
      }>
    >(
      'SELECT show_weather AS showWeather, show_widget AS showWidget, background_pattern AS backgroundPattern, display_font AS displayFont FROM settings WHERE school_id = ? LIMIT 1',
      school.id,
    )
    const visibility = visibilityRows[0]

    return NextResponse.json({
      school: {
        name: school.name,
        shortName: school.shortName,
        logoUrl: school.logoUrl,
        city: school.city,
        district: school.district,
        slogan: school.slogan,
      },
      settings: {
        theme: settings?.theme ?? "resmi",
        primaryColor: settings?.primaryColor ?? "#1e3a5f",
        accentColor: settings?.accentColor ?? "#f59e0b",
        cardRadius: settings?.cardRadius ?? "12",
        fontScale: settings?.fontScale ?? "100",
        backgroundPattern: visibility?.backgroundPattern ?? "default-grid",
        displayFont: visibility?.displayFont ?? "system",
        dateFormat: settings?.dateFormat ?? "DD MMMM YYYY - dddd",
        timeFormat: settings?.timeFormat ?? "HH:mm",
        showSeconds: settings?.showSeconds ?? false,
        refreshInterval: settings?.refreshInterval ?? 15,
        activeWidget: settings?.activeWidget ?? "meal",
        widgetPosition: settings?.widgetPosition ?? "right",
        examName: settings?.examName ?? null,
        examDate: settings?.examDate?.toISOString() ?? null,
        trtCategory: settings?.trtCategory ?? "gundem",
        showTrtNews: settings?.showTrtNews ?? true,
        showWeather: visibility?.showWeather == null ? true : Boolean(visibility.showWeather),
        showWidget: visibility?.showWidget == null ? true : Boolean(visibility.showWidget),
        weatherCityCode: settings?.weatherCityCode ?? "34",
        weatherStation: settings?.weatherStation ?? null,
        weatherLabel: settings?.weatherLabel ?? null,
      },
      dutyTeachers: dutyAssignments.map((assignment) => ({
        id: assignment.id,
        personName: assignment.personName,
        locationName: assignment.dutyLocation.name,
        note: assignment.note,
        sortOrder: assignment.sortOrder,
      })),
      announcements: announcements.map((announcement) => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        startsAt: announcement.startsAt?.toISOString() ?? null,
        endsAt: announcement.endsAt?.toISOString() ?? null,
      })),
      mediaItems: mediaItems.map((item) => ({
        id: item.id,
        type: item.type,
        fileUrl: item.fileUrl,
        title: item.title,
        subtitle: item.subtitle,
        durationSeconds: item.durationSeconds,
      })),
      scheduleBlocks: scheduleBlocks.map((block) => ({
        id: block.id,
        blockType: block.blockType,
        label: block.label,
        startTime: block.startTime,
        endTime: block.endTime,
        sortOrder: block.sortOrder,
      })),
      tickerMessages: tickerMessages.map((item) => ({
        id: item.id,
        text: item.text,
        speed: item.speed,
        textColor: item.textColor,
        backgroundColor: item.backgroundColor,
        isEmergency: item.isEmergency,
      })),
    })
  } catch (error) {
    console.error("/api/display GET failed", error)
    return NextResponse.json({ error: "Display verisi okunamadi" }, { status: 500 })
  }
}
