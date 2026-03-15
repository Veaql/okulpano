import { getMgmCityByCode, getMgmCitySlug, normalizeTurkish, toTurkishLabel } from '@/lib/mgm'
import { DISTRICTS_BY_CITY } from '@/lib/weather-districts'

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  quot: '"',
  apos: "'",
  nbsp: " ",
  lt: "<",
  gt: ">",
}

const WEATHER_STARTERS = [
  "acik",
  "az",
  "parcali",
  "cok",
  "bulutlu",
  "saganak",
  "kuvvetli",
  "hafif",
  "sisli",
  "puslu",
  "kar",
  "karla",
  "yagmurlu",
  "yerel",
  "gok",
  "firtina",
  "toz",
  "don",
  "sulu",
]

interface MgmCenterApiItem {
  merkezId?: number | string
  merkezid?: number | string
  istNo?: number | string
  istno?: number | string
  ilce?: string
  ilceAdi?: string
  merkezAdi?: string
  ad?: string
}

interface OpenMeteoSearchResult {
  name?: string
  latitude?: number
  longitude?: number
  country_code?: string
  admin1?: string
  admin2?: string
  admin3?: string
  admin4?: string
}

interface OpenMeteoCurrentResponse {
  current?: {
    temperature_2m?: number
    weather_code?: number
    is_day?: number
  }
}

export interface WeatherStationSummary {
  district: string
  condition: string
  temperature: string
}

interface WeatherCenter {
  district: string
}

function mergeStationLists(primary: WeatherStationSummary[], fallback: string[]) {
  const merged = new Map<string, WeatherStationSummary>();

  for (const item of primary) {
    merged.set(item.district, item);
  }

  for (const district of fallback) {
    if (!merged.has(district)) {
      merged.set(district, { district, condition: "", temperature: "" });
    }
  }

  return Array.from(merged.values()).sort((left, right) => left.district.localeCompare(right.district, "tr-TR"));
}

export function getFallbackDistrictsByCityCode(cityCode: string) {
  const city = getMgmCityByCode(cityCode)
  return [...(DISTRICTS_BY_CITY[toTurkishLabel(city.name)] ?? [])].sort((left, right) =>
    left.localeCompare(right, "tr-TR"),
  )
}

function decodeHtml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&([a-z]+);/gi, (_, key) => HTML_ENTITIES[key.toLowerCase()] ?? " ")
}

function htmlToLines(html: string) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(div|p|tr|table|li|section|article|h1|h2|h3|h4|h5|h6)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
}

function toDisplayText(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1).toLocaleLowerCase("tr-TR"))
    .join(" ")
}

function toAsciiSearch(value: string) {
  return normalizeTurkish(value)
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function extractCitySection(lines: string[], cityName: string) {
  const normalizedCity = normalizeTurkish(cityName)
  const startIndex = lines.findIndex((line) => normalizeTurkish(line) === normalizedCity)
  if (startIndex === -1) return []

  const headerIndex = lines.findIndex((line, index) => index > startIndex && normalizeTurkish(line).startsWith("ilce beklenen hava"))
  if (headerIndex === -1) return []

  const cityLines: string[] = []
  for (let index = headerIndex + 1; index < lines.length; index += 1) {
    const line = lines[index]
    if (!line || line === "(°C)" || line === "( C)") continue
    if (/^[A-Z0-9ÇĞİÖŞÜ\-. ]+$/u.test(line) && normalizeTurkish(line) !== normalizedCity) break
    cityLines.push(line)
  }

  return cityLines
}

function splitStationLine(line: string): WeatherStationSummary | null {
  const compactLine = line.replace(/[–—]/g, "-").trim()
  const tempMatch = compactLine.match(/(-?\d{1,2})\s*$/)
  if (!tempMatch) return null

  const content = compactLine.slice(0, tempMatch.index).trim()
  const parts = content.split(/\s+/)
  const weatherIndex = parts.findIndex((part) => WEATHER_STARTERS.includes(normalizeTurkish(part.replace(/[.,:;()]/g, ""))))
  if (weatherIndex <= 0) return null

  const rawDistrict = parts.slice(0, weatherIndex).join(" ")
  if (!rawDistrict) return null

  return {
    district: toDisplayText(rawDistrict),
    condition: "",
    temperature: "",
  }
}

function normalizeCenter(item: MgmCenterApiItem): WeatherCenter | null {
  const district = item.ilce || item.ilceAdi || item.merkezAdi || item.ad
  if (!district) return null
  return { district: toTurkishLabel(district) }
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "OkulPano/1.0",
      Accept: "application/json, text/plain, */*",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json()
}

function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const values = Object.values(payload as Record<string, unknown>)
    const firstArray = values.find(Array.isArray)
    if (Array.isArray(firstArray)) return firstArray as T[]
  }
  return []
}

