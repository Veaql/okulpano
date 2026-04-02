"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  backgroundPatterns,
  colorPalettes,
  displayFonts,
  getDisplayBackground,
  getDisplayFont,
  themes as themePresets,
} from "@/lib/themes"

async function readJsonSafely(response: Response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const cardClassName =
  "rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.18)]"

const inputClassName =
  "flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-sky-400/50 focus:bg-slate-950"

export default function ThemePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [form, setForm] = useState({
    theme: "modern",
    primaryColor: "#1e3a5f",
    accentColor: "#f59e0b",
    cardRadius: "12",
    fontScale: "100",
    backgroundPattern: "default-grid",
    displayFont: "system",
  })

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/settings", { cache: "no-store" })
      const data = await readJsonSafely(response)
      if (data?.settings) {
        setForm({
          theme: data.settings.theme || "modern",
          primaryColor: data.settings.primaryColor || "#1e3a5f",
          accentColor: data.settings.accentColor || "#f59e0b",
          cardRadius: data.settings.cardRadius || "12",
          fontScale: data.settings.fontScale || "100",
          backgroundPattern: data.settings.backgroundPattern || "default-grid",
          displayFont: data.settings.displayFont || "system",
        })
      }
    } catch (error) {
      console.error(error)
      setMessage("Tema ayarları okunamadı")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: form }),
      })

      const payload = await readJsonSafely(response)
      if (!response.ok) {
        setMessage(payload?.error || "Tema kaydedilemedi")
      } else {
        setMessage("Tema kaydedildi. Display bir sonraki yenilemede güncellenecek.")
      }
    } catch {
      setMessage("Sunucu hatası")
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(""), 4000)
    }
  }

  const selectedTheme = useMemo(() => themePresets[form.theme] || themePresets.modern, [form.theme])
  const selectedFont = useMemo(() => getDisplayFont(form.displayFont), [form.displayFont])
  const previewBackground = useMemo(
    () => getDisplayBackground(form.backgroundPattern, selectedTheme.colors.background, form.primaryColor),
    [form.backgroundPattern, form.primaryColor, selectedTheme.colors.background],
  )

  if (loading) {
    return <div className="p-8 text-white/60">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-7 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/80">Görünüm Sistemi</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Display Tema Ayarları</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
          Arka plan deseni, renk seti ve font ailesi buradan yönetilir. Kullanıcı seçim yapmazsa mevcut tasarım varsayılan
          olarak aynen korunur.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <section className={cardClassName}>
              <h2 className="text-lg font-semibold text-white">Tema Ailesi</h2>
              <p className="mt-1 text-sm text-white/45">Temel görünüm çizgisini seçin.</p>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                {Object.values(themePresets).map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        theme: theme.id,
                        primaryColor: theme.colors.primary,
                        accentColor: theme.colors.accent,
                        cardRadius: theme.cardRadius.replace("px", ""),
                        fontScale: String(theme.fontScale),
                      }))
                    }
                    className={`rounded-[22px] border p-4 text-left transition ${
                      form.theme === theme.id ? "border-sky-400/40 bg-sky-500/10" : "border-white/10 bg-slate-950/35 hover:border-white/20"
                    }`}
                  >
                    <div className="mb-4 flex gap-2">
                      <div className="h-8 w-8 rounded-full" style={{ background: theme.colors.background }} />
                      <div className="h-8 w-8 rounded-full" style={{ background: theme.colors.primary }} />
                      <div className="h-8 w-8 rounded-full" style={{ background: theme.colors.accent }} />
                    </div>
                    <p className="text-sm font-semibold text-white">{theme.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/45">{theme.description}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className={cardClassName}>
              <h2 className="text-lg font-semibold text-white">Arka Plan Deseni</h2>
              <p className="mt-1 text-sm text-white/45">Varsayılan desen mevcut görünümü korur.</p>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {backgroundPatterns.map((pattern) => (
                  <button
                    key={pattern.id}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, backgroundPattern: pattern.id }))}
                    className={`rounded-[22px] border p-3 text-left transition ${
                      form.backgroundPattern === pattern.id ? "border-sky-400/40 bg-sky-500/10" : "border-white/10 bg-slate-950/35 hover:border-white/20"
                    }`}
                  >
                    <div className="h-24 rounded-[16px] border border-white/10" style={{ backgroundImage: pattern.preview }} />
                    <p className="mt-3 text-sm font-semibold text-white">{pattern.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/45">{pattern.description}</p>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className={cardClassName}>
              <h2 className="text-lg font-semibold text-white">Renk Seti</h2>
              <p className="mt-1 text-sm text-white/45">Hazır palet seçebilir veya aşağıdan özel renk verebilirsiniz.</p>
              <div className="mt-5 grid grid-cols-1 gap-3">
                {colorPalettes.map((palette) => (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, primaryColor: palette.primary, accentColor: palette.accent }))}
                    className={`rounded-[20px] border p-3 text-left transition ${
                      form.primaryColor === palette.primary && form.accentColor === palette.accent
                        ? "border-sky-400/40 bg-sky-500/10"
                        : "border-white/10 bg-slate-950/35 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{palette.name}</p>
                        <p className="mt-1 text-xs leading-relaxed text-white/45">{palette.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 w-8 rounded-full" style={{ background: palette.primary }} />
                        <div className="h-8 w-8 rounded-full" style={{ background: palette.accent }} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/65">Ana renk</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={(event) => setForm((current) => ({ ...current, primaryColor: event.target.value }))}
                      className="h-11 w-11 cursor-pointer rounded-2xl border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={form.primaryColor}
                      onChange={(event) => setForm((current) => ({ ...current, primaryColor: event.target.value }))}
                      className={inputClassName}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/65">Vurgu rengi</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.accentColor}
                      onChange={(event) => setForm((current) => ({ ...current, accentColor: event.target.value }))}
                      className="h-11 w-11 cursor-pointer rounded-2xl border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={form.accentColor}
                      onChange={(event) => setForm((current) => ({ ...current, accentColor: event.target.value }))}
                      className={inputClassName}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className={cardClassName}>
              <h2 className="text-lg font-semibold text-white">Font ve Ölçek</h2>
              <div className="mt-5 space-y-4">
                {displayFonts.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, displayFont: font.id }))}
                    className={`w-full rounded-[20px] border p-4 text-left transition ${
                      form.displayFont === font.id ? "border-sky-400/40 bg-sky-500/10" : "border-white/10 bg-slate-950/35 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{font.name}</p>
                        <p className="mt-1 text-xs leading-relaxed text-white/45">{font.description}</p>
                      </div>
                      <p className="text-lg text-white" style={{ fontFamily: font.stack }}>
                        {font.preview}
                      </p>
                    </div>
                  </button>
                ))}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-white/65">Kart köşe yuvarlaklığı</label>
                    <input
                      type="range"
                      min="0"
                      max="28"
                      value={form.cardRadius}
                      onChange={(event) => setForm((current) => ({ ...current, cardRadius: event.target.value }))}
                      className="w-full accent-sky-400"
                    />
                    <p className="mt-2 text-xs text-white/45">{form.cardRadius}px</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-white/65">Yazı ölçeği</label>
                    <input
                      type="range"
                      min="85"
                      max="130"
                      value={form.fontScale}
                      onChange={(event) => setForm((current) => ({ ...current, fontScale: event.target.value }))}
                      className="w-full accent-sky-400"
                    />
                    <p className="mt-2 text-xs text-white/45">%{form.fontScale}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>

        <section className={cardClassName}>
          <h2 className="text-lg font-semibold text-white">Canlı Özet</h2>
          <p className="mt-1 text-sm text-white/45">Kaydettiğinizde display yüzeyinde buna yakın bir görünüm oluşur.</p>
          <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/40">
            <div
              className="h-28 px-5 py-4"
              style={{
                background: previewBackground,
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">Display</p>
              <p className="mt-3 text-lg font-bold text-white" style={{ fontFamily: selectedFont.stack }}>
                Deneme Anadolu Lisesi
              </p>
            </div>
            <div className="space-y-3 px-5 py-5">
              <div
                className="rounded-[20px] border p-4"
                style={{
                  borderRadius: `${form.cardRadius}px`,
                  borderColor: "rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <div className="mb-3 h-1.5 w-24 rounded-full" style={{ background: form.accentColor }} />
                <p
                  className="font-semibold text-white"
                  style={{ fontFamily: selectedFont.stack, fontSize: `${Math.max(Number(form.fontScale) * 0.15, 14)}px` }}
                >
                  Bugünkü Nöbetçi Öğretmenler
                </p>
                <p className="mt-2 text-sm text-white/50">Tema, desen ve font seçimleri display kutularına birlikte uygulanır.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-[24px] border border-white/10 bg-slate-950/80 px-5 py-4 shadow-[0_18px_48px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <div>
            <p className="text-sm font-semibold text-white">Tema ayarları hazır</p>
            <p className="text-xs text-white/45">Kaydettiğinizde display ekranı bir sonraki yenilemede güncellenecek.</p>
          </div>
          <div className="flex items-center gap-4">
            {message ? <span className="max-w-[360px] text-right text-sm text-emerald-400">{message}</span> : null}
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-500/40"
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
