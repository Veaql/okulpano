"use client"

import { useCallback, useEffect, useState } from "react"
import { themes as themePresets } from "@/lib/themes"

async function readJsonSafely(response: Response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const inputClassName = "flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-sky-400/50 focus:bg-slate-950"

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
  })

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/settings")
      const data = await readJsonSafely(response)
      if (data?.settings) {
        setForm({
          theme: data.settings.theme || "modern",
          primaryColor: data.settings.primaryColor || "#1e3a5f",
          accentColor: data.settings.accentColor || "#f59e0b",
          cardRadius: data.settings.cardRadius || "12",
          fontScale: data.settings.fontScale || "100",
        })
      }
    } catch (error) {
      console.error(error)
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
      setMessage(response.ok ? "Tema kaydedildi" : "Tema kaydedilemedi")
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
      <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-7 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/80">Görünüm Sistemi</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Display Tema Ayarları</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">Tema seçimi, ana renk, vurgu rengi, köşe yuvarlaklığı ve yazı ölçeği doğrudan display yüzeyine uygulanır.</p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
          <h2 className="text-lg font-semibold text-white">Tema Ön Ayarları</h2>
          <p className="mt-1 text-sm text-white/45">Kurumsal çizgiyi bozmadan hızlı tema seçimi yapabilirsiniz.</p>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {Object.values(themePresets).map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setForm({ ...form, theme: theme.id, primaryColor: theme.colors.primary, accentColor: theme.colors.accent, cardRadius: theme.cardRadius.replace("px", ""), fontScale: String(theme.fontScale) })}
                className={`rounded-[24px] border p-4 text-left transition ${form.theme === theme.id ? "border-sky-400/40 bg-sky-500/10" : "border-white/10 bg-slate-950/35 hover:border-white/20"}`}
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

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
            <h2 className="text-lg font-semibold text-white">Renk ve Ölçek</h2>
            <div className="mt-5 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/65">Ana Renk</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.primaryColor} onChange={(event) => setForm({ ...form, primaryColor: event.target.value })} className="h-12 w-12 cursor-pointer rounded-2xl border-0 bg-transparent" />
                  <input type="text" value={form.primaryColor} onChange={(event) => setForm({ ...form, primaryColor: event.target.value })} className={inputClassName} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/65">Vurgu Rengi</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.accentColor} onChange={(event) => setForm({ ...form, accentColor: event.target.value })} className="h-12 w-12 cursor-pointer rounded-2xl border-0 bg-transparent" />
                  <input type="text" value={form.accentColor} onChange={(event) => setForm({ ...form, accentColor: event.target.value })} className={inputClassName} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/65">Kart Köşe Yuvarlaklığı</label>
                <input type="range" min="0" max="28" value={form.cardRadius} onChange={(event) => setForm({ ...form, cardRadius: event.target.value })} className="w-full accent-sky-400" />
                <p className="mt-2 text-xs text-white/45">{form.cardRadius}px</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/65">Yazı Ölçeği</label>
                <input type="range" min="85" max="130" value={form.fontScale} onChange={(event) => setForm({ ...form, fontScale: event.target.value })} className="w-full accent-sky-400" />
                <p className="mt-2 text-xs text-white/45">%{form.fontScale}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
            <h2 className="text-lg font-semibold text-white">Canlı Özet</h2>
            <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/40">
              <div className="h-24 px-5 py-4" style={{ background: `linear-gradient(135deg, ${form.primaryColor}, #0f172a)` }}>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">Display</p>
                <p className="mt-3 text-lg font-bold text-white">Deneme Anadolu Lisesi</p>
              </div>
              <div className="space-y-3 px-5 py-5">
                <div className="rounded-[20px] border border-white/10 p-4" style={{ borderRadius: `${form.cardRadius}px`, background: "rgba(255,255,255,0.04)" }}>
                  <div className="mb-3 h-1.5 w-20 rounded-full" style={{ background: form.accentColor }} />
                  <p className="font-semibold text-white" style={{ fontSize: `${Number(form.fontScale) * 0.15}px` }}>Bugünkü Nöbetçi Öğretmenler</p>
                  <p className="mt-2 text-sm text-white/45">Tema ve renk ayarları display kutularına uygulanır.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-[24px] border border-white/10 bg-slate-950/80 px-5 py-4 shadow-[0_18px_48px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <div>
            <p className="text-sm font-semibold text-white">Tema ayarları hazır</p>
            <p className="text-xs text-white/45">Kaydettiğinizde display ekranında renk ve ölçek güncellenecek.</p>
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