async function fetchStationsFromMgmApi(cityName: string) {
  const payload = await fetchJson(`https://servis.mgm.gov.tr/api/merkezler?il=${encodeURIComponent(toTurkishLabel(cityName))}`)
  const centers = unwrapArray<MgmCenterApiItem>(payload).map(normalizeCenter).filter((item): item is WeatherCenter => Boolean(item))
  return centers.map((item) => ({ district: item.district, condition: "", temperature: "" }))
}

async function fetchStationsFromHtml(cityName: string) {
  const slug = getMgmCitySlug(cityName)
  const response = await fetch(`https://${slug}.mgm.gov.tr/tahmin-gunluk.aspx`, {
    headers: { "User-Agent": "OkulPano/1.0" },
    cache: "no-store",
  })

  if (!response.ok) throw new Error("MGM station request failed")

  const html = await response.text()
  const lines = htmlToLines(html)
  const cityLines = extractCitySection(lines, cityName)
  return cityLines.map(splitStationLine).filter((item): item is WeatherStationSummary => Boolean(item))
}

export async function fetchWeatherStations(cityCode: string) {
  const city = getMgmCityByCode(cityCode)
  const fallbackDistricts = getFallbackDistrictsByCityCode(cityCode)

  try {
    const stations = await fetchStationsFromMgmApi(city.name)
    return mergeStationLists(stations, fallbackDistricts)
  } catch {
    try {
      const stations = await fetchStationsFromHtml(city.name)
      return mergeStationLists(stations, fallbackDistricts)
    } catch {
      return mergeStationLists([], fallbackDistricts)
    }
  }
}

function mapOpenMeteoCode(code: number | undefined) {
  switch (code) {
    case 0:
      return { condition: "Açık", icon: "sun" }
    case 1:
    case 2:
    case 3:
      return { condition: "Parçalı Bulutlu", icon: "partly" }
    case 45:
    case 48:
      return { condition: "Sisli", icon: "fog" }
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return { condition: "Çiseli", icon: "rain" }
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return { condition: "Yağmurlu", icon: "rain" }
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return { condition: "Karlı", icon: "snow" }
    case 95:
    case 96:
    case 99:
      return { condition: "Fırtınalı", icon: "storm" }
    default:
      return { condition: "Bulutlu", icon: "cloud" }
  }
}

