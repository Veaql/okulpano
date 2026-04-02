export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const defaultSettings = {
  theme: "modern",
  primaryColor: "#1e3a5f",
  accentColor: "#f59e0b",
  cardRadius: "12",
  fontScale: "100",
  backgroundPattern: "default-grid",
  displayFont: "system",
  dateFormat: "DD MMMM YYYY - dddd",
  timeFormat: "HH:mm",
  showSeconds: false,
  refreshInterval: 15,
  activeWidget: "meal",
  widgetPosition: "right",
  examName: "YKS",
  examDate: null as Date | null,
  trtCategory: "gundem",
  showTrtNews: true,
  showWeather: true,
  showWidget: true,
  weatherCityCode: "34",
  weatherStation: null as string | null,
  weatherLabel: null as string | null,
}

const prismaDefaultSettings = {
  theme: defaultSettings.theme,
  primaryColor: defaultSettings.primaryColor,
  accentColor: defaultSettings.accentColor,
  cardRadius: defaultSettings.cardRadius,
  fontScale: defaultSettings.fontScale,
  dateFormat: defaultSettings.dateFormat,
  timeFormat: defaultSettings.timeFormat,
  showSeconds: defaultSettings.showSeconds,
  refreshInterval: defaultSettings.refreshInterval,
  activeWidget: defaultSettings.activeWidget,
  widgetPosition: defaultSettings.widgetPosition,
  examName: defaultSettings.examName,
  examDate: defaultSettings.examDate,
  trtCategory: defaultSettings.trtCategory,
  showTrtNews: defaultSettings.showTrtNews,
  weatherCityCode: defaultSettings.weatherCityCode,
  weatherStation: defaultSettings.weatherStation,
  weatherLabel: defaultSettings.weatherLabel,
}

function fallbackPayload() {
  return {
    id: "",
    name: "",
    shortName: null,
    logoUrl: null,
    city: null,
    district: null,
    slogan: null,
    timezone: "Europe/Istanbul",
    settings: {
      ...defaultSettings,
      examDate: null,
    },
  }
}

