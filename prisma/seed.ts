import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Veritabanı hazırlanıyor...")

  const existingSchoolCount = await prisma.school.count()
  if (existingSchoolCount > 0) {
    console.log("Veritabanında kayıt bulundu. Seed adımı atlandı.")
    return
  }

  const school = await prisma.school.create({
    data: {
      name: "Örnek Anadolu Lisesi",
      shortName: "ÖAL",
      city: "İstanbul",
      district: "Küçükçekmece",
      slogan: null,
      timezone: "Europe/Istanbul",
    },
  })

  await prisma.settings.create({
    data: {
      schoolId: school.id,
      theme: "resmi",
      primaryColor: "#1e3a5f",
      accentColor: "#c9a84c",
      activeWidget: "meal",
      trtCategory: "egitim",
      showTrtNews: true,
      weatherCityCode: "34",
      weatherStation: "Küçükçekmece",
      weatherLabel: JSON.stringify([
        "Mercimek Çorbası",
        "Tavuk Sote",
        "Bulgur Pilavı",
        "Mevsim Salata",
        "Ayran",
      ]),
    },
  })

  const locations = await Promise.all(
    ["Müdür Yardımcısı", "Ana Koridor", "Bahçe", "Kantin Önü", "Spor Salonu"].map(
      (name, index) =>
        prisma.dutyLocation.create({
          data: {
            schoolId: school.id,
            name,
            sortOrder: index,
          },
        }),
    ),
  )

  const duties = [
    { personName: "Turan Çakmak", locationIndex: 0 },
    { personName: "Ayşe Demir", locationIndex: 1 },
    { personName: "Ali Öztürk", locationIndex: 2 },
    { personName: "Murat Kaya", locationIndex: 3 },
    { personName: "Fatma Çelik", locationIndex: 4 },
  ]

  for (let weekday = 1; weekday <= 5; weekday += 1) {
    for (let index = 0; index < duties.length; index += 1) {
      const duty = duties[index]
      await prisma.dutyAssignment.create({
        data: {
          schoolId: school.id,
          weekday,
          dutyLocationId: locations[duty.locationIndex].id,
          personName: duty.personName,
          note: null,
          sortOrder: index,
        },
      })
    }
  }

  const scheduleBlocks = [
    { blockType: "lesson", label: "1. Ders", startTime: "08:30", endTime: "09:10" },
    { blockType: "break", label: "Teneffüs", startTime: "09:10", endTime: "09:20" },
    { blockType: "lesson", label: "2. Ders", startTime: "09:20", endTime: "10:00" },
    { blockType: "break", label: "Teneffüs", startTime: "10:00", endTime: "10:10" },
    { blockType: "lesson", label: "3. Ders", startTime: "10:10", endTime: "10:50" },
    { blockType: "break", label: "Teneffüs", startTime: "10:50", endTime: "11:00" },
    { blockType: "lesson", label: "4. Ders", startTime: "11:00", endTime: "11:40" },
    { blockType: "lunch", label: "Öğle Arası", startTime: "11:40", endTime: "12:20" },
    { blockType: "lesson", label: "5. Ders", startTime: "12:20", endTime: "13:00" },
    { blockType: "break", label: "Teneffüs", startTime: "13:00", endTime: "13:10" },
    { blockType: "lesson", label: "6. Ders", startTime: "13:10", endTime: "13:50" },
  ]

  for (let index = 0; index < scheduleBlocks.length; index += 1) {
    await prisma.scheduleBlock.create({
      data: {
        schoolId: school.id,
        sortOrder: index,
        ...scheduleBlocks[index],
      },
    })
  }

  const announcements = [
    {
      title: "Veli Toplantısı",
      content: "15 Mart Pazar günü saat 10:00'da veli toplantımız yapılacaktır.",
      priority: "important",
    },
    {
      title: "Kütüphane Saatleri",
      content: "Kütüphane hafta içi 08:00 - 17:00 arasında açıktır.",
      priority: "normal",
    },
    {
      title: "Spor Salonu Kullanımı",
      content: "Kulüp çalışmaları nedeniyle spor salonu 16:00 sonrası kullanılacaktır.",
      priority: "normal",
    },
  ]

  for (let index = 0; index < announcements.length; index += 1) {
    await prisma.announcement.create({
      data: {
        schoolId: school.id,
        sortOrder: index,
        isActive: true,
        ...announcements[index],
      },
    })
  }

  await prisma.tickerMessage.create({
    data: {
      schoolId: school.id,
      text: "Cumhuriyet Bayramı kutlamaları için tüm öğrenci ve velilerimiz törene davetlidir.",
      speed: 50,
      textColor: "#ffffff",
      backgroundColor: "#1e3a5f",
      isEmergency: false,
      isActive: true,
      sortOrder: 0,
    },
  })

  console.log("Seed işlemi tamamlandı.")
  console.log("Display: http://localhost:3000/display")
  console.log("Yönetim paneli: http://localhost:3000/admin/general")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