async function geocodeLocation(cityName: string, stationName?: string | null) {
  const stationLabel = stationName ? toTurkishLabel(stationName) : ""
  const asciiStation = stationLabel ? toAsciiSearch(stationLabel) : ""
  const asciiCity = toAsciiSearch(cityName)

  const queries = [
    stationLabel ? `${stationLabel}, ${cityName}, Turkey` : "",
    stationLabel ? `${asciiStation}, ${asciiCity}, Turkey` : "",
    stationLabel ? `${stationLabel}, ${cityName}` : "",
    stationLabel ? `${asciiStation}, ${asciiCity}` : "",
    `${cityName}, Turkey`,
    `${asciiCity}, Turkey`,
    cityName,
    asciiCity,
  ].filter(Boolean)

  const normalizedStation = normalizeTurkish(stationLabel)
  const normalizedCity = normalizeTurkish(cityName)

  for (const query of queries) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=tr&format=json`
    const payload = await fetchJson(url)
    const results = unwrapArray<OpenMeteoSearchResult>(payload)
    if (results.length === 0) continue

    const best = results.find((item) => {
      const haystack = [item.name, item.admin1, item.admin2, item.admin3, item.admin4]
        .filter(Boolean)
        .map((part) => normalizeTurkish(String(part)))
        .join(" ")

      if (normalizedStation) {
        return haystack.includes(normalizedStation) || (haystack.includes(normalizedCity) && haystack.includes(normalizedStation))
      }

      return haystack.includes(normalizedCity)
    }) ?? results[0]

    if (typeof best.latitude === "number" && typeof best.longitude === "number") {
      return {
        latitude: best.latitude,
        longitude: best.longitude,
        name: stationLabel || toTurkishLabel(best.name || cityName),
      }
    }
  }

  throw new Error("Geocoding failed")
}

async function fetchOpenMeteoForecast(cityName: string, stationName?: string | null) {
  const location = await geocodeLocation(cityName, stationName)
  const payload = (await fetchJson(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code,is_day&timezone=auto&forecast_days=1`)) as OpenMeteoCurrentResponse
  const current = payload.current
  const mapped = mapOpenMeteoCode(current?.weather_code)

  return {
    district: stationName ? toTurkishLabel(stationName) : cityName,
    condition: mapped.condition,
    temperature: typeof current?.temperature_2m === "number" ? `${Math.round(current.temperature_2m)}°C` : "--°C",
    icon: mapped.icon,
  }
}

async function fetchLegacyMgmCurrent(cityName: string, stationName?: string | null) {
  const slug = getMgmCitySlug(cityName)
  const response = await fetch(`https://${slug}.mgm.gov.tr/tahmin-gunluk.aspx`, {
    headers: { "User-Agent": "OkulPano/1.0" },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Legacy MGM request failed")
  }

  const html = await response.text()
  const lines = htmlToLines(html)
  const cityLines = extractCitySection(lines, cityName)
  const stations = cityLines.map(splitStationLine).filter((item): item is WeatherStationSummary => Boolean(item))
  const normalizedStation = normalizeTurkish(stationName ?? "")
  const normalizedCity = normalizeTurkish(cityName)
  const selected = stations.find((item) => normalizeTurkish(item.district) === normalizedStation)
    ?? stations.find((item) => normalizedStation && normalizeTurkish(item.district).includes(normalizedStation))
    ?? stations.find((item) => normalizeTurkish(item.district) === normalizedCity)
    ?? stations[0]

  if (!selected) {
    throw new Error("Legacy MGM current unavailable")
  }

  return {
    district: selected.district,
    condition: selected.condition || "Bulutlu",
    temperature: selected.temperature || "--°C",
    icon: "cloud",
  }
}

export async function fetchWeatherForecast(cityCode: string, stationName?: string | null) {
  const city = getMgmCityByCode(cityCode)
  const cityName = toTurkishLabel(city.name)

  try {
    return {
      city,
      selected: await fetchOpenMeteoForecast(cityName, stationName),
    }
  } catch {
    const legacy = await fetchLegacyMgmCurrent(cityName, stationName)
    return {
      city,
      selected: legacy,
    }
  }
}

export function getWeatherIcon(condition: string) {
  const normalized = normalizeTurkish(condition)

  if (normalized.includes("kar")) return "snow"
  if (normalized.includes("gok") || normalized.includes("firtina")) return "storm"
  if (normalized.includes("yagmur") || normalized.includes("cis")) return "rain"
  if (normalized.includes("parcali")) return "partly"
  if (normalized.includes("bulut")) return "cloud"
  if (normalized.includes("sis") || normalized.includes("pus")) return "fog"
  return "sun"
}