function parseExamDate(value: unknown) {
  if (value === null) {
    return null
  }

  if (typeof value !== "string" || !value.trim()) {
    return undefined
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function sanitizeSettingsPatch(input: Record<string, unknown> | null | undefined) {
  if (!input) {
    return null
  }

  const patch: Record<string, unknown> = {}

  if (typeof input.theme === "string") patch.theme = input.theme
  if (typeof input.primaryColor === "string") patch.primaryColor = input.primaryColor
  if (typeof input.accentColor === "string") patch.accentColor = input.accentColor
  if (typeof input.cardRadius === "string") patch.cardRadius = input.cardRadius
  if (typeof input.fontScale === "string") patch.fontScale = input.fontScale
  if (typeof input.backgroundPattern === "string") patch.backgroundPattern = input.backgroundPattern
  if (typeof input.displayFont === "string") patch.displayFont = input.displayFont
  if (typeof input.dateFormat === "string") patch.dateFormat = input.dateFormat
  if (typeof input.timeFormat === "string") patch.timeFormat = input.timeFormat
  if (typeof input.showSeconds === "boolean") patch.showSeconds = input.showSeconds
  if (typeof input.refreshInterval === "number") patch.refreshInterval = input.refreshInterval
  if (typeof input.activeWidget === "string") patch.activeWidget = input.activeWidget
  if (typeof input.widgetPosition === "string") patch.widgetPosition = input.widgetPosition
  if (typeof input.examName === "string" || input.examName === null) patch.examName = input.examName

  const parsedExamDate = parseExamDate(input.examDate)
  if (parsedExamDate !== undefined) patch.examDate = parsedExamDate

  if (typeof input.trtCategory === "string") patch.trtCategory = input.trtCategory
  if (typeof input.showTrtNews === "boolean") patch.showTrtNews = input.showTrtNews
  if (typeof input.showWeather === "boolean") patch.showWeather = input.showWeather
  if (typeof input.showWidget === "boolean") patch.showWidget = input.showWidget
  if (typeof input.weatherCityCode === "string") patch.weatherCityCode = input.weatherCityCode
  if (typeof input.weatherStation === "string" || input.weatherStation === null) patch.weatherStation = input.weatherStation
  if (typeof input.weatherLabel === "string" || input.weatherLabel === null) patch.weatherLabel = input.weatherLabel

  return Object.keys(patch).length > 0 ? patch : null
}

async function readExtraSettings(schoolId: string) {
  const rows = await prisma.$queryRawUnsafe<
    Array<{
      showWeather: number | boolean | null
      showWidget: number | boolean | null
      backgroundPattern: string | null
      displayFont: string | null
    }>
  >(
    'SELECT show_weather AS showWeather, show_widget AS showWidget, background_pattern AS backgroundPattern, display_font AS displayFont FROM settings WHERE school_id = ? LIMIT 1',
    schoolId,
  )

  const row = rows[0]
  return {
    showWeather: row?.showWeather == null ? defaultSettings.showWeather : Boolean(row.showWeather),
    showWidget: row?.showWidget == null ? defaultSettings.showWidget : Boolean(row.showWidget),
    backgroundPattern: row?.backgroundPattern || defaultSettings.backgroundPattern,
    displayFont: row?.displayFont || defaultSettings.displayFont,
  }
}

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
      return NextResponse.json(fallbackPayload())
    }

    const extraSettings = school.settings ? await readExtraSettings(school.id) : {
      showWeather: defaultSettings.showWeather,
      showWidget: defaultSettings.showWidget,
      backgroundPattern: defaultSettings.backgroundPattern,
      displayFont: defaultSettings.displayFont,
    }

    return NextResponse.json({
      ...school,
      settings: school.settings
        ? {
            ...defaultSettings,
            ...school.settings,
            ...extraSettings,
            examDate: school.settings.examDate?.toISOString() ?? null,
          }
        : {
            ...defaultSettings,
            examDate: null,
          },
    })
  } catch (error) {
    console.error("/api/settings GET failed", error)
    return NextResponse.json({ error: "Ayarlar okunamadi", ...fallbackPayload() })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureThemeColumns()
    const body = (await req.json()) as Record<string, unknown>
    const { name, shortName, city, district, slogan, logoUrl, timezone, settings } = body

    let school = await prisma.school.findFirst({ include: { settings: true } })

    if (!school) {
      school = await prisma.school.create({
        data: {
          name: typeof name === "string" && name.trim() ? name.trim() : "OkulPano",
          shortName: typeof shortName === "string" && shortName.trim() ? shortName.trim() : null,
          city: typeof city === "string" && city.trim() ? city.trim() : null,
          district: typeof district === "string" && district.trim() ? district.trim() : null,
          slogan: typeof slogan === "string" && slogan.trim() ? slogan.trim() : null,
          logoUrl: typeof logoUrl === "string" && logoUrl.trim() ? logoUrl.trim() : null,
          timezone: typeof timezone === "string" && timezone.trim() ? timezone.trim() : "Europe/Istanbul",
        },
        include: { settings: true },
      })
    } else {
      school = await prisma.school.update({
        where: { id: school.id },
        data: {
          ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
          ...(shortName !== undefined ? { shortName: typeof shortName === "string" && shortName.trim() ? shortName.trim() : null } : {}),
          ...(city !== undefined ? { city: typeof city === "string" && city.trim() ? city.trim() : null } : {}),
          ...(district !== undefined ? { district: typeof district === "string" && district.trim() ? district.trim() : null } : {}),
          ...(slogan !== undefined ? { slogan: typeof slogan === "string" && slogan.trim() ? slogan.trim() : null } : {}),
          ...(logoUrl !== undefined ? { logoUrl: typeof logoUrl === "string" && logoUrl.trim() ? logoUrl.trim() : null } : {}),
          ...(typeof timezone === "string" && timezone.trim() ? { timezone: timezone.trim() } : {}),
        },
        include: { settings: true },
      })
    }

    const safeSettings = sanitizeSettingsPatch(settings as Record<string, unknown> | null | undefined)
    if (safeSettings) {
      const {
        showWeather,
        showWidget,
        backgroundPattern,
        displayFont,
        ...prismaSafeSettings
      } = safeSettings as Record<string, unknown>

      await prisma.settings.upsert({
        where: { schoolId: school.id },
        create: {
          schoolId: school.id,
          ...prismaDefaultSettings,
          ...prismaSafeSettings,
        },
        update: prismaSafeSettings,
      })

      if (
        typeof showWeather === "boolean" ||
        typeof showWidget === "boolean" ||
        typeof backgroundPattern === "string" ||
        typeof displayFont === "string"
      ) {
        await prisma.$executeRawUnsafe(
          `UPDATE settings
           SET show_weather = COALESCE(?, show_weather),
               show_widget = COALESCE(?, show_widget),
               background_pattern = COALESCE(?, background_pattern),
               display_font = COALESCE(?, display_font)
           WHERE school_id = ?`,
          typeof showWeather === "boolean" ? (showWeather ? 1 : 0) : null,
          typeof showWidget === "boolean" ? (showWidget ? 1 : 0) : null,
          typeof backgroundPattern === "string" ? backgroundPattern : null,
          typeof displayFont === "string" ? displayFont : null,
          school.id,
        )
      }
    }

    return NextResponse.json({ success: true, schoolId: school.id })
  } catch (error) {
    console.error("/api/settings PUT failed", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ayarlar kaydedilemedi" },
      { status: 500 },
    )
  }
}
