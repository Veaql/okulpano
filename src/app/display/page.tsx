/* eslint-disable @next/next/no-img-element */
"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import { DisplayData, ScheduleStatus } from "@/lib/types"
import { getBackgroundPattern, getDisplayBackground, getDisplayFont, getTheme, getThemeCSS } from "@/lib/themes"
import { motion } from "@/lib/motion"
import { getMgmCityByCode, toTurkishLabel } from "@/lib/mgm"

const mebLogoCandidates = ["/logo/meb-logo.png", "/logo/logomeb.png"]

interface WeatherState {
  cityName: string
  stationName: string
  displayLabel: string
  condition: string
  temperature: string
  icon: string
}

interface TrtHeadline {
  title: string
  url: string
  image: string | null
  summary: string
  publishedAt: string
}

const DEFAULT_MENU_ITEMS = ["Mercimek Çorbası", "Tavuk Sote", "Pirinç Pilavı", "Mevsim Salata", "Ayran"]
const MEAL_COLORS = ["#bb6d52", "#d08c5f", "#d0b46e", "#6e9873", "#6f90b8", "#8d6fb8"]

const examDates = {
  yks: new Date("2026-06-20T09:30:00+03:00"),
  lgs: new Date("2026-06-14T09:30:00+03:00"),
} as const

const PANEL_ROTATE_MS = 60000

function getDatePart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return parts.find((part) => part.type === type)?.value ?? ""
}

function formatTrDate(date: Date) {
  const parts = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" }).formatToParts(date)
  return `${getDatePart(parts, "day")} ${getDatePart(parts, "month")} ${getDatePart(parts, "year")} - ${getDatePart(parts, "weekday")}`.toLocaleUpperCase("tr-TR")
}

function formatMenuDate(date: Date) {
  const parts = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", weekday: "long" }).formatToParts(date)
  return `${getDatePart(parts, "day")} ${getDatePart(parts, "month")} ${getDatePart(parts, "weekday")}`.toLocaleUpperCase("tr-TR")
}

function formatTime(date: Date, showSeconds: boolean) {
  return new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", second: showSeconds ? "2-digit" : undefined, hour12: false }).format(date)
}

function formatExamDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(date).toLocaleUpperCase("tr-TR")
}

function formatHeadlineTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Güncel"
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(date)
}

function getDaysRemaining(targetDate: Date, now: Date) {
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const startOfTarget = new Date(targetDate)
  startOfTarget.setHours(0, 0, 0, 0)
  return Math.ceil((startOfTarget.getTime() - startOfToday.getTime()) / 86400000)
}

function getScheduleStatus(blocks: DisplayData["scheduleBlocks"], now: Date): ScheduleStatus {
  const day = now.getDay()
  if (day === 0 || day === 6) return { type: "weekend", currentBlock: null, nextBlock: null, remainingMinutes: 0, remainingSeconds: 0 }
  if (blocks.length === 0) return { type: "no_schedule", currentBlock: null, nextBlock: null, remainingMinutes: 0, remainingSeconds: 0 }

  const nowSeconds = (now.getHours() * 60 + now.getMinutes()) * 60 + now.getSeconds()
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index]
    const [startHour, startMinute] = block.startTime.split(":").map(Number)
    const [endHour, endMinute] = block.endTime.split(":").map(Number)
    const startSeconds = (startHour * 60 + startMinute) * 60
    const endSeconds = (endHour * 60 + endMinute) * 60

    if (nowSeconds >= startSeconds && nowSeconds < endSeconds) {
      const remainingSeconds = endSeconds - nowSeconds
      const nextBlock = blocks[index + 1] ?? null
      return {
        type: block.blockType as ScheduleStatus["type"],
        currentBlock: { label: block.label, blockType: block.blockType, endTime: block.endTime },
        nextBlock: nextBlock ? { label: nextBlock.label, blockType: nextBlock.blockType, startTime: nextBlock.startTime } : null,
        remainingMinutes: Math.floor(remainingSeconds / 60),
        remainingSeconds: remainingSeconds % 60,
      }
    }
  }

  const firstBlock = blocks[0]
  const [firstHour, firstMinute] = firstBlock.startTime.split(":").map(Number)
  const firstStartMinutes = firstHour * 60 + firstMinute
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  if (nowMinutes < firstStartMinutes) {
    return {
      type: "before_school",
      currentBlock: null,
      nextBlock: { label: firstBlock.label, blockType: firstBlock.blockType, startTime: firstBlock.startTime },
      remainingMinutes: firstStartMinutes - nowMinutes,
      remainingSeconds: 0,
    }
  }

  return { type: "after_school", currentBlock: null, nextBlock: null, remainingMinutes: 0, remainingSeconds: 0 }
}

function getAnnouncementAccent(priority: string) {
  if (priority === "important" || priority === "urgent") {
    return { line: "#caa96d", badgeBg: "rgba(202, 169, 109, 0.18)", badgeText: "#f1ddaf", label: "ÖNEMLİ" }
  }

  return { line: "rgba(202, 169, 109, 0.42)", badgeBg: "rgba(255, 255, 255, 0.08)", badgeText: "#d6e1ef", label: "DUYURU" }
}

