export interface MgmCity {
  code: string
  name: string
}

export const MGM_CITIES: MgmCity[] = [
  { code: "01", name: "Adana" },
  { code: "02", name: "Adiyaman" },
  { code: "03", name: "Afyonkarahisar" },
  { code: "04", name: "Agri" },
  { code: "05", name: "Amasya" },
  { code: "06", name: "Ankara" },
  { code: "07", name: "Antalya" },
  { code: "08", name: "Artvin" },
  { code: "09", name: "Aydin" },
  { code: "10", name: "Balikesir" },
  { code: "11", name: "Bilecik" },
  { code: "12", name: "Bingol" },
  { code: "13", name: "Bitlis" },
  { code: "14", name: "Bolu" },
  { code: "15", name: "Burdur" },
  { code: "16", name: "Bursa" },
  { code: "17", name: "Canakkale" },
  { code: "18", name: "Cankiri" },
  { code: "19", name: "Corum" },
  { code: "20", name: "Denizli" },
  { code: "21", name: "Diyarbakir" },
  { code: "22", name: "Edirne" },
  { code: "23", name: "Elazig" },
  { code: "24", name: "Erzincan" },
  { code: "25", name: "Erzurum" },
  { code: "26", name: "Eskisehir" },
  { code: "27", name: "Gaziantep" },
  { code: "28", name: "Giresun" },
  { code: "29", name: "Gumushane" },
  { code: "30", name: "Hakkari" },
  { code: "31", name: "Hatay" },
  { code: "32", name: "Isparta" },
  { code: "33", name: "Mersin" },
  { code: "34", name: "Istanbul" },
  { code: "35", name: "Izmir" },
  { code: "36", name: "Kars" },
  { code: "37", name: "Kastamonu" },
  { code: "38", name: "Kayseri" },
  { code: "39", name: "Kirklareli" },
  { code: "40", name: "Kirsehir" },
  { code: "41", name: "Kocaeli" },
  { code: "42", name: "Konya" },
  { code: "43", name: "Kutahya" },
  { code: "44", name: "Malatya" },
  { code: "45", name: "Manisa" },
  { code: "46", name: "Kahramanmaras" },
  { code: "47", name: "Mardin" },
  { code: "48", name: "Mugla" },
  { code: "49", name: "Mus" },
  { code: "50", name: "Nevsehir" },
  { code: "51", name: "Nigde" },
  { code: "52", name: "Ordu" },
  { code: "53", name: "Rize" },
  { code: "54", name: "Sakarya" },
  { code: "55", name: "Samsun" },
  { code: "56", name: "Siirt" },
  { code: "57", name: "Sinop" },
  { code: "58", name: "Sivas" },
  { code: "59", name: "Tekirdag" },
  { code: "60", name: "Tokat" },
  { code: "61", name: "Trabzon" },
  { code: "62", name: "Tunceli" },
  { code: "63", name: "Sanliurfa" },
  { code: "64", name: "Usak" },
  { code: "65", name: "Van" },
  { code: "66", name: "Yozgat" },
  { code: "67", name: "Zonguldak" },
  { code: "68", name: "Aksaray" },
  { code: "69", name: "Bayburt" },
  { code: "70", name: "Karaman" },
  { code: "71", name: "Kirikkale" },
  { code: "72", name: "Batman" },
  { code: "73", name: "Sirnak" },
  { code: "74", name: "Bartin" },
  { code: "75", name: "Ardahan" },
  { code: "76", name: "Igdir" },
  { code: "77", name: "Yalova" },
  { code: "78", name: "Karabuk" },
  { code: "79", name: "Kilis" },
  { code: "80", name: "Osmaniye" },
  { code: "81", name: "Duzce" },
]

