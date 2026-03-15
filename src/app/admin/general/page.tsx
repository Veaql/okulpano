"use client"

import { useCallback, useEffect, useState } from "react"
import { MGM_CITIES, toTurkishLabel } from "@/lib/mgm"
import { TRT_CATEGORIES } from "@/lib/trt"

interface SchoolData {
  id: string
  name: string
  shortName: string | null
  city: string | null
  district: string | null
  timezone: string
  settings: {
    dateFormat: string
    timeFormat: string
    showSeconds: boolean
    refreshInterval: number
    activeWidget: string
    examName: string | null
    examDate: string | null
    trtCategory: string
    showTrtNews: boolean
    showWeather: boolean
    showWidget: boolean
    weatherCityCode: string
    weatherStation: string | null
    weatherLabel: string | null
  } | null
}

const DEFAULT_MEAL_ITEMS = [
  "Mercimek Çorbası",
  "Tavuk Sote",
  "Pirinç Pilavı",
  "Mevsim Salata",
  "Ayran",
]

async function readJsonSafely(response: Response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function toDateTimeLocal(value: string | null | undefined) {
  if (!value) return ""

  const date = new Date(value)
  const localOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - localOffset).toISOString().slice(0, 16)
}

function parseMealItemsText(value: string | null | undefined) {
  if (!value) {
    return DEFAULT_MEAL_ITEMS.join("\n")
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return DEFAULT_MEAL_ITEMS.join("\n")
  }

  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) {
      const items = parsed.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
      return (items.length > 0 ? items : DEFAULT_MEAL_ITEMS).join("\n")
    }
  } catch {
    return trimmed
  }

  return DEFAULT_MEAL_ITEMS.join("\n")
}

const examDefaults = {
  yks: { name: "YKS", date: "2026-06-20T09:30" },
  lgs: { name: "LGS", date: "2026-06-14T09:30" },
} as const

function getExamDefaults(widget: string) {
  return widget === "lgs" ? examDefaults.lgs : examDefaults.yks
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-relaxed text-white/45">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm font-medium text-white/65">{children}</label>
}