function getDutyPriority(locationName: string) {
  const normalized = locationName.toLocaleLowerCase("tr-TR")
  return normalized.includes("müdür") || normalized.includes("mudur") ? 0 : 1
}

function withAlpha(color: string, alpha: number) {
  if (color.startsWith("#")) {
    let hex = color.slice(1)
    if (hex.length === 3) {
      hex = hex.split("").map((char) => char + char).join("")
    }
    if (hex.length === 6) {
      const value = parseInt(hex, 16)
      const r = (value >> 16) & 255
      const g = (value >> 8) & 255
      const b = value & 255
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
  }

  if (color.startsWith("rgba(")) {
    const parts = color.slice(5, -1).split(",").slice(0, 3).map((part) => part.trim())
    return `rgba(${parts.join(", ")}, ${alpha})`
  }

  if (color.startsWith("rgb(")) {
    const parts = color.slice(4, -1).split(",").map((part) => part.trim())
    return `rgba(${parts.join(", ")}, ${alpha})`
  }

  return color
}

function buildMenuItems(rawValue: string | null | undefined) {
  let names = DEFAULT_MENU_ITEMS

  if (rawValue) {
    try {
      const parsed = JSON.parse(rawValue)
      if (Array.isArray(parsed)) {
        const nextNames = parsed.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
        if (nextNames.length > 0) {
          names = nextNames
        }
      }
    } catch {
      const fallbackNames = rawValue.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
      if (fallbackNames.length > 0) {
        names = fallbackNames
      }
    }
  }

  return names.map((name, index) => ({
    name,
    color: MEAL_COLORS[index % MEAL_COLORS.length],
  }))
}

function SectionHeading({ title, align = "left", subtitle }: { title: string; align?: "left" | "center"; subtitle?: string }) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <p className="text-[17px] font-black uppercase tracking-[0.16em] text-white">{title}</p>
      {subtitle ? <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#97adca]">{subtitle}</p> : null}
      <div className={`${align === "center" ? "mx-auto" : ""} mt-3 h-px ${align === "center" ? "w-36" : "w-full"}`} style={{ background: "linear-gradient(90deg, var(--color-accent), transparent)" }} />
    </div>
  )
}

function WeatherGlyph({ icon }: { icon: string }) {
  const stroke = "currentColor"

  if (icon === "cloud") return <svg viewBox="0 0 64 64" className="h-9 w-9"><path d="M21 48h25c7 0 12-5 12-11s-5-11-11-11c-1-10-9-17-19-17-9 0-17 6-19 15-8 1-14 7-14 15 0 9 7 16 16 16Z" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  if (icon === "rain") return <svg viewBox="0 0 64 64" className="h-9 w-9"><path d="M19 34h27c7 0 11-4 11-10 0-6-4-10-10-10-2-8-8-12-16-12-8 0-15 5-17 13-6 1-10 6-10 12 0 7 6 13 15 13Z" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 44l-3 8M33 44l-3 8M44 44l-3 8" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" /></svg>
  if (icon === "snow") return <svg viewBox="0 0 64 64" className="h-9 w-9"><path d="M19 32h27c7 0 11-4 11-10 0-6-4-10-10-10-2-8-8-12-16-12-8 0-15 5-17 13-6 1-10 6-10 12 0 7 6 13 15 13Z" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M23 41v8M19 45h8M20 42l6 6M26 42l-6 6M33 45v8M29 49h8M30 46l6 6M36 46l-6 6M43 41v8M39 45h8M40 42l6 6M46 42l-6 6" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" /></svg>
  if (icon === "storm") return <svg viewBox="0 0 64 64" className="h-9 w-9"><path d="M19 31h27c7 0 11-4 11-10 0-6-4-10-10-10-2-8-8-12-16-12-8 0-15 5-17 13-6 1-10 6-10 12 0 7 6 13 15 13Z" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M31 34l-6 11h7l-4 11 13-16h-7l4-6" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  if (icon === "partly") return <svg viewBox="0 0 64 64" className="h-9 w-9"><circle cx="24" cy="22" r="8" fill="none" stroke={stroke} strokeWidth="3.5" /><path d="M24 8v6M24 30v6M10 22h6M32 22h6M15 13l4 4M15 31l4-4" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" /><path d="M26 46h20c6 0 10-4 10-9s-4-9-9-9c-1-7-7-12-14-12-7 0-13 5-15 11-6 1-10 5-10 11 0 7 5 13 12 13Z" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  if (icon === "fog") return <svg viewBox="0 0 64 64" className="h-9 w-9"><path d="M20 28h24c6 0 10-4 10-9s-4-9-9-9c-2-6-7-9-13-9-7 0-12 4-14 10-5 1-8 5-8 9 0 5 4 8 10 8Z" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M13 38h38M17 45h30M13 52h38" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" /></svg>
  return <svg viewBox="0 0 64 64" className="h-9 w-9"><circle cx="32" cy="32" r="10" fill="none" stroke={stroke} strokeWidth="3.5" /><path d="M32 8v8M32 48v8M8 32h8M48 32h8M15 15l6 6M43 43l6 6M15 49l6-6M43 21l6-6" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" /></svg>
}

