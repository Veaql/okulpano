import path from "path"

function normalizeSqliteUrl(url?: string) {
  const prismaDir = path.resolve(process.cwd(), "prisma")
  const fallbackPath = path.join(prismaDir, "dev.db").replace(/\\/g, "/")

  if (!url) {
    return `file:${fallbackPath}`
  }

  if (!url.startsWith("file:")) {
    return url
  }

  const rawPath = url.slice("file:".length)
  if (!rawPath) {
    return `file:${fallbackPath}`
  }

  if (path.isAbsolute(rawPath)) {
    return url
  }

  const normalizedRelativePath = rawPath
    .replace(/^\.\/+/, "")
    .replace(/^prisma[\\/]/, "")

  const resolvedPath = path.resolve(prismaDir, normalizedRelativePath).replace(/\\/g, "/")
  return `file:${resolvedPath}`
}

process.env.DATABASE_URL = normalizeSqliteUrl(process.env.DATABASE_URL)

