"use client"

import { useCallback, useEffect, useState } from "react"

interface Announcement {
  id: string
  title: string
  content: string | null
  priority: string
  startsAt: string | null
  endsAt: string | null
  isActive: boolean
  sortOrder: number
}

const priorityLabels: Record<string, { label: string; className: string }> = {
  normal: { label: "Duyuru", className: "bg-slate-500/15 text-slate-200" },
  important: { label: "Önemli", className: "bg-amber-500/20 text-amber-200" },
  urgent: { label: "Önemli", className: "bg-amber-500/20 text-amber-200" },
}

const inputClassName = "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-sky-400/50 focus:bg-slate-950"

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "normal",
    startsAt: "",
    endsAt: "",
    isActive: true,
  })

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/announcements")
      setItems(await response.json())
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
    setForm({ title: "", content: "", priority: "normal", startsAt: "", endsAt: "", isActive: true })
    setEditing(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return

    const body = {
      ...form,
      priority: form.priority === "important" ? "important" : "normal",
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      content: form.content || null,
    }

    if (editing) {
      await fetch("/api/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing, ...body }),
      })
    } else {
      await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, sortOrder: items.length }),
      })
    }

    resetForm()
    void fetchData()
  }

  const handleEdit = (item: Announcement) => {
    setEditing(item.id)
    setForm({
      title: item.title,
      content: item.content || "",
      priority: item.priority === "important" || item.priority === "urgent" ? "important" : "normal",
      startsAt: item.startsAt ? item.startsAt.slice(0, 16) : "",
      endsAt: item.endsAt ? item.endsAt.slice(0, 16) : "",
      isActive: item.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) return
    await fetch(`/api/announcements?id=${id}`, { method: "DELETE" })
    void fetchData()
  }

  const toggleActive = async (item: Announcement) => {
    await fetch("/api/announcements", {
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
      <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-7 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/80">Duyuru Yönetimi</p>
            <h1 className="mt-3 text-3xl font-bold text-white">Duyurular</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">Display ekranında görünen duyuruları buradan yönetebilirsiniz. Öncelik yapısı sadeleştirildi: sadece Duyuru ve Önemli.</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true) }} className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            Yeni Duyuru
          </button>
        </div>
      </section>

      {showForm ? (
        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
          <h2 className="text-lg font-semibold text-white">{editing ? "Duyuruyu Düzenle" : "Yeni Duyuru"}</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/65">Başlık *</label>
              <input type="text" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClassName} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/65">İçerik</label>
              <textarea value={form.content} rows={4} onChange={(event) => setForm({ ...form, content: event.target.value })} className={`${inputClassName} resize-none`} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/65">Etiket</label>
                <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className={inputClassName}>
                  <option value="normal" className="bg-slate-900 text-white">Duyuru</option>
                  <option value="important" className="bg-slate-900 text-white">Önemli</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/65">Başlangıç Tarihi</label>
                <input type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} className={inputClassName} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/65">Bitiş Tarihi</label>
                <input type="datetime-local" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} className={inputClassName} />
              </div>
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-white/70">
              <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="h-4 w-4 rounded accent-sky-500" />
              Aktif olarak yayınla
            </label>
            <div className="flex gap-3">
              <button onClick={handleSave} className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">{editing ? "Güncelle" : "Kaydet"}</button>
              <button onClick={resetForm} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white">İptal</button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 py-14 text-center text-white/35">
            Henüz duyuru eklenmemiş.
          </div>
        ) : items.map((item) => {
          const accent = priorityLabels[item.priority] ?? priorityLabels.normal
          return (
            <article key={item.id} className={`flex flex-col gap-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] px-5 py-4 shadow-[0_12px_32px_rgba(0,0,0,0.14)] md:flex-row md:items-center md:justify-between ${item.isActive ? "" : "opacity-50"}`}>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${accent.className}`}>{accent.label}</span>
                  {!item.isActive ? <span className="text-xs uppercase tracking-[0.2em] text-white/35">Pasif</span> : null}
                </div>
                <p className="truncate text-base font-semibold text-white">{item.title}</p>
                {item.content ? <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/45">{item.content}</p> : null}
              </div>
              <div className="flex items-center gap-2 self-end md:self-auto">
                <button onClick={() => toggleActive(item)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white">{item.isActive ? "Pasifleştir" : "Aktifleştir"}</button>
                <button onClick={() => handleEdit(item)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white">Düzenle</button>
                <button onClick={() => handleDelete(item.id)} className="rounded-2xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 transition hover:bg-red-500/20">Sil</button>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}
