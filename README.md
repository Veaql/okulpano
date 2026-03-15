# OkulPano

OkulPano, Milli Egitim Bakanligi okullarindaki koridor, giris, ogretmenler odasi ve ortak alan ekranlarinda kullanilmak uzere gelistirilen acik kaynak bir dijital bilgilendirme ekrani uygulamasidir.

Uygulama; okul icinde surekli acik kalan televizyonlar veya ekranlar uzerinde `/display` yuzeyinin calistirilmasi, iceriklerin ise yonetim panelinden kolayca guncellenmesi mantigiyla tasarlanmistir.

Ticari SaaS modeliyle degil; dusuk bakim gerektiren, yerel ag icinde calisabilen, kurulumu sade ve ucretsiz bir okul ici signage cozumu olarak gelistirilmistir.

## Neden OkulPano?

* Acik kaynak ve ucretsizdir
* Yerel kullanim icin tasarlanmistir
* Ek sunucu veya karmasik servis bagimliligi gerektirmez
* Okul ici televizyon ekranlarinda surekli acik calisabilir
* Yonetim paneli ile icerikler hizli sekilde guncellenebilir
* Kurumsal, sade ve okunabilir bir ekran dili sunar

## Temel kullanim modeli

1. Yonetim paneli bilgisayarda acilir
2. Icerikler admin panelinden guncellenir
3. `/display` ekrani televizyona verilir
4. Tarayici tam ekran modunda surekli calistirilir

## One cikan moduller

* Gunun nobetci ogretmenleri
* Duyurular
* Medya alani
* Ders saatleri ve kalan sure
* Kayan yazi bandi
* Hava durumu
* TRT Haber haber alani
* Sag alt modul: yemek listesi, YKS sayaci veya LGS sayaci

## Teknoloji yigini

* Next.js 16
* React 19
* Tailwind CSS 4
* Prisma
* SQLite

## Veri kaynaklari

OkulPano iceriginin bir bolumu yonetim panelinden girilir, bir bolumu dis veri kaynaklarindan alinir.

* Nobetci ogretmenler, duyurular, medya, ders saatleri, ticker ve yemek listesi: yonetim panelinden girilir
* TRT Haber akisi RSS uzerinden alinir
* Hava durumu verileri Open-Meteo servislerinden alinir
* Il ve ilce secimi proje icine eklenmis statik Turkiye ilce listesi ile desteklenir

Not: Internet baglantisi olmayan ortamlarda dis veri kullanan moduller guncellenmez; display ekraninda veri guncellenemedi uyarisi gosterilir.

## Kurulum

### Gereksinimler

* Node.js 20 veya uzeri
* npm

### Projeyi hazirlama

```bash
git clone <repo-adresi> okulpano
cd okulpano
npm install
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

### Veritabanini hazirlama

Yerel gelistirme veritabani dosyasi `prisma/dev.db` yolunda olusur.

```bash
npm run db:push
```

Istege bagli ornek veri:

```bash
npm run db:seed
```

### Gelistirme ortami

```bash
npm run dev
```

Ardindan:

* Yonetim paneli: `http://localhost:3000/admin/general`
* Display ekrani: `http://localhost:3000/display`

## Onerilen kullanim

* Yonetim paneli okul ici bilgisayarda calistirilmalidir
* Display ekrani televizyona HDMI ile verilmelidir
* Tarayici tam ekran modunda acik birakilmalidir
* Yerel ag veya erisimi sinirlandirilmis kurulum onerilir

## Onemli calisma notlari

* `SQLite` veritabani dosyasi ve `public/uploads` klasoru duzenli yedeklenmelidir
* Yonetim paneli varsayilan olarak yerel kullanim hedeflenerek tasarlanmistir
* Internet uzerinden acik erisim verilecek kurulumlarda ek kimlik dogrulama onerilir
* Haber ve hava durumu modulleri internet baglantisina baglidir

## Lisans

Bu proje acik kaynak olarak MIT lisansi ile sunulmaktadir.