function MebSeal() {
  return (
    <svg viewBox="0 0 128 128" className="h-[52px] w-[52px]" aria-label="MEB Amblemi" role="img">
      <circle cx="64" cy="64" r="58" fill="none" stroke="#d1242f" strokeWidth="3.5" />
      <circle cx="64" cy="64" r="45" fill="none" stroke="#d1242f" strokeWidth="2.5" />
      <circle cx="64" cy="64" r="19" fill="none" stroke="#d1242f" strokeWidth="2.5" />
      <path d="M52 72h24M56 67h16M58 48h12M64 38v9M50 75c4-6 10-9 14-9s10 3 14 9" fill="none" stroke="#d1242f" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M47 56c3 1 6 4 7 8M81 56c-3 1-6 4-7 8" fill="none" stroke="#d1242f" strokeWidth="2.4" strokeLinecap="round" />
      {Array.from({ length: 16 }).map((_, index) => {
        const angle = (index / 16) * Math.PI * 2 - Math.PI / 2
        const x = 64 + Math.cos(angle) * 51
        const y = 64 + Math.sin(angle) * 51
        return <circle key={index} cx={x} cy={y} r="1.8" fill="#d1242f" />
      })}
    </svg>
  )
}

function MebWordmark() {
  return (
    <div className="flex items-center gap-4">
      <MebSeal />
      <div className="leading-none text-[#d1242f]">
        <p className="text-[24px] font-black uppercase tracking-[0.02em]">T.C. Millî Eğitim</p>
        <p className="mt-1 text-[24px] font-black uppercase tracking-[0.02em]">Bakanlığı</p>
      </div>
    </div>
  )
}