const CITY_LABELS: Record<string, string> = {
  Adana: "Adana",
  Adiyaman: "Ad\u0131yaman",
  Afyonkarahisar: "Afyonkarahisar",
  Agri: "A\u011fr\u0131",
  Amasya: "Amasya",
  Ankara: "Ankara",
  Antalya: "Antalya",
  Artvin: "Artvin",
  Aydin: "Ayd\u0131n",
  Balikesir: "Bal\u0131kesir",
  Bilecik: "Bilecik",
  Bingol: "Bing\u00f6l",
  Bitlis: "Bitlis",
  Bolu: "Bolu",
  Burdur: "Burdur",
  Bursa: "Bursa",
  Canakkale: "\u00c7anakkale",
  Cankiri: "\u00c7ank\u0131r\u0131",
  Corum: "\u00c7orum",
  Denizli: "Denizli",
  Diyarbakir: "Diyarbak\u0131r",
  Edirne: "Edirne",
  Elazig: "Elaz\u0131\u011f",
  Erzincan: "Erzincan",
  Erzurum: "Erzurum",
  Eskisehir: "Eski\u015fehir",
  Gaziantep: "Gaziantep",
  Giresun: "Giresun",
  Gumushane: "G\u00fcm\u00fc\u015fhane",
  Hakkari: "Hakkari",
  Hatay: "Hatay",
  Isparta: "Isparta",
  Istanbul: "\u0130stanbul",
  Izmir: "\u0130zmir",
  Kars: "Kars",
  Kastamonu: "Kastamonu",
  Kayseri: "Kayseri",
  Kirklareli: "K\u0131rklareli",
  Kirsehir: "K\u0131r\u015fehir",
  Kocaeli: "Kocaeli",
  Konya: "Konya",
  Kutahya: "K\u00fctahya",
  Malatya: "Malatya",
  Manisa: "Manisa",
  Kahramanmaras: "Kahramanmara\u015f",
  Mardin: "Mardin",
  Mugla: "Mu\u011fla",
  Mus: "Mu\u015f",
  Nevsehir: "Nev\u015fehir",
  Nigde: "Ni\u011fde",
  Ordu: "Ordu",
  Rize: "Rize",
  Sakarya: "Sakarya",
  Samsun: "Samsun",
  Siirt: "Siirt",
  Sinop: "Sinop",
  Sivas: "Sivas",
  Tekirdag: "Tekirda\u011f",
  Tokat: "Tokat",
  Trabzon: "Trabzon",
  Tunceli: "Tunceli",
  Sanliurfa: "\u015eanl\u0131urfa",
  Usak: "U\u015fak",
  Van: "Van",
  Yozgat: "Yozgat",
  Zonguldak: "Zonguldak",
  Aksaray: "Aksaray",
  Bayburt: "Bayburt",
  Karaman: "Karaman",
  Kirikkale: "K\u0131r\u0131kkale",
  Batman: "Batman",
  Sirnak: "\u015e\u0131rnak",
  Bartin: "Bart\u0131n",
  Ardahan: "Ardahan",
  Igdir: "I\u011fd\u0131r",
  Yalova: "Yalova",
  Karabuk: "Karab\u00fck",
  Kilis: "Kilis",
  Osmaniye: "Osmaniye",
  Duzce: "D\u00fczce",
}

const MOJIBAKE_FIXES: Array<[RegExp, string]> = [
  [/\u00c4\u00b1/g, "i"],
  [/\u00c4\u00b0/g, "i"],
  [/\u00c5\u009f/g, "s"],
  [/\u00c5\u009e/g, "s"],
  [/\u00c4\u009f/g, "g"],
  [/\u00c4\u009e/g, "g"],
  [/\u00c3\u00bc/g, "u"],
  [/\u00c3\u009c/g, "u"],
  [/\u00c3\u00b6/g, "o"],
  [/\u00c3\u2013/g, "o"],
  [/\u00c3\u00a7/g, "c"],
  [/\u00c3\u2021/g, "c"],
]

export function normalizeTurkish(value: string) {
  let normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  for (const [pattern, replacement] of MOJIBAKE_FIXES) {
    normalized = normalized.replace(pattern, replacement)
  }

  return normalized
    .replace(/\u0131/g, "i")
    .replace(/\u0130/g, "i")
    .replace(/\u015f/g, "s")
    .replace(/\u015e/g, "s")
    .replace(/\u011f/g, "g")
    .replace(/\u011e/g, "g")
    .replace(/\u00fc/g, "u")
    .replace(/\u00dc/g, "u")
    .replace(/\u00f6/g, "o")
    .replace(/\u00d6/g, "o")
    .replace(/\u00e7/g, "c")
    .replace(/\u00c7/g, "c")
    .toLowerCase()
}

export function getMgmCityByCode(code: string | null | undefined) {
  return MGM_CITIES.find((city) => city.code === code) ?? MGM_CITIES.find((city) => city.code === "34")!
}

export function getMgmCitySlug(cityName: string) {
  return normalizeTurkish(cityName).replace(/[^a-z0-9]+/g, "")
}

export function toTurkishLabel(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""

  const directLabel = CITY_LABELS[trimmed]
  if (directLabel) {
    return directLabel
  }

  return trimmed
    .split(/\s+/)
    .map((word) => {
      const mapped = CITY_LABELS[word]
      if (mapped) {
        return mapped
      }

      return word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1).toLocaleLowerCase("tr-TR")
    })
    .join(" ")
}
