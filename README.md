# OkulPano

OkulPano, MEB okullarındaki koridor, giriş, öğretmenler odası ve ortak alan ekranları için geliştirilmiş açık kaynak bir dijital bilgilendirme ekranı uygulamasıdır.

Bu proje, okul içi kullanım için ücretsiz sunulan, kamu yararını önceleyen ve devlet kurumlarının dijital dönüşümünü destekleyen yerli bir çalışmadır. Ticari SaaS mantığıyla değil, okul içinde sürekli açık kalan signage ekranı ihtiyacı düşünülerek hazırlanmıştır.

## Temel amaç

- Yönetim panelinden içeriklerin kolayca güncellenmesi
- `/display` ekranının televizyonlarda tam ekran ve sürekli açık çalışması
- Resmî, sakin ve kurumsal bir görsel dilin korunması
- Ek veritabanı veya karmaşık servis bağımlılığı olmadan kurulabilmesi

## Öne çıkan modüller

- Günün nöbetçi öğretmenleri
- Duyurular
- Medya alanı
- Ders saatleri ve kalan süre
- Kayan yazı bandı
- Hava durumu
- TRT Haber alanı
- Sağ alt modül: yemek listesi, YKS sayacı veya LGS sayacı

## Teknoloji yığını

- Next.js 16
- React 19
- Tailwind CSS 4
- Prisma
- SQLite

## Veri kaynakları

OkulPano içeriğinin bir bölümü doğrudan yönetim panelinden girilir, bir bölümü ise dış veri kaynaklarından alınır.

- Nöbetçi öğretmenler, duyurular, medya, ders saatleri, ticker ve yemek listesi: yönetim panelinden girilir.
- TRT Haber akışı: TRT Haber RSS beslemeleri üzerinden alınır.
  - `https://www.trthaber.com/gundem_articles.rss`
  - `https://www.trthaber.com/egitim_articles.rss`
  - ve diğer TRT kategori RSS uçları
- Hava durumu: Open-Meteo tahmin ve geocoding servisleri üzerinden alınır.
  - `https://api.open-meteo.com/v1/forecast`
  - `https://geocoding-api.open-meteo.com/v1/search`
- İl ve ilçe seçim listesi: proje içine dahil edilen statik Türkiye ilçe kataloğu ile desteklenir.

Not:
Dış veri kullanan bölümler internet bağlantısı olmadan güncellenmez. Böyle durumlarda display ekranında veri güncellenemedi uyarısı gösterilir.

## Kurulum

### 1. Gereksinimler

- Node.js 20 veya üzeri
- npm

### 2. Projeyi hazırlama

```bash
git clone <repo-adresi> okulpano
cd okulpano
npm install
cp .env.example .env
```

Windows PowerShell için:

```powershell
Copy-Item .env.example .env
```

### 3. Veritabanını hazırlama

```bash
npm run db:push
```

İsterseniz örnek veri yükleyebilirsiniz:

```bash
npm run db:seed
```

### 4. Geliştirme ortamını çalıştırma

```bash
npm run dev
```

Ardından:

- Yönetim paneli: `http://localhost:3000/admin/general`
- Display ekranı: `http://localhost:3000/display`

## Üretim kurulumu

### Node.js ile

```bash
npm install
npm run db:push
npm run build
npm run start
```

### Docker ile

```bash
docker compose up -d --build
```

Detaylı üretim adımları için:
[DEPLOYMENT.md](DEPLOYMENT.md)

## Önemli çalışma notları

- SQLite veritabanı dosyası ve `public/uploads` klasörü kalıcı olarak yedeklenmelidir.
- Uygulama okul içi ağda veya erişimi sınırlandırılmış bir sunucuda çalıştırılmalıdır.
- Yönetim panelinde kimlik doğrulama katmanı yoksa internetten açık erişim önerilmez.
- TRT Haber ve hava durumu modülleri internet bağlantısına bağlıdır.
- Display ekranı TV tarayıcısında tam ekran çalıştırılmalıdır.

## Kullanışlı komutlar

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run db:push
npm run db:seed
npm run db:studio
```

## Proje yapısı

```text
src/
  app/
    admin/        Yönetim paneli sayfaları
    api/          API uçları
    display/      TV ekranı
  lib/            Yardımcı modüller ve veri kaynakları
prisma/
  schema.prisma   Veritabanı şeması
  seed.ts         Örnek veri
public/
  uploads/        Yüklenen logolar ve medya dosyaları
```

## Lisans

Bu proje açık kaynak olarak MIT lisansı ile sunulmaktadır.

Detay için:
[LICENSE](LICENSE)
