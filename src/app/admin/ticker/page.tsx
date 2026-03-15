"use client"

import { useCallback, useEffect, useState } from "react"

interface TickerMessage {
  id: string
  text: string
  speed: number
  textColor: string
  backgroundColor: string
  isEmergency: boolean
  isActive: boolean
  sortOrder: number
}

const inputClassName = "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-sky-400/50 focus:bg-slate-950"

export default function TickerPage() {
  const [items, setItems] = useState<TickerMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({
    text: "",
    speed: 50,
    textColor: "#ffffff",
    backgroundColor: "#1e3a5f",
    isEmergency: false,
    isActive: true,
  })

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/ticker")
      const data = await response.json()
      setItems(Array.isArray(data) ? data.filter((item) => typeof item.text === "string" && !item.text.toLowerCase().includes("okulpano.com")) : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const resetForm = () => {
    setForm({ text: "", speed: 50, textColor: "#ffffff", backgroundColor: "#1e3a5f", isEmergency: false, isActive: true })
    setEditing(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    if (!form.text.trim()) return

    const payload = {
      ...form,
      backgroundColor: form.isEmergency ? "#dc2626" : form.backgroundColor,
      textColor: form.isEmergency ? "#ffffff" : form.textColor,
    }

    if (editing) {
      await fetch("/api/ticker", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing, ...payload }),
      })
    } else {
      await fetch("/api/ticker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }

    resetForm()
    void fetchData()
  }

  const handleEdit = (item: TickerMessage) => {
    setEditing(item.id)
    setForm({
      text: item.text,
      speed: item.speed,
      textColor: item.textColor,
      backgroundColor: item.backgroundColor,
      isEmergency: item.isEmergency,
      isActive: item.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kayan yazıyı silmek istediğinize emin misiniz?")) return
    await fetch(`/api/ticker?id=${id}`, { method: "DELETE" })
    void fetchData()
  }

  const toggleActive = async (item: TickerMessage) => {
    await fetch("/api/ticker", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, isActive: !item.isActive }),
    })
    void fetchData()
  }

  if (loading) {
    return <div className="p-8 text-white/60">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.10),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-7 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300/80">Yayın Bandı</p>
            <h1 className="mt-3 text-3xl font-bold text-white">Kayan Yazı</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">Alt yayın bandında gösterilecek metinleri yönetin. Sistem mesajı olarak eklenmiş eski `okulpano.com` girdileri listeden kaldırıldı.</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true) }} className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            Yeni Mesaj
          </button>
        </div>
      </section>

      {showForm ? (
        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
          <h2 className="text-lg font-semibold text-white">{editing ? "Mesajı Düzenle" : "Yeni Kayan Yazı"}</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/65">Mesaj Metni *</label>
              <input type="text" value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} className={inputClassName} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/65">Akış Hızı</label>
                <input type="range" min={20} max={100} value={form.speed} onChange={(event) => setForm({ ...form, speed: parseInt(event.target.value, 10) })} className="w-full accent-sky-400" />
                <p className="mt-2 text-xs text-white/45">{form.speed}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/65">Yazı Rengi</label>
                <input type="color" value={form.textColor} onChange={(event) => setForm({ ...form, textColor: event.target.value })} className="h-12 w-12 cursor-pointer rounded-2xl border-0 bg-transparent" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/65">Arka Plan</label>
                <input type="color" value={form.backgroundColor} onChange={(event) => setForm({ ...form, backgroundColor: event.target.value })} className="h-12 w-12 cursor-pointer rounded-2xl border-0 bg-transparent" />
              </div>
              <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-white/70">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={form.isEmergency} onChange={(event) => setForm({ ...form, isEmergency: event.target.checked })} className="h-4 w-4 rounded accent-red-500" />
                  Acil yayın rengi kullan
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="h-4 w-4 rounded accent-sky-500" />
                  Aktif
                </label>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55">
              <div className="px-4 py-3 text-sm font-medium" style={{ backgroundColor: form.isEmergency ? "#dc2626" : form.backgroundColor, color: form.textColor }}>
                {form.text || "Önizleme metni burada görünecek."}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSave} className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">{editing ? "Güncelle" : "Kaydet"}</button>
              <button onClick={resetForm} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white">İptal</button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 py-14 text-center text-white/35">Henüz kayan yazı eklenmemiş.</div>
        ) : items.map((item) => (
          <article key={item.id} className={`flex flex-col gap-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] px-5 py-4 shadow-[0_12px_32px_rgba(0,0,0,0.14)] md:flex-row md:items-center md:justify-between ${item.isActive ? "" : "opacity-50"}`}>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-3">
                <div className="h-3 w-3 rounded-full" style={{ background: item.isEmergency ? "#dc2626" : item.backgroundColor }} />
                {item.isEmergency ? <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-red-200">Acil</span> : null}
                {!item.isActive ? <span className="text-xs uppercase tracking-[0.2em] text-white/35">Pasif</span> : null}
              </div>
              <p className="truncate text-base font-semibold text-white">{item.text}</p>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button onClick={() => toggleActive(item)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white">{item.isActive ? "Pasifleştir" : "Aktifleştir"}</button>
              <button onClick={() => handleEdit(item)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white">Düzenle</button>
              <button onClick={() => handleDelete(item.id)} className="rounded-2xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 transition hover:bg-red-500/20">Sil</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
