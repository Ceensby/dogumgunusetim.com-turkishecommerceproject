# doğumgünüsetim.com

Temalı doğum günü parti seti e-ticaret sitesi. Ürünler, temalar, fiyatlar ve görseller **tamamen veri tabanından** gelir. Yeni tema eklemek için kod değiştirmen gerekmez — admin panelini kullan.

## Çalıştırma

Gereksinim: Node.js 20+.

```bash
npm install
cd server
npx prisma migrate dev --name init
cd ..
npm run seed
npm run dev
```

- Mağaza: http://localhost:5173
- API: http://localhost:5000
- Prisma Studio: `npm run studio` (kök dizinden)

PostgreSQL'e geçmek için `server/prisma/schema.prisma` içinde `provider = "sqlite"` satırını `postgresql` yapman ve `DATABASE_URL` değerini güncellemen yeterli.

## Admin girişi

- Adres: http://localhost:5173/admin/giris
- E-posta: `admin@dogumgunusetim.com`
- Şifre: `Admin123!`

Bu değerleri `server/.env` dosyasındaki `ADMIN_EMAIL` / `ADMIN_PASSWORD` ile değiştirebilirsin. Seed'i tekrar çalıştırınca şifre güncellenir.

## Yeni bir tema nasıl eklenir?

41 temayı tek tek ekleyeceksen bu sıra her seferinde aynıdır. Kod yazmana gerek yok.

### 1. Görselleri hazırla

Gerçek fotoğrafları şu klasörlere, **aynı dosya adlarıyla** koy:

| Ne | Klasör | Örnek dosya adı |
|---|---|---|
| Setin toplu masa fotoğrafı | `client/public/images/themes/<slug>/` | `hero.jpg` |
| Ana sayfa kartı | `client/public/images/themes/<slug>/` | `thumb.jpg` |
| Galeri açıları (opsiyonel) | `client/public/images/themes/<slug>/` | `gallery-1.jpg` |
| Ürün fotoğrafları | `client/public/images/products/` | `<urun-slug>.jpg` |

