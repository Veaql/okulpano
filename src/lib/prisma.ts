import path from "path"
import { PrismaClient } from "@prisma/client"

function normalizeSqliteUrl(url?: string) {
  const fallbackPath = path.resolve(process.cwd(), "prisma", "dev.db").replace(/\\/g, "/")

  if (!url) {
    return `file:${fallbackPath}`
  }

  if (url.startsWith("file:./")) {
    const relativePath = url.slice("file:".length)
    const resolvedPath = path.resolve(process.cwd(), relativePath).replace(/\\/g, "/")
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