export default function DisplayPage() {
  const [data, setData] = useState<DisplayData | null>(null)
  const [now, setNow] = useState(new Date())
  const [connected, setConnected] = useState(true)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [mediaFadeKey, setMediaFadeKey] = useState(0)
  const [weather, setWeather] = useState<WeatherState | null>(null)
  const [trtHeadlines, setTrtHeadlines] = useState<TrtHeadline[]>([])
  const [weatherUnavailable, setWeatherUnavailable] = useState(false)
  const [trtUnavailable, setTrtUnavailable] = useState(false)
  const [mebLogoIndex, setMebLogoIndex] = useState(0)
  const mediaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dutyViewportRef = useRef<HTMLDivElement | null>(null)
  const dutyContentRef = useRef<HTMLDivElement | null>(null)
  const announcementViewportRef = useRef<HTMLDivElement | null>(null)
  const announcementContentRef = useRef<HTMLDivElement | null>(null)
  const mealViewportRef = useRef<HTMLDivElement | null>(null)
  const mealContentRef = useRef<HTMLDivElement | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/display", { cache: "no-store" })
      if (!response.ok) throw new Error("display")
      const nextData = await response.json()
      setData(nextData)
      setConnected(true)
      localStorage.setItem("okulpano_display_cache", JSON.stringify(nextData))
    } catch {
      setConnected(false)
      const cached = localStorage.getItem("okulpano_display_cache")
      if (!cached) return
      try {
        setData(JSON.parse(cached))
      } catch {
        setData(null)
      }
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  useEffect(() => {
    const refresh = window.setInterval(() => void fetchData(), (data?.settings.refreshInterval ?? 15) * 1000)
    return () => window.clearInterval(refresh)
  }, [data?.settings.refreshInterval, fetchData])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), motion.interval.clock)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!data?.mediaItems.length) {
      setCurrentMediaIndex(0)
      return
    }

    if (currentMediaIndex >= data.mediaItems.length) {
      setCurrentMediaIndex(0)
      return
    }

    if (mediaTimerRef.current) {
      clearTimeout(mediaTimerRef.current)
    }

    mediaTimerRef.current = setTimeout(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % data.mediaItems.length)
      setMediaFadeKey((prev) => prev + 1)
    }, (data.mediaItems[currentMediaIndex]?.durationSeconds ?? 6) * 1000)

    return () => {
      if (mediaTimerRef.current) {
        clearTimeout(mediaTimerRef.current)
      }
    }
  }, [currentMediaIndex, data?.mediaItems])

  useEffect(() => {
    if (!data) return

    const fetchWeather = async () => {
      const params = new URLSearchParams({ cityCode: data.settings.weatherCityCode })
      if (data.settings.weatherStation) params.set("station", data.settings.weatherStation)

      try {
        const response = await fetch(`/api/weather?${params.toString()}`, { cache: "no-store" })
        if (!response.ok) throw new Error("weather")
        const payload = await response.json()
        setWeather(payload)
        setWeatherUnavailable(payload?.condition === "Veri alınamadı")
      } catch {
        setWeather(null)
        setWeatherUnavailable(true)
      }
    }

    void fetchWeather()
    const interval = window.setInterval(() => void fetchWeather(), 900000)
    return () => window.clearInterval(interval)
  }, [data])

  useEffect(() => {
    if (!data?.settings.showTrtNews) {
      setTrtHeadlines([])
      setTrtUnavailable(false)
      return
    }

    const fetchHeadlines = async () => {
      try {
        const response = await fetch(`/api/trt-news?category=${data.settings.trtCategory}`, { cache: "no-store" })
        if (!response.ok) throw new Error("trt")
        const payload = await response.json()
        const headlines = Array.isArray(payload.headlines) ? payload.headlines : []
        setTrtHeadlines(headlines)
        setTrtUnavailable(headlines.length === 0)
      } catch {
        setTrtHeadlines([])
        setTrtUnavailable(true)
      }
    }

    void fetchHeadlines()
    const interval = window.setInterval(() => void fetchHeadlines(), 300000)
    return () => window.clearInterval(interval)
  }, [data])

  useEffect(() => {
    const pairs = [
      [dutyViewportRef.current, dutyContentRef.current],
      [announcementViewportRef.current, announcementContentRef.current],
      [mealViewportRef.current, mealContentRef.current],
    ].filter((pair): pair is [HTMLDivElement, HTMLDivElement] => Boolean(pair[0] && pair[1]))

    if (pairs.length === 0) return

    let frame = 0
    const cycleStart = performance.now()

    const animate = (timestamp: number) => {
      const elapsed = (timestamp - cycleStart) % PANEL_ROTATE_MS
      const progress = elapsed / PANEL_ROTATE_MS

      pairs.forEach(([viewport, content]) => {
        const extraOffset = content === dutyContentRef.current ? 14 : 0
        const distance = Math.max(0, content.scrollHeight - viewport.clientHeight + extraOffset)
        if (distance <= 8) {
          content.style.transform = "translateY(0px)"
          return
        }

        const isAnnouncement = content === announcementContentRef.current
        let offset = 0
        if (progress < 0.5) {
          offset = 0
        } else if (progress < (isAnnouncement ? 0.6166666667 : 0.5833333333)) {
          const downSpan = isAnnouncement ? 0.1166666667 : 0.0833333333
          offset = distance * ((progress - 0.5) / downSpan)
        } else if (progress < (isAnnouncement ? 0.8833333333 : 0.9166666667)) {
          offset = distance
        } else {
          const upStart = isAnnouncement ? 0.8833333333 : 0.9166666667
          const upSpan = isAnnouncement ? 0.1166666667 : 0.0833333333
          offset = distance * (1 - (progress - upStart) / upSpan)
        }

        content.style.transform = `translateY(${-offset}px)`
      })

      frame = window.requestAnimationFrame(animate)
    }

    frame = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(frame)
      pairs.forEach(([, content]) => {
        content.style.transform = "translateY(0px)"
      })
    }
  }, [data?.dutyTeachers.length, data?.announcements.length, data?.settings.activeWidget, data?.settings.weatherLabel])

  const theme = useMemo(() => {
    const baseTheme = getTheme(data?.settings.theme || "resmi")
    const resolvedRadius = data?.settings.cardRadius ? `${data.settings.cardRadius}px` : baseTheme.cardRadius
    const resolvedFontScale = Number(data?.settings.fontScale ?? baseTheme.fontScale)

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: data?.settings.primaryColor || baseTheme.colors.primary,
        accent: data?.settings.accentColor || baseTheme.colors.accent,
      },
      cardRadius: resolvedRadius,
      fontScale: Number.isFinite(resolvedFontScale) ? resolvedFontScale : baseTheme.fontScale,
    }
  }, [
    data?.settings.accentColor,
    data?.settings.cardRadius,
    data?.settings.fontScale,
    data?.settings.primaryColor,
    data?.settings.theme,
  ])

  const themeVars = getThemeCSS(theme)
  const motionVars = motion.toCSSVars()
  const displayFont = getDisplayFont(data?.settings.displayFont || "system")
  const backgroundPattern = getBackgroundPattern(data?.settings.backgroundPattern || "default-grid")

  if (!data) {
    return (
      <div className="flex h-screen w-screen items-center justify-center" style={{ background: "#0d1a2e" }}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#c9a84c]/30 border-t-[#c9a84c]" />
          <p className="text-sm uppercase tracking-[0.24em] text-white/45">{"Ekran yükleniyor"}</p>
        </div>
      </div>
    )
  }

  const schedule = getScheduleStatus(data.scheduleBlocks, now)
  const currentMedia = data.mediaItems[currentMediaIndex]
  const visibleTickerMessages = data.tickerMessages.filter((item) => !item.text.toLocaleLowerCase("tr-TR").includes("okulpano.com"))
  const tickerText = visibleTickerMessages.map((item) => item.text).join("     •     ")
  const hasEmergency = visibleTickerMessages.some((item) => item.isEmergency)
  const tickerDuration = `${Math.max(tickerText.length * motion.duration.ticker, 22)}s`
  const activeWidget = data.settings.activeWidget || "meal"
  const fallbackCity = toTurkishLabel(getMgmCityByCode(data.settings.weatherCityCode).name)
  const activeWeather = weather ?? {
    cityName: fallbackCity,
    stationName: data.settings.weatherStation || fallbackCity,
    displayLabel: fallbackCity,
    condition: weatherUnavailable ? "Veri güncellenmedi" : "Veri güncelleniyor",
    temperature: "--°C",
    icon: "cloud",
  }
  const weatherCityTitle = (activeWeather.displayLabel || activeWeather.stationName || toTurkishLabel(getMgmCityByCode(data.settings.weatherCityCode).name)).toLocaleUpperCase("tr-TR")
  const defaultExamType = activeWidget === "lgs" ? "lgs" : "yks"
  const rawExamDate = data.settings.examDate ? new Date(data.settings.examDate) : null
  const examDate = !rawExamDate || Number.isNaN(rawExamDate.getTime())
    ? examDates[defaultExamType]
    : defaultExamType === "lgs" && rawExamDate.getTime() === examDates.yks.getTime()
      ? examDates.lgs
      : defaultExamType === "yks" && rawExamDate.getTime() === examDates.lgs.getTime()
        ? examDates.yks
        : rawExamDate
  const rawExamName = data.settings.examName?.trim() ?? ""
  const examName = activeWidget === "meal"
    ? ""
    : defaultExamType === "lgs"
      ? !rawExamName || rawExamName.toUpperCase() === "YKS" ? "LGS" : rawExamName
      : !rawExamName || rawExamName.toUpperCase() === "LGS" ? "YKS" : rawExamName
  const sortedDutyTeachers = [...data.dutyTeachers].sort((left, right) => {
    const priorityDiff = getDutyPriority(left.locationName) - getDutyPriority(right.locationName)
    if (priorityDiff !== 0) return priorityDiff
    return left.sortOrder - right.sortOrder
  })
  const examDaysRemaining = getDaysRemaining(examDate, now)
  const resolvedMenuItems = buildMenuItems(data.settings.weatherLabel)
  const widgetTitle = activeWidget === "meal" ? "Haftalık Yemek Listesi" : `${examName} Sayacı`
  const scheduleAccent = schedule.type === "lesson"
    ? "#6aa678"
    : schedule.type === "break"
      ? "#8ca7c9"
      : schedule.type === "lunch"
        ? "#c8a86a"
        : theme.colors.accent

  const frameStyle: CSSProperties = {
    background: `linear-gradient(180deg, ${withAlpha(theme.colors.cardBg, 0.92)} 0%, ${withAlpha(theme.colors.surface, 0.95)} 100%), repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.028) 0 10px, rgba(255, 255, 255, 0.008) 10px 20px)`,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.cardRadius,
    boxShadow: "0 24px 60px rgba(4, 10, 18, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(14px)",
  }

  const renderWidgetContent = (compact = false) => {
    if (activeWidget === "meal") {
      return (
        <div ref={mealViewportRef} className="flex flex-1 flex-col justify-start overflow-hidden pt-3 pr-1">
          <div ref={mealContentRef}>
            <p className="mb-3 text-[14px] font-black uppercase tracking-[0.14em]" style={{ color: theme.colors.accent }}>{formatMenuDate(now)}</p>
            <div className="space-y-2">
              {resolvedMenuItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl border border-white/5 px-3 py-2.5" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                    <span className={`${compact ? "text-[13px]" : "text-[15px]"} font-bold text-white/92`}>{item.name}</span>
                </div>
                <span className="text-[12px] font-semibold" style={{ color: theme.colors.textSecondary }}>{"Günlük"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-1 flex-col justify-between pt-3">
        <p className={`${compact ? "text-[12px]" : "text-[14px]"} font-black uppercase tracking-[0.12em] leading-snug`} style={{ color: theme.colors.accent }}>{examName}</p>
        <div className="mt-3 rounded-[16px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,29,48,0.88),rgba(11,19,33,0.94))] px-4 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <p className="text-[13px] font-black uppercase tracking-[0.18em]" style={{ color: theme.colors.textSecondary }}>{"Sınava Kalan"}</p>
          <p className={`mt-2 ${compact ? "text-[40px]" : "text-[46px]"} font-black leading-none text-white`}>{Math.max(examDaysRemaining, 0)}</p>
          <p className="mt-1 text-[13px] font-black uppercase tracking-[0.18em]" style={{ color: theme.colors.accent }}>{"Gün"}</p>
        </div>
        <div className="mt-3 space-y-1.5 text-[13px] font-semibold leading-relaxed" style={{ color: theme.colors.textSecondary }}>
          <p>{"Sınav Tarihi:"} {formatExamDate(examDate)}</p>
          <p>{"Kaynak tarih admin panelinden yönetilir."}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="display-root relative flex h-screen w-screen cursor-none select-none flex-col overflow-hidden"
      style={{
        ...themeVars,
        ...motionVars,
        background: getDisplayBackground(backgroundPattern.id, theme.colors.background, theme.colors.primary),
        color: theme.colors.text,
        fontFamily: displayFont.stack,
      }}
    >
      <header className="relative z-10 flex shrink-0 items-center px-7" style={{ height: 88, background: `linear-gradient(180deg, ${withAlpha(theme.colors.headerBg, 0.96)} 0%, ${withAlpha(theme.colors.primary, 0.88)} 100%)`, borderBottom: `1px solid ${theme.colors.border}` }}>
        <div className="flex w-[300px] shrink-0 items-center">
          <img
            src={mebLogoCandidates[mebLogoIndex]}
            alt="MEB Logo"
            className="h-[58px] max-w-[280px] object-contain object-left"
            onError={(event) => {
              if (mebLogoIndex < mebLogoCandidates.length - 1) {
                setMebLogoIndex((current) => current + 1)
                return
              }

              const target = event.currentTarget
              target.style.display = "none"
              const fallback = target.nextElementSibling as HTMLDivElement | null
              if (fallback) fallback.style.display = "block"
            }}
          />
          <div className="origin-left scale-[0.78]" style={{ display: "none" }}>
            <MebWordmark />
          </div>
        </div>
        <div className="flex-1 px-6 text-center">
          <h1 className="text-[30px] font-black uppercase tracking-[0.05em] text-white">{data.school.name}</h1>
          <p className="mt-1 text-[13px] font-bold uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary }}>{data.school.shortName || "Okul Bilgi Ekranı"}</p>
        </div>
        <div className="flex w-[340px] shrink-0 items-center justify-center">
          <div className="grid w-full max-w-[320px] grid-cols-[1fr_auto] grid-rows-[auto_auto] items-center">
            <p className="clock-display col-span-2 justify-self-center text-[44px] font-black leading-none tracking-[0.01em] text-white">{formatTime(now, data.settings.showSeconds || false)}</p>
            <p className="date-display mt-1 justify-self-center whitespace-nowrap pl-10 text-[11px] font-bold tracking-[0.08em]" style={{ color: theme.colors.textSecondary }}>{formatTrDate(now)}</p>
            <div className={`mt-1 flex items-center justify-self-end gap-2 text-[11px] font-bold uppercase tracking-[0.18em] ${connected ? "" : "status-disconnected"}`}>
              <span className="block h-2.5 w-2.5 rounded-full" style={{ background: connected ? "#7ab58c" : "#c97c6b" }} />
              <span style={{ color: theme.colors.textSecondary }}>{connected ? "Yayın" : "Önbellek"}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 gap-4 overflow-hidden px-5 pb-4 pt-5">
        <div className="flex flex-col gap-4" style={{ width: 255, flexShrink: 0 }}>
          <section className="flex min-h-0 flex-[1.35] flex-col overflow-hidden" style={frameStyle}>
            <div className="px-4 py-3">
              <SectionHeading title="Bugünkü Nöbetçi Öğretmenler" />
            </div>
            <div className="flex flex-1 flex-col px-3 pb-3">
              <div ref={dutyViewportRef} className="min-h-0 flex-1 overflow-hidden" style={{ maxHeight: 394 }}>
                {sortedDutyTeachers.length === 0 ? (
                  <div className="flex items-center justify-center rounded-[10px] border border-white/6 bg-white/[0.04] px-3 py-6 text-center text-[14px] font-semibold uppercase tracking-[0.12em] text-white/35">{"Nöbet bilgisi girilmemiş"}</div>
                ) : (
                  <div ref={dutyContentRef} className="space-y-2.5 pr-1">
                    {sortedDutyTeachers.map((duty) => (
                      <div key={duty.id} className="grid grid-cols-[96px_1fr] items-center gap-3 rounded-[10px] border px-3 py-3" style={{ borderColor: theme.colors.border, background: withAlpha(theme.colors.surfaceAlt, 0.72) }}>
                        <p className="break-words text-[14px] font-semibold uppercase leading-tight tracking-[0.01em] text-white">{duty.locationName}</p>
                        <p className="break-words text-[16px] font-semibold leading-tight text-white">{duty.personName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="flex min-h-0 flex-[0.95] flex-col overflow-hidden p-3" style={frameStyle}>
            {data.settings.showTrtNews ? (
              <>
                <SectionHeading title="TRT Haber" subtitle="Resmi yayın akışı" />
                <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-hidden pr-1">
                  {trtHeadlines.length > 0 ? (
                    trtHeadlines.slice(0, 4).map((headline, index) => (
                      <div key={headline.url || index} className="rounded-[12px] border border-white/6 bg-white/[0.04] p-2.5">
                        <div className="flex gap-3">
                          <div className="h-[58px] w-[82px] shrink-0 overflow-hidden rounded-[8px] border border-white/6 bg-white/[0.04]">
                            {headline.image ? <img src={headline.image} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[10px] font-black uppercase tracking-[0.18em] text-white/35">TRT</div>}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-[12px] font-black leading-snug text-white/92">{headline.title}</p>
                            <p className="mt-2 text-[11px] font-semibold" style={{ color: theme.colors.textSecondary }}>{formatHeadlineTime(headline.publishedAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/35">{trtUnavailable ? "Veri güncellenmedi" : "TRT Haber başlıkları yükleniyor"}</p>
                      {trtUnavailable ? <p className="mt-2 text-[11px] font-semibold text-white/40">{"İnternet bağlantısı kontrol edilmeli."}</p> : null}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-[12px] font-semibold uppercase tracking-[0.12em] text-white/35">{"TRT Haber kapalı"}</div>
            )}
          </section>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <section className="flex flex-1 flex-col overflow-hidden p-3" style={frameStyle}>
            <SectionHeading title="Okul Etkinlikleri" align="center" />
            <div className="relative mt-2 flex-1 overflow-hidden rounded-[16px]" style={{ border: `1px solid ${theme.colors.border}`, background: withAlpha(theme.colors.surfaceAlt, 0.5) }}>
              {data.mediaItems.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="text-center">
                    <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: theme.colors.textSecondary }}>{"Medya Alanı"}</p>
                    <p className="mt-2 text-lg font-semibold text-white/80">{data.school.name}</p>
                  </div>
                </div>
              ) : currentMedia ? (
                <div key={`${currentMedia.id}-${mediaFadeKey}`} className="h-full w-full animate-media-enter">
                  {currentMedia.type === "video" ? (
                    <video src={currentMedia.fileUrl} className="h-full w-full object-cover" autoPlay muted loop onError={() => setCurrentMediaIndex((prev) => (prev + 1) % data.mediaItems.length)} />
                  ) : (
                    <img src={currentMedia.fileUrl} alt="" className="h-full w-full object-cover" onError={() => setCurrentMediaIndex((prev) => (prev + 1) % data.mediaItems.length)} />
                  )}
                  <div className="absolute inset-x-0 bottom-0 px-7 pb-5 pt-16" style={{ background: "linear-gradient(180deg, rgba(6, 10, 16, 0) 0%, rgba(6, 10, 16, 0.28) 35%, rgba(6, 10, 16, 0.85) 100%)" }}>
                    <p className="mb-2 inline-flex rounded-full border border-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" style={{ background: "rgba(8, 13, 22, 0.35)", color: theme.colors.text }}>{"Etkinlik Yayını"}</p>
                    {currentMedia.title ? <h2 className="max-w-[82%] text-[24px] font-black uppercase leading-tight tracking-[0.03em] text-white">{currentMedia.title}</h2> : null}
                    {currentMedia.subtitle ? <p className="mt-2 max-w-[82%] text-[16px] font-semibold leading-relaxed" style={{ color: theme.colors.text }}>{currentMedia.subtitle}</p> : null}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="flex h-[86px] shrink-0 items-center px-6" style={frameStyle}>
            {schedule.type === "weekend" ? (
              <p className="flex-1 text-center text-[17px] font-black uppercase tracking-[0.12em]" style={{ color: theme.colors.textSecondary }}>{"İyi hafta sonları"}</p>
            ) : schedule.type === "no_schedule" ? (
              <p className="flex-1 text-center text-[17px] font-black uppercase tracking-[0.12em]" style={{ color: theme.colors.textSecondary }}>{"Ders programı ayarlanmamış"}</p>
            ) : schedule.type === "after_school" ? (
              <p className="flex-1 text-center text-[18px] font-black uppercase tracking-[0.14em]" style={{ color: theme.colors.text }}>{"Ders saatleri dışında"}</p>
            ) : schedule.type === "before_school" ? (
              <div className="flex flex-1 items-center justify-center gap-8">
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary }}>{"İlk ders"}</p>
                  <p className="mt-1 text-[18px] font-black text-white">{schedule.nextBlock?.label}<span className="ml-2 text-[14px] font-semibold" style={{ color: theme.colors.textSecondary }}>{schedule.nextBlock?.startTime}</span></p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="rounded-[14px] border px-5 py-2 text-center" style={{ borderColor: withAlpha(theme.colors.accent, 0.22), background: "rgba(5, 12, 22, 0.55)" }}>
                  <p className="text-[12px] font-black uppercase tracking-[0.18em]" style={{ color: theme.colors.text }}>{"Başlamasına"}</p>
                  <p className="mt-1 text-[32px] font-black leading-none" style={{ color: scheduleAccent }}>{schedule.remainingMinutes}<span className="ml-1 text-[14px] font-bold uppercase">dk</span></p>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-between gap-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-1.5 rounded-full" style={{ background: scheduleAccent }} />
                  <div>
                    <p className="text-[12px] font-black uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary }}>{"Şu an"}</p>
                    <p className="mt-1 text-[19px] font-black text-white">{schedule.currentBlock?.label}</p>
                  </div>
                </div>
                <div className="min-w-[204px] text-center">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: theme.colors.textSecondary }}>{"Kalan Süre"}</p>
                  <div className="mt-1.5 flex items-end justify-center">
                    <span
                      className="text-[40px] font-black leading-none tracking-[-0.03em]"
                      style={{ color: "#f4f7fb" }}
                    >
                      {schedule.remainingMinutes}:{schedule.remainingSeconds.toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>
                {schedule.nextBlock ? (
                  <div className="text-right">
                    <p className="text-[12px] font-black uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary }}>{"Sonraki"}</p>
                    <p className="mt-1 text-[18px] font-black text-white">{schedule.nextBlock.label}</p>
                    <p className="mt-0.5 text-[13px] font-semibold" style={{ color: theme.colors.textSecondary }}>{schedule.nextBlock.startTime}</p>
                  </div>
                ) : (
                  <div className="w-24" />
                )}
              </div>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-3 overflow-hidden" style={{ width: 240, flexShrink: 0 }}>
          {data.settings.showWeather ? (
            <section className="shrink-0 px-4 py-4" style={frameStyle}>
              <SectionHeading title="HAVA DURUMU" />
              <p className="mt-2 text-[12px] font-black uppercase tracking-[0.16em]" style={{ color: theme.colors.accent }}>{weatherCityTitle}</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10" style={{ background: `radial-gradient(circle at 30% 30%, ${withAlpha(theme.colors.accent, 0.2)}, rgba(255, 255, 255, 0.03))`, color: theme.colors.accent }}>
                  <WeatherGlyph icon={activeWeather.icon} />
                </div>
                <div>
                  <p className="text-[15px] font-bold leading-none" style={{ color: theme.colors.textSecondary }}>{activeWeather.condition}</p>
                  <p className="mt-2 text-[42px] font-black leading-none text-white">{activeWeather.temperature}</p>
                  {weatherUnavailable ? <p className="mt-2 text-[11px] font-semibold text-white/45">{"İnternet yoksa veri güncellenmedi."}</p> : null}
                </div>
              </div>
            </section>
          ) : null}

          <section className="flex flex-[2.8] flex-col overflow-hidden p-4" style={frameStyle}>
            <SectionHeading title="Duyurular ve Haberler" />
            <div ref={announcementViewportRef} className="flex flex-1 flex-col overflow-hidden pt-3">
              {data.announcements.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-center text-xs uppercase tracking-[0.14em] text-white/35">{"Henüz duyuru yok"}</div>
              ) : (
                <div ref={announcementContentRef} className="space-y-2.5 pr-1">
                  {data.announcements.map((announcement) => {
                    const accent = getAnnouncementAccent(announcement.priority)
                    return (
                      <article key={announcement.id} className="rounded-[14px] border px-3 py-3.5" style={{ borderColor: theme.colors.border, background: `linear-gradient(180deg, ${withAlpha(theme.colors.surfaceAlt, 0.78)}, ${withAlpha(theme.colors.surface, 0.52)})`, boxShadow: `inset 3px 0 0 0 ${accent.line}` }}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em]" style={{ background: accent.badgeBg, color: accent.badgeText }}>{accent.label}</span>
                        </div>
                        <p className="text-[17px] font-black leading-snug text-white">{announcement.title}</p>
                        {announcement.content ? <p className="mt-2 line-clamp-3 text-[14px] font-semibold leading-[1.5]" style={{ color: theme.colors.textSecondary }}>{announcement.content}</p> : null}
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          {data.settings.showWidget ? (
            <section className="flex flex-[2.3] flex-col overflow-hidden p-4" style={frameStyle}>
              <SectionHeading title={widgetTitle} />
              {renderWidgetContent(false)}
            </section>
          ) : null}
        </div>
      </div>

      {visibleTickerMessages.length > 0 ? (
        <div className="relative z-10 flex h-8 shrink-0 items-center overflow-hidden border-t" style={{ background: hasEmergency ? "rgba(111, 24, 24, 0.96)" : theme.colors.tickerBg, borderColor: theme.colors.border }}>
          <div className="flex h-full shrink-0 items-center border-r px-3 text-[11px] font-black uppercase tracking-[0.2em]" style={{ borderColor: theme.colors.border, color: hasEmergency ? "#ffd8d2" : theme.colors.tickerText, background: hasEmergency ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.02)" }}>{"Yayın"}</div>
          <div className="ticker-animate whitespace-nowrap pl-6 text-[13px] font-semibold tracking-[0.06em]" style={{ "--ticker-duration": tickerDuration, color: hasEmergency ? "#ffe3de" : theme.colors.tickerText } as CSSProperties}>{tickerText}</div>
        </div>
      ) : null}
    </div>
  )
}


