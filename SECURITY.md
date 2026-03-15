# Güvenlik Notları

OkulPano, okul içi dijital signage kullanımı için tasarlanmıştır. En güvenli kullanım modeli; yerel ağ içinde, erişimi sınırlandırılmış bir bilgisayar veya sunucu üzerinde çalıştırılmasıdır.

Bu proje varsayılan olarak internet üzerinden herkese açık yayın mantığıyla değil, okul içinde yönetilen yerel kullanım senaryosu düşünülerek geliştirilmiştir.

## Güvenlik yaklaşımı

* Dosya yüklemelerinde tür kontrolü uygulanır
* Yükleme klasörleri uygulama tarafından sınırlandırılır
* SQLite veritabanı ve yüklenen dosyalar yerel olarak tutulur
* Dış veri kaynakları salt okunur biçimde kullanılır
* Yönetim paneli yalnızca içerik yönetimi amacıyla tasarlanmıştır

## Operasyon önerileri

* Yönetim panelini doğrudan genel internete açmayın
* Mümkünse yalnızca okul içi ağ üzerinden erişim verin
* Reverse proxy kullanılıyorsa IP veya ağ kısıtı uygulayın
* HTTPS kullanın
* Veritabanı dosyasını düzenli olarak yedekleyin
* `public/uploads` klasörünü düzenli olarak yedekleyin

## Dış veri kaynakları

Aşağıdaki servisler yalnızca veri okumak amacıyla kullanılır:

* TRT Haber RSS akışları
* Open-Meteo hava durumu servisleri

Bu kaynaklardan gelen veriler uygulama içinde doğrudan içerik üretimi amacıyla değil, görüntüleme amacıyla kullanılır.

## Güvenlik bildirimi

Bir güvenlik problemi fark edilirse, önce herkese açık issue açmadan doğrulanabilir teknik detaylarla bildirilmesi önerilir.

Kritik durumlarda issue açarken ilgili uç nokta, oluşan davranış ve tekrar üretim adımları açık şekilde belirtilmelidir.
