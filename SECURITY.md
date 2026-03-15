# Güvenlik Notları

OkulPano, okul içi signage kullanımı için tasarlanmıştır. Bu nedenle en güvenli yayın modeli okul içi ağ veya erişimi sınırlandırılmış sunucudur.

## Güvenlik yaklaşımı

- Dosya yüklemelerinde tür kontrolü uygulanır.
- Yükleme klasörleri uygulama tarafından sınırlandırılır.
- SQLite verisi ve yüklenen dosyalar yerel olarak tutulur.
- TRT Haber ve hava durumu gibi dış veri kaynakları salt okunur olarak kullanılır.

## Operasyon tavsiyeleri

- Yönetim panelini doğrudan genel internete açmayın.
- Reverse proxy ile IP veya ağ kısıtı koyun.
- HTTPS kullanın.
- Veritabanı dosyasını düzenli yedekleyin.
- `public/uploads` klasörünü düzenli yedekleyin.

## Bildirim

Bir güvenlik sorunu tespit ederseniz, herkese açık issue yerine bakım ekibiyle özel iletişim kurmanız önerilir.
