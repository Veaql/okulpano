"use client"

import Image from "next/image"
import { useCallback, useEffect, useState } from "react"

interface MediaItem {
  id: string
  type: string
  fileUrl: string
  title: string | null
  subtitle: string | null
  durationSeconds: number
  isActive: boolean
  sortOrder: number
}

async function readJsonSafely(response: Response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-white/20 focus:border-sky-400/50 focus:bg-slate-950"

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [uploadForm, setUploadForm] = useState({
    title: "",
    subtitle: "",
    duration: "5",
  })

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/media", { cache: "no-store" })
      const data = await readJsonSafely(response)
      setItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage("")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", uploadForm.title)
    formData.append("subtitle", uploadForm.subtitle)
    formData.append("duration", uploadForm.duration)

    try {
      const response = await fetch("/api/media", { method: "POST", body: formData })
      const result = await readJsonSafely(response)

      if (!response.ok) {
        setMessage(typeof result?.error === "string" ? result.error : "Yükleme başarısız")
        return
      }

      setUploadForm({ title: "", subtitle: "", duration: "5" })
      setMessage("Medya yüklendi")
      await fetchData()
    } catch (error) {
      console.error(error)
      setMessage("Sunucu hatası")
    } finally {
      setUploading(false)
      event.target.value = ""
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu medya kaydı silinsin mi?")) return

    try {
      await fetch(`/api/media?id=${id}`, { method: "DELETE" })
      await fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return <div className="p-8 text-white/60">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-7 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/80">
              Medya Yönetimi
            </p>
            <h1 className="mt-3 text-3xl font-bold text-white">Medya Alanı</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
              Display ekranında dönen görsel ve videoları buradan yönetebilirsiniz.
              Başlık, alt yazı ve gösterim süresi aynı ekrandan ayarlanır.
            </p>
          </div>
          {message ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-emerald-300">
              {message}
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
        <h2 className="text-lg font-semibold text-white">Yeni Medya Yükle</h2>
        <p className="mt-1 text-sm text-white/45">
          Resim veya video ekleyin. Resim yüklemelerinde önerilen biçimler JPG, PNG ve
          WebP; video için MP4 kullanın.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/65">Başlık</label>
            <input
              type="text"
              value={uploadForm.title}
              onChange={(event) => setUploadForm({ ...uploadForm, title: event.target.value })}
              className={inputClassName}
              placeholder="Opsiyonel başlık"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/65">Alt Yazı</label>
            <input
              type="text"
              value={uploadForm.subtitle}
              onChange={(event) => setUploadForm({ ...uploadForm, subtitle: event.target.value })}
              className={inputClassName}
              placeholder="Opsiyonel açıklama"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/65">Gösterim Süresi (sn)</label>
            <input
              type="number"
              min={2}
              max={60}
              value={uploadForm.duration}
              onChange={(event) => setUploadForm({ ...uploadForm, duration: event.target.value })}
              className={inputClassName}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label
            className={`inline-flex cursor-pointer items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${
              uploading
                ? "bg-sky-500/30 text-sky-200"
                : "bg-sky-500 text-slate-950 hover:bg-sky-400"
            }`}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? "Yükleniyor..." : "Dosya Seç ve Yükle"}
          </label>
          <p className="text-xs text-white/35">
            Resim sınırı 10 MB, video sınırı 50 MB olarak uygulanır.
          </p>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Medya Galerisi</h2>
            <p className="mt-1 text-sm text-white/45">
              Toplam {items.length} medya kaydı görüntüleniyor.
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-4 py-14 text-center text-white/35">
            Henüz medya yüklenmedi.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/40 shadow-[0_12px_32px_rgba(0,0,0,0.14)]"
              >
                <div className="relative h-44 w-full overflow-hidden border-b border-white/10 bg-black/20">
                  {item.type === "video" ? (
                    <video src={item.fileUrl} className="h-full w-full object-cover" muted />
                  ) : (
                    <Image
                      src={item.fileUrl}
                      alt={item.title || "Medya görseli"}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  )}
                  <div className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/85">
                    {item.type === "video" ? "Video" : "Görsel"}
                  </div>
                  <div className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white/85">
                    #{index + 1}
                  </div>
                </div>

                <div className="space-y-3 px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.title?.trim() || "Başlıksız medya"}
                    </p>
                    {item.subtitle ? (
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/45">
                        {item.subtitle}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/45">
                    <span>{item.durationSeconds} sn</span>
                    <span>{item.isActive ? "Aktif" : "Pasif"}</span>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
