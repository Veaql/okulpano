"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

interface ScheduleBlock {
  id: string
  blockType: string
  label: string
  startTime: string
  endTime: string
  sortOrder: number
}

const blockTypeLabels: Record<string, string> = {
  lesson: "Ders",
  break: "Teneffüs",
  lunch: "Öğle Arası",
}

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert focus:border-sky-400/50 focus:bg-slate-950"

async function readJsonSafely(response: Response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export default function SchedulePage() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [form, setForm] = useState({
    blockType: "lesson",
    label: "",
    startTime: "",
    endTime: "",
  })

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/schedule", { cache: "no-store" })
      const data = await readJsonSafely(response)
      setBlocks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      setBlocks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const orderedBlocks = useMemo(
    () => [...blocks].sort((left, right) => left.sortOrder - right.sortOrder),
    [blocks],
  )

  const resetForm = () => {
    setForm({ blockType: "lesson", label: "", startTime: "", endTime: "" })
    setEditing(null)
  }

  const handleSave = async () => {
    if (!form.startTime || !form.endTime) {
      setMessage("Başlangıç ve bitiş saatleri zorunludur")
      return
    }

    setSaving(true)
    const label = form.label.trim() || blockTypeLabels[form.blockType] || "Blok"

    try {
      const response = await fetch("/api/schedule", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editing
            ? { id: editing, ...form, label }
            : { ...form, label, sortOrder: orderedBlocks.length },
        ),
      })

      if (!response.ok) {
        setMessage("Blok kaydedilemedi")
        return
      }

      setMessage(editing ? "Blok güncellendi" : "Blok eklendi")
      resetForm()
      await fetchData()
    } catch (error) {
      console.error(error)
      setMessage("Sunucu hatası")
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const handleEdit = (block: ScheduleBlock) => {
    setEditing(block.id)
    setForm({
      blockType: block.blockType,
      label: block.label,
      startTime: block.startTime,
      endTime: block.endTime,
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu blok silinsin mi?")) return

    try {
      await fetch(`/api/schedule?id=${id}`, { method: "DELETE" })
      await fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  const getBlockTone = (type: string) => {
    switch (type) {
      case "lesson":
        return "border-sky-400/20 bg-sky-500/10 text-sky-100"
      case "break":
        return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
      case "lunch":
        return "border-amber-400/20 bg-amber-500/10 text-amber-100"
      default:
        return "border-white/10 bg-white/5 text-white"
    }
  }

  if (loading) {
    return <div className="p-8 text-white/60">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-7 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/80">
          Zaman Planı
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white">Ders Saatleri</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
          Ders, teneffüs ve öğle arası bloklarını buradan yönetebilirsiniz. Tür
          seçimi beyaz açılır menü yerine doğrudan koyu kart düğmeleriyle yapılır.
        </p>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {editing ? "Blok Düzenle" : "Yeni Blok Ekle"}
            </h2>
            <p className="mt-1 text-sm text-white/45">
              Display ekranındaki zaman çizelgesi bu listedeki sıraya göre oluşur.
            </p>
          </div>
          {message ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-emerald-300">
              {message}
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
          <div className="xl:col-span-1">
            <label className="mb-2 block text-sm font-medium text-white/65">Blok Türü</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(blockTypeLabels).map(([value, label]) => {
                const active = form.blockType === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        blockType: value,
                        label:
                          current.label.trim() && current.label !== blockTypeLabels[current.blockType]
                            ? current.label
                            : label,
                      }))
                    }
                    className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                      active
                        ? "border-sky-400/40 bg-sky-500/12 text-white"
                        : "border-white/10 bg-slate-950/40 text-white/65 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/65">Etiket</label>
            <input
              type="text"
              value={form.label}
              onChange={(event) => setForm({ ...form, label: event.target.value })}
              className={inputClassName}
              placeholder="Örn: 1. Ders"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/65">Başlangıç</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(event) => setForm({ ...form, startTime: event.target.value })}
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/65">Bitiş</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(event) => setForm({ ...form, endTime: event.target.value })}
              className={inputClassName}
            />
          </div>

          <div className="flex gap-2 xl:self-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-500/40"
            >
              {saving ? "Kaydediliyor..." : editing ? "Güncelle" : "Ekle"}
            </button>
            {editing ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                İptal
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
        <h2 className="text-lg font-semibold text-white">Program Blokları</h2>
        <p className="mt-1 text-sm text-white/45">
          Bu listedeki sıra display ekranındaki ders akışında kullanılır.
        </p>

        {orderedBlocks.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-4 py-12 text-center text-white/35">
            Henüz blok eklenmedi.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {orderedBlocks.map((block, index) => (
              <div
                key={block.id}
                className={`flex flex-col gap-3 rounded-[22px] border px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.14)] md:flex-row md:items-center md:justify-between ${getBlockTone(block.blockType)}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/10 text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-base font-semibold">{block.label}</p>
                    <p className="mt-1 text-sm opacity-70">
                      {block.startTime} - {block.endTime} •{" "}
                      {blockTypeLabels[block.blockType] || block.blockType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    type="button"
                    onClick={() => handleEdit(block)}
                    className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(block.id)}
                    className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
