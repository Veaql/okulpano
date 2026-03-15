# Katkı Rehberi

OkulPano açık kaynak bir projedir. Okul içi dijital bilgi ekranı ihtiyacına katkı sunmak isteyen herkes düzenleme önerebilir.

## Geliştirme ortamı

```bash
npm install
cp .env.example .env
npm run db:push
npm run dev
```

İsteğe bağlı örnek veri:

```bash
npm run db:seed
```

## Önerilen kontrol adımları

Bir değişiklik göndermeden önce:

```bash
npm run lint
npm run typecheck
npm run build
```

## Katkı ilkeleri

- Yönetim paneli ve display metinleri Türkçe olmalıdır.
- Display ekranı signage mantığıyla ele alınmalıdır.
- Gösteriş yerine okunabilirlik ve kurumsal denge korunmalıdır.
- Yeni modüller mevcut veri akışını bozmamalıdır.
- README ve ilgili dokümanlar değişiklikle uyumlu güncellenmelidir.

## Commit önerisi

- `feat:` yeni özellik
- `fix:` hata düzeltmesi
- `docs:` dokümantasyon
- `refactor:` düzenleme
- `chore:` bakım işi
