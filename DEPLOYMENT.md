# OkulPano Dağıtım Rehberi

Bu belge, OkulPano uygulamasını okul içinde veya sunucuda kalıcı olarak yayınlamak için önerilen adımları içerir.

## 1. Yayın senaryosu

OkulPano için önerilen kullanım modeli:

- Yönetim paneli sadece idare veya yetkili personel tarafından kullanılır.
- Display ekranı televizyon veya kiosk tarayıcısında `/display` adresiyle tam ekran açık kalır.
- Uygulama internetten herkese açık bir panel olarak değil, okul içi sistem olarak konumlandırılır.

## 2. Sunucu önerisi

En sade kurulum için önerilen kaynaklar:

- `2 vCPU`
- `2 GB RAM`
- `10 GB disk`

SQLite kullandığı için küçük ve orta ölçekli okul kurulumlarında ek veritabanı sunucusu gerekmez.

## 3. Node.js ile üretim kurulumu

`git clone <repo-adresi> okulpano`  
`cd okulpano`  
`npm install`  
`cp .env.example .env`  
`npm run db:push`  
`npm run build`  
`npm run start`

Windows PowerShell kullanıyorsanız ortam dosyasını şu komutla oluşturun:

`Copy-Item .env.example .env`

Windows Komut İstemi (`CMD`) kullanıyorsanız:

`copy .env.example .env`

## 4. Docker ile üretim kurulumu

`docker compose up -d --build`

Docker kurulumu şu verileri kalıcı tutar:

- `/app/data`
- `/app/public/uploads`

## 5. Reverse proxy önerisi

Nginx veya Caddy ile aşağıdaki yapı önerilir:

- `/admin/*` sadece okul içi ağdan erişilsin
- `/display` TV ekranları için açık kalsın
- `HTTPS` aktif olsun

## 6. Yedekleme

En az şu iki alan düzenli olarak yedeklenmelidir:

- SQLite dosyası
- `public/uploads` klasörü

## 7. Güncelleme akışı

`git pull`  
`npm install`  
`npm run db:push`  
`npm run build`

Docker kullanıyorsanız:

`docker compose up -d --build`

## 8. İnternet bağımlı modüller

Bu modüller internet olmadan güncellenmez:

- TRT Haber
- Hava durumu

Bu durumda display ekranında veri güncellenemedi uyarısı görünür.

## 9. Okul içi kullanım notu

Kimlik doğrulama katmanı eklenmeden yönetim panelinin doğrudan genel internete açılması önerilmez.

En güvenli kullanım modeli:

- okul içi ağ
- VPN
- IP kısıtlı reverse proxy

## 10. Canlıya çıkmadan önce kontrol listesi

`npm run lint`  
`npm run typecheck`  
`npm run build`  
`npm run db:push`

Ayrıca şu kontroller önerilir:

- yükleme klasörü yazılabilir durumda mı
- `/display` TV tarayıcısında tam ekran test edildi mi
- TRT Haber ve hava durumu internet bağlantısıyla test edildi mi
