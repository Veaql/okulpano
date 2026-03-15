import { prisma } from "@/lib/prisma"

/**
 * Proje tek okul mantığıyla çalışır.
 * Varsayılan olarak veritabanındaki ilk okul kaydı kullanılır.
 */
export async function getDefaultSchool() {
  return prisma.school.findFirst({
    include: { settings: true },
  })
}

export async function getDefaultSchoolId(): Promise<string | null> {
  const school = await prisma.school.findFirst({ select: { id: true } })
  return school?.id ?? null
}
