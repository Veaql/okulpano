export interface TrtCategory {
  id: string
  label: string
  feedUrl: string
}

export const TRT_CATEGORIES: TrtCategory[] = [
  { id: "gundem", label: "Gündem", feedUrl: "https://www.trthaber.com/gundem_articles.rss" },
  { id: "egitim", label: "Eğitim", feedUrl: "https://www.trthaber.com/egitim_articles.rss" },
  { id: "turkiye", label: "Türkiye", feedUrl: "https://www.trthaber.com/turkiye_articles.rss" },
  { id: "dunya", label: "Dünya", feedUrl: "https://www.trthaber.com/dunya_articles.rss" },
  { id: "ekonomi", label: "Ekonomi", feedUrl: "https://www.trthaber.com/ekonomi_articles.rss" },
  { id: "spor", label: "Spor", feedUrl: "https://www.trthaber.com/spor_articles.rss" },
  { id: "yasam", label: "Yaşam", feedUrl: "https://www.trthaber.com/yasam_articles.rss" },
  { id: "sondakika", label: "Son Dakika", feedUrl: "https://www.trthaber.com/sondakika_articles.rss" },
]

export function getTrtCategory(categoryId: string | null | undefined) {
  return TRT_CATEGORIES.find((category) => category.id === categoryId) ?? TRT_CATEGORIES[0]
}
