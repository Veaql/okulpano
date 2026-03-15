import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "OkulPano - Dijital Bilgilendirme Ekranı",
  description: "Okullar için web tabanlı, kurum içi dijital bilgilendirme ekranı sistemi",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