Yer tutucu SVG'ler zaten duruyor. JPG'yi aynı isimle koyunca site onu kullanır (`ImageWithFallback` önce `.jpg` dener, yoksa `.svg`'ye düşer).

Admin panelinden de görsel yükleyebilirsin; yüklenen dosyalar `server/uploads/` altına gider ve ürün/tema kaydında `/uploads/...` URL'si tutulur.

### 2. Temayı oluştur

1. `/admin/giris` ile gir.
2. Sol menüden **Temalar** → **Yeni tema**.
3. Doldur:
   - **name:** Unicorn, Barbie, Spiderman…
   - **title:** "Barbie Doğum Günü Seti"
   - **slug:** boş bırakırsan isimden üretilir (`ı→i`, `ş→s`…). URL: `/tema/barbie`
   - **shortDescription:** kartlarda görünen kısa metin
   - **primaryColor:** sayfa aksanı (`#C77DFF` gibi)
   - **gender:** `kiz` / `erkek` / `unisex`
   - **ageGroup:** `bebek` / `cocuk` / `yetiskin`
   - **tags:** virgülle arama etiketleri
   - **isActive** açık olsun, ana sayfada görünsün
4. Hero ve thumbnail görselini yükle veya `/images/themes/barbie/hero.jpg` yolunu yaz.
5. **Kaydet**.

### 3. Ürünleri oluştur (veya mevcut olanları kullan)

**Temaya özel ürünler** (tabak, bardak, örtü, flama, yazı):

1. **Ürünler → Yeni ürün**
2. Ad, SKU (`BAR-TBK-08`), kategori, fiyat, `packSize` (8'li tabak için `8`), `unitLabel` (`8'li paket`), stok
3. **Tema** alanına yeni temayı seçebilirsin (opsiyonel; asıl bağ `Tema-ürün` ekranında yapılır)
4. Görseli yükle
5. Kaydet

**Düz renk / paylaşılan ürünler** (pembe çatal gibi birden fazla sette kullanılacaklar):

- **Tema** alanını boş bırak
- **Renk** seç (Pembe, Mavi…)
- Aynı pembe çatalı hem Unicorn hem Barbie setine atayabilirsin

### 4. Ürünleri temaya ata

1. **Temalar** listesinde ilgili temanın **Ürün ata** linkine tıkla (`/admin/tema-urun/:id`)
2. Ürünü seç, varsayılan adeti gir (tabak için `1`, flama için `0` gibi)
3. İstersen **Zorunlu** / **Önerilen** işaretle
4. **Ata**
5. Satırları sürükleyerek tema sayfasındaki sırayı değiştir

Bu kadar. Ana sayfa ve `/tema/<slug>` kod değişmeden yeni temayı gösterir.

### Fotoğrafları otomatik aktarma (önerilen)

41 tema için her görseli elle yeniden adlandırmak zorunda değilsin. Orijinalleri `dgtemalar/` (veya tema slug’lı bir alt klasör) altına koy, script WebP üretir ve veri tabanını günceller.

**Klasör:** proje kökünde `dgtemalar/` (şimdilik düz klasör yeterli). İleride `dgtemalar/barbie/` gibi ayırabilirsin.

**Dosya adı önerisi** (Türkçe karakter, boşluk, `8'li` / `8 adet` / `pk10` hepsi anlaşılır):

```
unicorn-karton-tabak-8-adet.webp
barbie-bardak-8li.jpg
spiderman-pecete-16-adet.png
unicorn-kurdan-pk10.jpg
unicorn-iyiki-dogdun-yazisi.webp
unicorn-set-hero.jpg          ← adında set/toplu/hero/kapak varsa tema kapak görseli olur
```

```bash
npm run import:theme -- --theme=unicorn --src=../dgtemalar --dry-run
npm run import:theme -- --theme=unicorn --src=../dgtemalar
```

`--dry-run` sadece tablo basar, dosya yazmaz. İkinci çalıştırma kopya ürün açmaz (SKU/slug/kategori eşlemesi). Hero yoksa ürün fotoğraflarından kolaj üretir.

Çıktı:

- Ürün: `client/public/images/products/<tema-slug>/<slug>.webp` (+ `-md` 600px, `-sm` 200px)
- Tema: `client/public/images/themes/<tema-slug>/hero.webp` ve `thumb.webp`

Orijinal dosyalar `dgtemalar/` içinde kalır.

### 5. Kontrol et

- http://localhost:5173 — kart görünüyor mu?
- http://localhost:5173/tema/<slug> — hero + ürün listesi
- 16 kişilik seçince 8'li tabak 2 pakete çıkıyor mu?

## Görsel dosya listesi (Unicorn)

Import sonrası gerçek fotoğraflar:

| Dosya | Ne için |
|---|---|
| `client/public/images/themes/unicorn/hero.webp` | Tema üst görseli (kolaj) |
| `client/public/images/themes/unicorn/thumb.webp` | Ana sayfa kartı |
| `client/public/images/products/unicorn/unicorn-karton-tabak-8li.webp` | Tabak |
| `client/public/images/products/unicorn/unicorn-karton-bardak-8li.webp` | Bardak |
| `client/public/images/products/unicorn/unicorn-pecete-16li.webp` | Peçete |
| `client/public/images/products/unicorn/unicorn-kurdan-10li.webp` | Kürdan |
| `client/public/images/products/unicorn/unicorn-iyi-ki-dogdun-yazisi.webp` | Yazı |

Fotoğrafı olmayanlar yer tutucu SVG/JPG ile durur: masa örtüsü, pembe çatal, pembe bıçak, flama.

## Kupon

Sepette `PARTI10` yazınca %10 indirim uygulanır (iskelet).

## Klasörler

- `client/` — React 18 + Vite + MUI v6
- `server/` — Express + Prisma + SQLite

Seed tekrar çalıştırılabilir (`upsert`); veriyi bozmaz.