const inputClassName = "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-white/20 focus:border-sky-400/50 focus:bg-slate-950"
const textareaClassName = `${inputClassName} min-h-[152px] resize-y`
const selectClassName = "w-full appearance-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-sky-400/50 focus:bg-slate-950"

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [stations, setStations] = useState<string[]>([])
  const [stationsLoading, setStationsLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    shortName: "",
    city: "",
    district: "",
    timezone: "Europe/Istanbul",
    dateFormat: "DD MMMM YYYY - dddd",
    timeFormat: "HH:mm",
    refreshInterval: 15,
    activeWidget: "meal",
    examName: "YKS",
    examDate: "2026-06-20T09:30",
    mealItemsText: DEFAULT_MEAL_ITEMS.join("\n"),
    trtCategory: "gundem",
    showTrtNews: true,
    showWeather: true,
    showWidget: true,
    weatherCityCode: "34",
    weatherStation: "",
  })

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/settings", { cache: "no-store" })
      const data = (await readJsonSafely(response)) as SchoolData | null
      if (!data) return

      const activeWidget = data.settings?.activeWidget || "meal"
      const examDefaultsForWidget = getExamDefaults(activeWidget)

      setForm({
        name: data.name || "",
        shortName: data.shortName || "",
        city: data.city || "",
        district: data.district || "",
        timezone: data.timezone || "Europe/Istanbul",
        dateFormat: data.settings?.dateFormat || "DD MMMM YYYY - dddd",
        timeFormat: data.settings?.timeFormat || "HH:mm",
        refreshInterval: data.settings?.refreshInterval || 15,
        activeWidget,
        examName: data.settings?.examName || examDefaultsForWidget.name,
        examDate: toDateTimeLocal(data.settings?.examDate) || examDefaultsForWidget.date,
        mealItemsText: parseMealItemsText(data.settings?.weatherLabel),
        trtCategory: data.settings?.trtCategory || "gundem",
        showTrtNews: data.settings?.showTrtNews ?? true,
        showWeather: data.settings?.showWeather ?? true,
        showWidget: data.settings?.showWidget ?? true,
        weatherCityCode: data.settings?.weatherCityCode || "34",
        weatherStation: data.settings?.weatherStation || "",
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStations = useCallback(async (cityCode: string) => {
    setStationsLoading(true)
    try {
      const response = await fetch(`/api/weather/stations?cityCode=${cityCode}`, { cache: "no-store" })
      const data = await readJsonSafely(response)
      setStations(Array.isArray(data?.stations) ? data.stations : [])
    } catch {
      setStations([])
    } finally {
      setStationsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  useEffect(() => {
    void fetchStations(form.weatherCityCode)
  }, [fetchStations, form.weatherCityCode])

  const handleWidgetChange = (nextWidget: string) => {
    setForm((current) => {
      if (nextWidget === "meal") {
        return { ...current, activeWidget: nextWidget }
      }

      const defaults = getExamDefaults(nextWidget)
      const trimmedName = current.examName.trim().toUpperCase()
      const shouldReplaceName = !current.examName || trimmedName === "YKS" || trimmedName === "LGS"
      const shouldReplaceDate = !current.examDate || current.examDate === examDefaults.yks.date || current.examDate === examDefaults.lgs.date

      return {
        ...current,
        activeWidget: nextWidget,
        examName: shouldReplaceName ? defaults.name : current.examName,
        examDate: shouldReplaceDate ? defaults.date : current.examDate,
      }
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage("")

    const mealItems = form.mealItemsText
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean)

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          shortName: form.shortName || null,
          city: form.city || null,
          district: form.district || null,
          slogan: null,
          timezone: form.timezone,
          settings: {
            dateFormat: form.dateFormat,
            timeFormat: form.timeFormat,
            showSeconds: form.timeFormat === "HH:mm:ss",
            refreshInterval: form.refreshInterval,
            activeWidget: form.activeWidget,
            widgetPosition: "right",
            examName: form.activeWidget === "meal" ? null : form.examName || null,
            examDate: form.activeWidget === "meal" ? null : form.examDate ? new Date(form.examDate).toISOString() : null,
            trtCategory: form.trtCategory,
            showTrtNews: form.showTrtNews,
            showWeather: form.showWeather,
            showWidget: form.showWidget,
            weatherCityCode: form.weatherCityCode,
            weatherStation: form.weatherStation || null,
            weatherLabel: JSON.stringify(mealItems.length > 0 ? mealItems : DEFAULT_MEAL_ITEMS),
          },
        }),
      })

      const result = await readJsonSafely(response)
      if (response.ok) {
        setMessage("Ayarlar kaydedildi")
      } else {
        setMessage(typeof result?.error === "string" ? result.error : "Kaydetme başarısız")
      }
    } catch {
      setMessage("Sunucu hatası")
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  if (loading) {
    return <div className="p-8 text-white/60">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-7 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/80">OkulPano Yönetimi</p>
            <h1 className="mt-3 text-3xl font-bold text-white">Genel Ayarlar</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">Display ekranındaki kurumsal bilgi alanlarını bu panelden düzenleyebilirsiniz. Gereksiz alanlar kaldırıldı; sadece ekranı etkileyen ayarlar bırakıldı.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white/60">
            <p>Kaydedilen değişiklikler display tarafına yenileme aralığında yansır.</p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <SectionCard title="Okul Bilgileri" description="Başlık alanında görünen temel okul bilgileri.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FieldLabel>Okul Adı *</FieldLabel>
              <input type="text" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClassName} />
            </div>
            <div>
              <FieldLabel>Kısa Ad</FieldLabel>
              <input type="text" value={form.shortName} onChange={(event) => setForm({ ...form, shortName: event.target.value })} className={inputClassName} />
            </div>
            <div>
              <FieldLabel>İl</FieldLabel>
              <input type="text" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} className={inputClassName} />
            </div>
            <div>
              <FieldLabel>İlçe</FieldLabel>
              <input type="text" value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })} className={inputClassName} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Sağ Alt Pano" description="Sağ alt bölümde yemek listesi mi, sınav sayacı mı gösterileceğini seçin.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>Gösterilecek Modül</FieldLabel>
              <select value={form.activeWidget} onChange={(event) => handleWidgetChange(event.target.value)} className={selectClassName}>
                <option value="meal" className="bg-slate-900 text-white">Yemek Listesi</option>
                <option value="yks" className="bg-slate-900 text-white">YKS Sayacı</option>
                <option value="lgs" className="bg-slate-900 text-white">LGS Sayacı</option>
              </select>
            </div>
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white">
              <div>
                <p className="text-sm font-semibold">Sağ Alt Pano Gösterimi</p>
                <p className="mt-1 text-xs text-white/45">Yemek listesi veya sınav sayacı alanını açıp kapatır.</p>
              </div>
              <input type="checkbox" checked={form.showWidget} onChange={(event) => setForm({ ...form, showWidget: event.target.checked })} className="h-5 w-5 rounded border-white/20 bg-slate-900 text-sky-500" />
            </label>

            {form.activeWidget === "meal" ? (
              <div className="md:col-span-2">
                <FieldLabel>Bugünkü Yemekler</FieldLabel>
                <textarea
                  value={form.mealItemsText}
                  onChange={(event) => setForm({ ...form, mealItemsText: event.target.value })}
                  className={textareaClassName}
                />
                <p className="mt-2 text-xs text-white/45">Her satıra bir yemek yazın. Display tarafındaki yemek listesi doğrudan bu içerikten oluşur.</p>
              </div>
            ) : (
              <>
                <div>
                  <FieldLabel>Sınav Adı</FieldLabel>
                  <input type="text" value={form.examName} onChange={(event) => setForm({ ...form, examName: event.target.value })} className={inputClassName} />
                </div>
                <div>
                  <FieldLabel>Sınav Tarihi ve Saati</FieldLabel>
                  <input type="datetime-local" value={form.examDate} onChange={(event) => setForm({ ...form, examDate: event.target.value })} className={inputClassName} />
                </div>
              </>
            )}
          </div>
        </SectionCard>

        <SectionCard title="TRT Haber Ayarları" description="Nöbetçi öğretmen panelinin altındaki TRT haber alanını yönetin. İnternet olmadan çalışmaz.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <FieldLabel>TRT Haber Kategorisi</FieldLabel>
              <select value={form.trtCategory} onChange={(event) => setForm({ ...form, trtCategory: event.target.value })} className={selectClassName}>
                {TRT_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id} className="bg-slate-900 text-white">{category.label}</option>
                ))}
              </select>
            </div>
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white">
              <div>
                <p className="text-sm font-semibold">TRT Haber Gösterimi</p>
                <p className="mt-1 text-xs text-white/45">Display ekranındaki TRT haber kutusunu açıp kapatır. İnternet bağlantısı gerekir.</p>
              </div>
              <input type="checkbox" checked={form.showTrtNews} onChange={(event) => setForm({ ...form, showTrtNews: event.target.checked })} className="h-5 w-5 rounded border-white/20 bg-slate-900 text-sky-500" />
            </label>
          </div>
        </SectionCard>

        <SectionCard title="Hava Durumu" description="Display ekranında kullanılacak il ve istasyonu seçin. İnternet olmadan çalışmaz.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white md:col-span-2">
              <div>
                <p className="text-sm font-semibold">Hava Durumu Gösterimi</p>
                <p className="mt-1 text-xs text-white/45">Display ekranındaki hava durumu kutusunu açıp kapatır. İnternet bağlantısı gerekir.</p>
              </div>
              <input type="checkbox" checked={form.showWeather} onChange={(event) => setForm({ ...form, showWeather: event.target.checked })} className="h-5 w-5 rounded border-white/20 bg-slate-900 text-sky-500" />
            </label>
            <div>
              <FieldLabel>Hava Durumu İli</FieldLabel>
              <select value={form.weatherCityCode} onChange={(event) => setForm({ ...form, weatherCityCode: event.target.value, weatherStation: "" })} className={selectClassName}>
                {MGM_CITIES.map((city) => (
                  <option key={city.code} value={city.code} className="bg-slate-900 text-white">{`[${city.code}] ${toTurkishLabel(city.name).toLocaleUpperCase("tr-TR")}`}</option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Hava Durumu İstasyonu</FieldLabel>
              <select value={form.weatherStation} onChange={(event) => setForm({ ...form, weatherStation: event.target.value })} className={selectClassName}>
                <option value="" className="bg-slate-900 text-white">{stationsLoading ? "İstasyonlar yükleniyor..." : "İl merkezi / otomatik"}</option>
                {stations.map((station) => (
                  <option key={station} value={station} className="bg-slate-900 text-white">{station}</option>
                ))}
              </select>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Ekran Ayarları" description="Saat, tarih ve yenileme davranışlarını belirleyin.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>Tarih Formatı</FieldLabel>
              <select value={form.dateFormat} onChange={(event) => setForm({ ...form, dateFormat: event.target.value })} className={selectClassName}>
                <option value="DD MMMM YYYY - dddd" className="bg-slate-900 text-white">22 Ekim 2024 - Salı</option>
                <option value="DD.MM.YYYY" className="bg-slate-900 text-white">22.10.2024</option>
                <option value="DD/MM/YYYY" className="bg-slate-900 text-white">22/10/2024</option>
              </select>
            </div>
            <div>
              <FieldLabel>Saat Formatı</FieldLabel>
              <select value={form.timeFormat} onChange={(event) => setForm({ ...form, timeFormat: event.target.value })} className={selectClassName}>
                <option value="HH:mm" className="bg-slate-900 text-white">14:30</option>
                <option value="HH:mm:ss" className="bg-slate-900 text-white">14:30:45</option>
              </select>
            </div>
            <div>
              <FieldLabel>Yenileme Aralığı (saniye)</FieldLabel>
              <input type="number" min={5} max={120} value={form.refreshInterval} onChange={(event) => setForm({ ...form, refreshInterval: parseInt(event.target.value, 10) || 15 })} className={inputClassName} />
            </div>
            <div>
              <FieldLabel>Zaman Dilimi</FieldLabel>
              <select value={form.timezone} onChange={(event) => setForm({ ...form, timezone: event.target.value })} className={selectClassName}>
                <option value="Europe/Istanbul" className="bg-slate-900 text-white">Türkiye (UTC+3)</option>
              </select>
            </div>
          </div>
        </SectionCard>

        <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-[24px] border border-white/10 bg-slate-950/80 px-5 py-4 shadow-[0_18px_48px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <div>
            <p className="text-sm font-semibold text-white">Genel ayarlar hazır</p>
            <p className="text-xs text-white/45">Kaydettiğinde display ekranı bir sonraki yenilemede güncellenecek.</p>
          </div>
          <div className="flex items-center gap-4">
            {message ? <span className="text-sm text-emerald-400">{message}</span> : null}
            <button type="submit" disabled={saving} className="rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-500/40">
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
