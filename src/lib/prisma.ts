import path from "path"
import { PrismaClient } from "@prisma/client"

function normalizeSqliteUrl(url?: string) {
  const prismaDir = path.resolve(process.cwd(), "prisma")
  const fallbackPath = path.join(prismaDir, "dev.db").replace(/\\/g, "/")

  if (!url) {
    return `file:${fallbackPath}`
  }

  if (url.startsWith("file:./") || url.startsWith("file:")) {
    const relativePath = url.slice("file:".length)
    if (!relativePath || path.isAbsolute(relativePath)) {
      return url
    }

    const normalizedRelativePath = relativePath.replace(/^\.\/+/, "")
    const resolvedPath = path.resolve(prismaDir, normalizedRelativePath).replace(/\\/g, "/")
    return `file:${resolvedPath}`
  }

  return url
}

process.env.DATABASE_URL = normalizeSqliteUrl(process.env.DATABASE_URL)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
