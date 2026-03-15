"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

interface Location {
  id: string
  name: string
  sortOrder: number
}

interface Assignment {
  id: string
  weekday: number
  personName: string
  note: string | null
  sortOrder: number
  dutyLocation: { id: string; name: string }
}

const weekdays = [
  { value: 1, label: "Pazartesi" },
  { value: 2, label: "Salı" },
  { value: 3, label: "Çarşamba" },
  { value: 4, label: "Perşembe" },
  { value: 5, label: "Cuma" },
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

const inputClassName = "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-white/20 focus:border-sky-400/50 focus:bg-slate-950"

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-relaxed text-white/45">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

export default function DutyPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDay, setSelectedDay] = useState(1)
  const [newLocation, setNewLocation] = useState("")
  const [assignForm, setAssignForm] = useState({ personName: "", dutyLocationId: "", note: "" })

  const selectedDayLabel = useMemo(() => weekdays.find((item) => item.value === selectedDay)?.label ?? "Pazartesi", [selectedDay])

  const fetchData = useCallback(async () => {
    try {
      const [locationsResponse, assignmentsResponse] = await Promise.all([
        fetch("/api/duty?type=locations", { cache: "no-store" }),
        fetch(`/api/duty?type=assignments&weekday=${selectedDay}`, { cache: "no-store" }),
      ])

      const nextLocations = await readJsonSafely(locationsResponse)
      const nextAssignments = await readJsonSafely(assignmentsResponse)

      setLocations(Array.isArray(nextLocations) ? nextLocations : [])
      setAssignments(Array.isArray(nextAssignments) ? nextAssignments : [])
    } catch (error) {
      console.error(error)
      setLocations([])
      setAssignments([])
    } finally {
      setLoading(false)
      setSaving(false)
    }
  }, [selectedDay])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const addLocation = async () => {
    if (!newLocation.trim()) return
    setSaving(true)

    try {
      await fetch("/api/duty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newLocation.trim(), sortOrder: locations.length }),
      })
      setNewLocation("")
      await fetchData()
    } finally {
      setSaving(false)
    }
  }

  const deleteLocation = async (id: string) => {
    if (!confirm("Bu görev alanını silmek istediğinize emin misiniz?")) return
    setSaving(true)

    try {
      await fetch(`/api/duty?id=${id}&type=location`, { method: "DELETE" })
      if (assignForm.dutyLocationId === id) {
        setAssignForm((current) => ({ ...current, dutyLocationId: "" }))
      }
      await fetchData()
    } finally {
      setSaving(false)
    }
  }

  const addAssignment = async () => {
    if (!assignForm.personName.trim() || !assignForm.dutyLocationId) return
    setSaving(true)

    try {
      await fetch("/api/duty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "assignment",
          weekday: selectedDay,
          personName: assignForm.personName.trim(),
          dutyLocationId: assignForm.dutyLocationId,
          note: assignForm.note.trim() || null,
          sortOrder: assignments.length,
        }),
      })
      setAssignForm({ personName: "", dutyLocationId: "", note: "" })
      await fetchData()
    } finally {
      setSaving(false)
    }
  }

  const deleteAssignment = async (id: string) => {
    setSaving(true)

    try {
      await fetch(`/api/duty?id=${id}&type=assignment`, { method: "DELETE" })
      await fetchData()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-white/60">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-7 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/80">Görev Planlama</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Nöbet Programı</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">Görev alanlarını ekleyin, ardından seçili güne nöbetçi öğretmen atayın. Alan seçimi artık beyaz açılan menü yerine doğrudan görünür seçim kartlarıyla yapılıyor.</p>
      </section>

      <SectionCard title="Görev Alanları" description="Display ekranında listelenecek alanları buradan yönetin.">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            value={newLocation}
            onChange={(event) => setNewLocation(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), void addLocation())}
            className={inputClassName}
            placeholder="Görev alanı adı"
          />
          <button
            type="button"
            onClick={addLocation}
            disabled={saving}
            className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-500/40"
          >
            Alan Ekle
          </button>
        </div>

        {locations.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/35">Henüz görev alanı eklenmedi.</div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2.5">
            {locations.map((location) => (
              <div key={location.id} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-2 text-sm font-medium text-white/85">
                <span>{location.name}</span>
                <button type="button" onClick={() => deleteLocation(location.id)} className="rounded-full px-2 py-0.5 text-xs text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200">
                  Sil
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Gün Seçimi" description="Atama yapacağınız günü seçin.">
        <div className="flex flex-wrap gap-2">
          {weekdays.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => setSelectedDay(day.value)}
              className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${selectedDay === day.value ? "bg-sky-500 text-slate-950" : "border border-white/10 bg-slate-950/40 text-white/65 hover:text-white"}`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={`${selectedDayLabel} Nöbetçisi`} description="Öğretmen bilgisi girin, ardından görev alanını kartlardan seçin.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/65">Öğretmen Adı</label>
            <input
              type="text"
              value={assignForm.personName}
              onChange={(event) => setAssignForm({ ...assignForm, personName: event.target.value })}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/65">Not</label>
            <input
              type="text"
              value={assignForm.note}
              onChange={(event) => setAssignForm({ ...assignForm, note: event.target.value })}
              className={inputClassName}
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-white/65">Görev Alanı</label>
          {locations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/35">Önce görev alanı ekleyin.</div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-4">
              {locations.map((location) => {
                const active = assignForm.dutyLocationId === location.id
                return (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => setAssignForm({ ...assignForm, dutyLocationId: location.id })}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${active ? "border-sky-400/60 bg-sky-500/12 text-white" : "border-white/10 bg-slate-950/40 text-white/65 hover:border-white/20 hover:text-white"}`}
                  >
                    {location.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={addAssignment}
            disabled={saving || !assignForm.personName.trim() || !assignForm.dutyLocationId}
            className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-500/40"
          >
            Nöbetçi Ekle
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Atama Listesi" description="Seçili gün için kayıtlı nöbetçi öğretmenler.">
        {assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-white/35">Bu gün için henüz nöbetçi atanmamış.</div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment, index) => (
              <div key={assignment.id} className="flex items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-slate-950/40 px-4 py-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/15 text-sm font-bold text-sky-200">{index + 1}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{assignment.personName}</p>
                    <p className="mt-1 text-xs text-white/50">{assignment.dutyLocation.name}{assignment.note ? ` • ${assignment.note}` : ""}</p>
                  </div>
                </div>
                <button type="button" onClick={() => deleteAssignment(assignment.id)} className="rounded-xl px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200">
                  Sil
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
