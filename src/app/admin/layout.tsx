"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const menuItems = [
  {
    href: "/admin/general",
    label: "Genel Ayarlar",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3v4M12 17v4M4 12H0m24 0h-4M5.64 5.64l2.83 2.83m7.06 7.06 2.83 2.83m0-12.72-2.83 2.83M8.47 15.53l-2.83 2.83" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3.5" />
      </svg>
    ),
  },
  {
    href: "/admin/theme",
    label: "Görünüm / Tema",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3c5 0 9 4 9 9 0 4-2.7 7.4-6.4 8.5-.9.3-1.6-.5-1.3-1.3.2-.5.3-1 .3-1.5 0-2-1.6-3.7-3.7-3.7-.4 0-.8.1-1.2.2-.9.3-1.7-.6-1.4-1.4C6.5 5.8 8.9 3 12 3Z" />
        <circle cx="8.5" cy="9.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="12.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="15.5" cy="11" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "/admin/schedule",
    label: "Ders Saatleri",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/admin/duty",
    label: "Nöbet Programı",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="8" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3.5 18c.8-2.8 3-4.5 5.5-4.5s4.7 1.7 5.5 4.5" strokeLinecap="round" />
        <path d="M14.5 18c.5-1.9 2-3.2 3.9-3.2 1.2 0 2.4.5 3.1 1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/announcements",
    label: "Duyurular",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 13V8.5a2 2 0 0 1 1.3-1.9l9.5-3.5a1 1 0 0 1 1.3.9V18a1 1 0 0 1-1.3.9L5.3 15.4A2 2 0 0 1 4 13Z" strokeLinejoin="round" />
        <path d="M16 8h2.5a1.5 1.5 0 0 1 0 3H16" strokeLinecap="round" />
        <path d="M7 15.5 8 20h3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/media",
    label: "Medya Alanı",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m8 14 2.2-2.2a1 1 0 0 1 1.4 0L15 15m-2.5-2.5 1.2-1.2a1 1 0 0 1 1.4 0L19 15" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="9" r="1.3" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "/admin/ticker",
    label: "Kayan Yazı",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M7 10h10M7 14h6" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_28%),linear-gradient(180deg,#0b1220_0%,#0f172a_100%)] text-white">
      <div className="flex min-h-screen">
        <aside className={`${sidebarOpen ? "w-72" : "w-20"} shrink-0 border-r border-white/10 bg-slate-950/65 backdrop-blur-xl transition-all duration-300`}>
          <div className="flex h-full flex-col">
            <div className="border-b border-white/10 px-4 py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-300">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 6.5h16M4 12h16M4 17.5h10" strokeLinecap="round" />
                    </svg>
                  </div>
                  {sidebarOpen ? (
                    <div className="min-w-0">
                      <p className="text-base font-semibold tracking-[0.02em] text-white">OkulPano</p>
                      <p className="mt-0.5 text-xs uppercase tracking-[0.24em] text-white/35">Yönetim Paneli</p>
                    </div>
                  ) : null}
                </div>
                <button onClick={() => setSidebarOpen((current) => !current)} className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white">
                  {sidebarOpen ? "Daralt" : "Aç"}
                </button>
              </div>
            </div>

            <div className="px-3 py-4">
              <div className="space-y-3">
                {sidebarOpen ? (
                  <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(14,165,233,0.10),rgba(255,255,255,0.03))] px-4 py-4 text-sm text-white/55">
                    Display ekranı, içerik modülleri ve yayın akışı bu panelden yönetilir.
                  </div>
                ) : null}

                <Link
                  href="/display"
                  target="_blank"
                  className={`group flex items-center gap-3 rounded-2xl border px-3 py-3.5 transition ${
                    sidebarOpen
                      ? "border-emerald-400/30 bg-[linear-gradient(180deg,rgba(16,185,129,0.18),rgba(16,185,129,0.08))] text-emerald-200 shadow-[0_12px_30px_rgba(16,185,129,0.08)] hover:bg-[linear-gradient(180deg,rgba(16,185,129,0.22),rgba(16,185,129,0.12))]"
                      : "justify-center border-emerald-400/25 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/16"
                  }`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-200">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="5" width="18" height="12" rx="2" />
                      <path d="M8 20h8" strokeLinecap="round" />
                    </svg>
                  </span>
                  {sidebarOpen ? (
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">Display Ekranını Aç</p>
                      <p className="mt-0.5 text-xs text-emerald-100/65">Canlı yayını yeni sekmede görüntüle</p>
                    </div>
                  ) : null}
                </Link>
              </div>
            </div>

            <nav className="flex-1 space-y-1 px-3 pb-4">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${isActive ? "border border-sky-400/25 bg-sky-500/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" : "text-white/60 hover:bg-white/6 hover:text-white"}`}>
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isActive ? "bg-sky-400/12 text-sky-200" : "bg-white/5 text-white/55 group-hover:text-white/80"}`}>{item.icon}</span>
                    {sidebarOpen ? <span className="truncate font-medium">{item.label}</span> : null}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
