import { NextRequest, NextResponse } from "next/server"
import { getTrtCategory } from "@/lib/trt"

export const dynamic = "force-dynamic"

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
}

function extractTagValue(item: string, tag: string) {
  return (
    item.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i"))?.[1] ??
    item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] ??
    ""
  ).trim()
}

function extractImage(descriptionRaw: string, item: string) {
  return (
    descriptionRaw.match(/<img[^>]+src=['\"]([^'\"]+)['\"]/i)?.[1] ??
    item.match(/<media:content[^>]+url=['\"]([^'\"]+)['\"]/i)?.[1] ??
    item.match(/<enclosure[^>]+url=['\"]([^'\"]+)['\"]/i)?.[1] ??
    null
  )
}

export async function GET(request: NextRequest) {
  const categoryId = request.nextUrl.searchParams.get("category")
  const category = getTrtCategory(categoryId)

  try {
    const response = await fetch(category.feedUrl, {
      headers: {
        "User-Agent": "OkulPano/1.0",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("TRT feed request failed")
    }

    const xml = await response.text()
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]

    const headlines = items
      .slice(0, 4)
      .map((match) => {
        const item = match[1]
        const title = stripHtml(extractTagValue(item, "title"))
        const url = extractTagValue(item, "link")
        const descriptionRaw = extractTagValue(item, "description")
        const image = extractImage(descriptionRaw, item)
        const summary = stripHtml(descriptionRaw).replace(title, "").trim()
        const publishedAt = extractTagValue(item, "pubDate")

        return {
          title,
          url,
          image,
          summary,
          publishedAt,
        }
      })
      .filter((item) => item.title && item.url)

    return NextResponse.json({ headlines, category: category.id }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("/api/trt-news failed", error)
    return NextResponse.json({ headlines: [], category: category.id }, { headers: { "Cache-Control": "no-store" } })
  }
}
