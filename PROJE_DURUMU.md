# doğumgünüsetim.com — Proje Durumu

Son güncelleme: 22 Eylül 2026. Bu dosya, projeyi hiç görmemiş birinin kaldığı yerden devam etmesi için yazıldı.

Çalışma dizini: `C:\Users\cbekt\Masaüstü\dogumgunusetim.com`

---

## Son yapılanlar (22 Eylül 2026)

- **Düz renk importları:** Prefix kuralıyla (`<renk>-<malzeme>-<ürün>[N]`) peçete, masa örtüsü, metalize masa eteği, karton tabak (`GEN-KTB`) ve karton bardak (`GEN-KBR`) kataloga alındı. Plastik tabak/bardak ile karışmaz. Pembe fon perdesine gerçek foto eklendi (eski SVG yer tutucu kalkmıştı). Fiyatlar yer tutucu; masa eteği 99 TL.
- **Renk birleştirmeleri:** Lila→Mor (çatal `GEN-CTL-MOR-25`), Gri çatal Gümüş’e foto olarak birleşti, Siyah 10’lu çatal silindi (foto 25’liye eklendi), Mint ürünsüz silindi. `/renk/lila` → mor, `/renk/gri` → gumus, `/renk/beyaz` → krem.
- **Renk sayfası gruplama:** `CategoryGroup` (Plastikler, Kartonlar, Masa Üstü, Süsler) veritabanından gelir. `/renk/:slug` sticky çip + kompakt grid (mobil 2 / masaüstü 5 sütun). Admin kategoriler sayfasından grup seçilir. Tema sayfasına dokunulmadı.

---

## 1. Amaç ve farklılaştırıcı

Temalı doğum günü parti seti e-ticaret sitesi. Müşteri bir tema seçer (ör. Unicorn), kişi sayısını girer, tabak/bardak/örtü/süs gibi ürünlerin **adetini tek tek belirler** ve hepsini **tek set grubu** olarak sepete ekler.

Klasik “hazır kutu set” değil. Kalp akış:

1. `/tema/unicorn` — hero + “Kaç kişilik parti?” (8 / 16 / 24 / özel)
2. Kategori gruplarında adet seç (0 olanlar sete girmez)
3. “Setimi Tamamla” → sepete `setGroupId` ile tek grup olarak eklenir
4. Sepette grup düzenlenebilir; tekil ürün de ürün detayından eklenebilir

Ürün, tema, fiyat ve görseller **kodda gömülü değil**; Prisma + SQLite. 41 tema hedefleniyor; şu an seed’de yalnızca **Unicorn**. Yeni tema için kod değişmemeli: admin + `import:theme`.

Ödeme gerçek değil. Misafir sepet (`X-Cart-Session` cookie). Müşteri hesabı yok.

---

## 2. Teknoloji ve çalıştırma

| Katman | Stack |
|---|---|
| Mağaza | React 18, Vite, **saf JS/JSX (TypeScript yok)**, MUI v6, Zustand, TanStack Query, React Router, notistack |
| API | Express ESM, Prisma 6, SQLite (`server/prisma/dev.db`), JWT admin, Zod, bcrypt, multer, sharp |
| Görsel | WebP (ürün: 1200 / `-md` 600 / `-sm` 200; tema hero 1920px) |

Gereksinim: Node.js 20+.

```bash
npm install
cd server
npx prisma migrate dev
cd ..
npm run seed
npm run dev
```

- Mağaza: http://localhost:5173
- API: http://localhost:5000
- Prisma Studio: kökten `npm run studio`

Admin: http://localhost:5173/admin/giris  
`admin@dogumgunusetim.com` / `Admin123!` (`server/.env` → `ADMIN_EMAIL` / `ADMIN_PASSWORD`)

PostgreSQL: `schema.prisma` içinde `provider = "postgresql"` + `DATABASE_URL`.

Kök scriptler: `dev`, `seed`, `studio`, `migrate`, `import:theme`, `import:plain`.

---

## 3. Klasör yapısı

```
dogumgunusetim.com/
  client/                         Vite mağaza
    public/images/
      products/                   ürün görselleri (jpg/svg yer tutucu veya unicorn/*.webp)
      products/unicorn/           import edilmiş Unicorn ürün WebP’leri
      products/duz-renk/<renk>/   düz renk ürün WebP’leri (1200 / -md 600 / -sm 200)
      themes/unicorn/             hero.webp, hero-mobile.webp (kullanılmıyor), thumb.webp
    src/
      api/                        axios sarmalayıcılar (catalog, cart, admin, client)
      components/
        theme/ThemeHero.jsx       tema banner (aspect-ratio, overlay yok, yazı kartı altta)
        theme/ThemeCard.jsx       ana sayfa / temalar kartı (tamamı Link)
        product/                  detay galeri, set kartı, seçici kart
        setbuilder/               kişi sayısı, özet panel, mobil bar
        cart/                     drawer, set grubu, satır
      hooks/useSetBuilder.js      sessionStorage + URL setGroupId
      store/cartStore.js          sepet Zustand
      pages/                      mağaza + admin sayfaları
      utils/imageUrl.js           /images/products/**/*.webp için -sm/-md (tema ve duz-renk)
      utils/categoryIcons.jsx     CategoryGroup iconName → MUI ikon
  server/
    prisma/schema.prisma
    prisma/seed.js                Unicorn + kategoriler + renkler + admin
    prisma/migrations/
    scripts/importThemeImages.js  tema fotoğraf içe aktarma
    src/
      utils/parseThemeImage.js    dosya adı → kategori/adet
      controllers/themeController.js  groupedProducts (boş kategori yok)
      services/cartService.js     set grubu + tekil satır; unitPriceSnapshot
  dgtemalar/                      orijinal Unicorn fotoğraflar (silinmez)
  Parti malzemeleri/              düz renk orijinalleri (silinmez; import okur)
  PROJE_DURUMU.md                 bu dosya
```

Önemli dosyalar:

| Dosya | İş |
|---|---|
| `server/src/utils/parseThemeImage.js` | Import dosya adı kuralları (iyiki doğdun → flama) |
| `server/scripts/importThemeImages.js` | sharp WebP, upsert Product/Theme, kolaj hero |
| `server/scripts/importPlainProducts.js` | düz renk upsert: `themeId` null, `colorId` dolu, ThemeProduct yok |
| `server/src/utils/parsePlainImage.js` | dosya adı / eşleme / görselden renk |
| `server/src/utils/plainColors.js` | renk paleti, SKU kısaltmaları, kategori fiyatları |
| `server/prisma/seed.js` | temiz kurulum verisi; sepet fiyat senkronu |
| `client/src/hooks/useSetBuilder.js` | parti boyutu `ceil(kişiler / packSize)` |
| `client/src/components/common/ImageWithFallback.jsx` | size sm/md/lg, jpg yoksa svg, hata yer tutucu |
| `server/src/middleware/cartSession.js` | misafir sepet cookie |

---

## 4. Veri modeli

Kaynak: `server/prisma/schema.prisma`.

### Theme

`slug`, `name`, `title`, `description`, `shortDescription`, `heroImage`, **`heroAspectRatio`** (CSS, örn. `"1920 / 596"`), `thumbnail`, `primaryColor`, `secondaryColor`, `gender` (`kiz`/`erkek`/`unisex`), `ageGroup` (`bebek`/`cocuk`/`yetiskin`), `tags`, `isActive`, `isFeatured`, `sortOrder`, SEO alanları.

İlişkiler: `ThemeImage[]`, `ThemeProduct[]`, `Product[]` (`ProductPrimaryTheme` — opsiyonel `Product.themeId`), `CartItem[]`.

### Product

`sku` unique, `slug` unique, `name`, `description`, **`themeId` nullable**, `categoryId` zorunlu, **`colorId` nullable**, `price` (KDV dahil), `compareAtPrice`, `taxRate` (varsayılan 20), `packSize`, `unitLabel`, `stock`, `trackStock`, `isActive`, `sortOrder`, SEO.

- **Tema ürünü:** `themeId` = Unicorn. Ör. tabak, bardak.
- **Düz renk / paylaşılan ürün:** `themeId = null` + `colorId` set. Ör. pembe çatal, pembe bıçak, **pembe fon perdesi**. Temaya **yalnızca `ThemeProduct`** ile bağlanır; `/renk/pembe` `colorId` ile listeler.

### ThemeProduct (çok-çok)

PK `(themeId, productId)`. `sortOrder`, `defaultQuantity`, `isRequired`, `isRecommended`.  
Tema sayfası ürün listesi **buradan** gelir (`themeId` alanından değil).

### ProductAttribute

`label` / `value` / `sortOrder`. Detay sayfasında çip. Seed varsayılanları: Paket İçeriği, Tema, Malzeme, Renk, Kullanım. Masa örtüsünde ek: `Ölçü: 120 x 180 cm`.

### ProductImage

`url`, `alt`, `sortOrder`, `isPrimary`. Tema kartı ve set seçici **yalnızca `images[0]`** (isPrimary desc) gösterir.

### Category / Color / CategoryGroup

- **Category** — katalog; `groupId` ile `CategoryGroup`’a bağlanır.
- **CategoryGroup** — `/renk/:slug` bölümleri (Plastikler, Kartonlar, Masa Üstü, Süsler). Admin’den yönetilir.
- **Color** — katalog; pasif renkler mağazada listelenmez.

### Diğer

- **Cart / CartItem** — `sessionId`; `setGroupId` + `setName` set grubu; `unitPriceSnapshot`.
- **Customer / Address / Order / OrderItem** — ödeme iskeleti, sipariş `pending`.
- **AdminUser** — JWT.
- **SiteSetting** — kargo eşiği, metinler, iletişim.

---

## 5. Mevcut veriler

### Kategoriler

| sort | slug | ad | pluralName | unitLabel |
|---|---|---|---|---|
| 1 | karton-tabak | Karton Tabak | Karton Tabaklar | paket |
| 2 | plastik-tabak | Plastik Tabak | Plastik Tabaklar | paket |
| 3 | karton-bardak | Karton Bardak | Karton Bardaklar | paket |
| 4 | plastik-bardak | Plastik Bardak | Plastik Bardaklar | paket |
| 5 | pecete | Peçete | Peçeteler | paket |
| 6 | kurdan | Kürdan | Kürdanlar | paket |
| 7 | dogum-gunu-yazisi | Doğum Günü Yazısı | Yazılar | adet |
| 8 | flama | Flama | Flamalar | adet |
| 9 | fon-perdesi | Fon Perdesi | Fon Perdeleri | adet |
| 10 | masa-ortusu | Masa Örtüsü | Masa Örtüleri | adet |
| 11 | masa-etegi | Masa Eteği | Masa Etekleri | adet |
| 12 | plastik-catal | Plastik Çatal | Çatallar | paket |
| 13 | plastik-bicak | Plastik Bıçak | Bıçaklar | paket |
| 14 | balon | Balon | Balonlar | paket |
| 15 | mum | Mum | Mumlar | adet |

Tema sayfasında **aktif ürünü olmayan kategori başlığı gösterilmez**. Yazı kategorisi Unicorn’da bu yüzden yok.

### Kategori grupları (`CategoryGroup`)

`/renk/:slug` bu gruplara göre toplanır (kategori başlığı yok). `groupId` nullable.

| sıra | slug | ad | kategoriler |
|---|---|---|---|
| 1 | plastikler | Plastikler | Plastik Tabak, Plastik Bardak |
| 2 | kartonlar | Kartonlar | Karton Tabak, Karton Bardak, Peçete |
| 3 | masa-ustu | Masa Üstü | Plastik Çatal, Plastik Bıçak, Masa Örtüsü, Masa Eteği |
| 4 | susler | Süsler | Fon Perdesi, Balon (boş) |

Kürdan, Flama, Yazı, Mum gruba bağlı değil.

### Renkler

Pembe `#FF6FA5`, Mavi, **Krem** `#F3E9D2` (`/renk/beyaz` → `/renk/krem`), Altın, Kırmızı, Siyah, **Gümüş** `#C0C5CA` (`/renk/gri` → `/renk/gumus`), **Rose Gold** `#C98973`, **Mor** `#7A1FA2` (`/renk/lila` → `/renk/mor`), **Yeşil** `#22A34A`, **Gökkuşağı** `#FF7A62`, **Sarı** `#F5C400`, **Turuncu** `#FF8A1A`.

Lila, Gri ve Mint Color satırları silindi. Mint’te ürün yoktu. `/renkler` yalnızca `isActive` renkleri listeler.

### Temalar

Yalnızca **Unicorn** (`/tema/unicorn`). Hero: `hero.webp` (masa banner, 1920×596, aspect `1920 / 596`). Thumb: aynı kareden 800px `thumb.webp`.

### Ürünler

| Ad | SKU | Kategori | pack | Fiyat | Aktif | themeId | color | ThemeProduct | Gerçek foto |
|---|---|---|---|---|---|---|---|---|---|
| Unicorn Karton Tabak | UNI-TBK-08 | Karton Tabak | 8 | 89 | evet | Unicorn | — | evet | evet |
| Unicorn Karton Bardak | UNI-BRD-08 | Karton Bardak | 8 | 69 | evet | Unicorn | — | evet | evet (2 görsel) |
| Unicorn Peçete | UNI-PCT-16 | Peçete | 16 | 75 | evet | Unicorn | — | evet | evet |
| Unicorn Kürdan | UNI-KRD-10 | Kürdan | 10 | 45 | evet | Unicorn | — | evet | evet |
| Unicorn Flama | UNI-FLM-01 | Flama | 1 | 59 | evet | Unicorn | — | evet | evet (iyi ki doğdun ana; yer tutucu 2.) |
| Pembe Fon Perdesi | GEN-FON-PMB-01 | Fon Perdesi | 1 | 119 | evet | null | Pembe | evet | evet (2 WebP; eski SVG yer tutucu) |
| Unicorn Masa Örtüsü (120x180 cm) | UNI-MOR-01 | Masa Örtüsü | 1 | 75 | evet | Unicorn | — | evet | hayır |
| Pembe Renk Plastik Çatal | GEN-CTL-PMB-25 | Plastik Çatal | 25 | 79 | evet | null | Pembe | evet | evet (2) |
| Pembe Renk Plastik Bıçak | GEN-BCK-PMB-25 | Plastik Bıçak | 25 | 79 | evet | null | Pembe | evet | evet (2) |
| Unicorn İyi ki Doğdun Yazısı | UNI-YZI-01 | Doğum Günü Yazısı | 1 | 99.9 | **hayır** | Unicorn | — | **yok** | görsel kaydı silindi |

Fiyatlar TL, KDV dahil.

### Düz renk — Fon Perdesi (themeId null, ThemeProduct yok; pembe hariç)

Hepsi stok 100, fiyat **119 TL (varsayılan — kontrol et)**, pack 1, malzeme Folyo. 2 fotoğraf (WebP).

| Ad | SKU | Renk |
|---|---|---|
| Altın Metalik Fon Perdesi | GEN-FON-ALT-01 | Altın |
| Gümüş Metalik Fon Perdesi | GEN-FON-GMS-01 | Gümüş |
| Kırmızı Fon Perdesi | GEN-FON-KRM-01 | Kırmızı |
| Siyah Mat Fon Perdesi | GEN-FON-SYH-01 | Siyah |
| Mor Fon Perdesi | GEN-FON-MOR-01 | Mor |
| Yeşil Fon Perdesi | GEN-FON-YSL-01 | Yeşil |
| Gökkuşağı Fon Perdesi | GEN-FON-GKK-01 | Gökkuşağı |
| Mavi Fon Perdesi | GEN-FON-MAV-01 | Mavi |
| Rose Gold Fon Perdesi | GEN-FON-RSG-01 | Rose Gold |

Pembe Fon Perdesi (`GEN-FON-PMB-01`) Unicorn setine bağlı kalır. Ana görsel artık `duz-renk/pembe/pembe-fon-perdesi.webp` (2. foto var). Eski neden: seed/DB `isPrimary` olarak `/images/products/pembe-fon-perdesi.svg` yer tutucuyu tutuyordu; kopya ürün yoktu. Diskte kullanılmayan `client/public/images/products/pembe-fon-perdesi.svg` duruyor.

### Düz renk — Plastik Çatal (themeId null; pembe hariç ThemeProduct yok)

Fiyat **79 TL (varsayılan — kontrol et)**. Paket adedi dosyada yoksa 25 kabul edildi, özellikte yazılmaz.

| Ad | SKU | Renk | pack | Foto |
|---|---|---|---|---|
| Pembe Renk Plastik Çatal (mevcut; Unicorn bağlı) | GEN-CTL-PMB-25 | Pembe | 25 | 2 |
| Mavi Plastik Çatal | GEN-CTL-MAV-25 | Mavi | 25 | 2 |
| Sarı Plastik Çatal | GEN-CTL-SAR-25 | Sarı | 25 | 2 |
| Siyah Plastik Çatal | GEN-CTL-SYH-25 | Siyah | 25 | 2 (10’lu paket fotoğrafı 2. görsel) |
| Gümüş Plastik Çatal | GEN-CTL-GMS-25 | Gümüş | 25 | 2 (eski Gri çatal fotoğrafı 2. görsel) |
| Yeşil Plastik Çatal | GEN-CTL-YSL-25 | Yeşil | 25 | 2 |
| Turuncu Plastik Çatal | GEN-CTL-TRN-25 | Turuncu | 25 | 2 |
| Mor Plastik Çatal (eski Lila) | GEN-CTL-MOR-25 | Mor | 25 | 2 |
| Krem Plastik Çatal | GEN-CTL-KRE-25 | Krem | 25 | 2 |
| Kırmızı Plastik Çatal | GEN-CTL-KRM-25 | Kırmızı | 25 | 2 |
| Altın Plastik Çatal | GEN-CTL-ALT-25 | Altın | 25 | 2 |

### Düz renk — Plastik Bıçak (themeId null; pembe hariç ThemeProduct yok)

Fiyat **79 TL (varsayılan — kontrol et)**, paket **25** (dosya adında adet yok). Hepsi 2 fotoğraf.

| Ad | SKU | Renk | pack | Foto |
|---|---|---|---|---|
| Pembe Renk Plastik Bıçak (mevcut; Unicorn bağlı, fiyat dokunulmadı) | GEN-BCK-PMB-25 | Pembe | 25 | 2 |
| Altın Plastik Bıçak | GEN-BCK-ALT-25 | Altın | 25 | 2 |
| Gümüş Plastik Bıçak | GEN-BCK-GMS-25 | Gümüş | 25 | 2 |
| Kırmızı Plastik Bıçak | GEN-BCK-KRM-25 | Kırmızı | 25 | 2 |
| Krem Plastik Bıçak | GEN-BCK-KRE-25 | Krem | 25 | 2 |
| Mavi Plastik Bıçak | GEN-BCK-MAV-25 | Mavi | 25 | 2 |
| Mor Plastik Bıçak | GEN-BCK-MOR-25 | Mor | 25 | 2 |
| Sarı Plastik Bıçak | GEN-BCK-SAR-25 | Sarı | 25 | 2 |
| Siyah Plastik Bıçak | GEN-BCK-SYH-25 | Siyah | 25 | 2 |
| Turuncu Plastik Bıçak | GEN-BCK-TRN-25 | Turuncu | 25 | 2 |
| Yeşil Plastik Bıçak | GEN-BCK-YSL-25 | Yeşil | 25 | 2 |

### Düz renk — Plastik Tabak (yeni kategori, sortOrder 2; Karton Tabak değil)

Fiyat **89 TL (varsayılan — kontrol et)**, paket **8**. `themeId` null.

| Ad | SKU | Renk | pack | Foto |
|---|---|---|---|---|
| Altın Plastik Tabak | GEN-TBK-ALT-08 | Altın | 8 | 1 |
| Gümüş Plastik Tabak | GEN-TBK-GMS-08 | Gümüş | 8 | 1 |
| Krem Plastik Tabak | GEN-TBK-KRE-08 | Krem | 8 | 1 |
| Kırmızı Plastik Tabak | GEN-TBK-KRM-08 | Kırmızı | 8 | 2 |
| Mavi Plastik Tabak | GEN-TBK-MAV-08 | Mavi | 8 | 2 |
| Pembe Plastik Tabak | GEN-TBK-PMB-08 | Pembe | 8 | 2 |
| Sarı Plastik Tabak | GEN-TBK-SAR-08 | Sarı | 8 | 2 |
| Siyah Plastik Tabak | GEN-TBK-SYH-08 | Siyah | 8 | 2 |
| Turuncu Plastik Tabak | GEN-TBK-TRN-08 | Turuncu | 8 | 2 |
| Yeşil Plastik Tabak | GEN-TBK-YSL-08 | Yeşil | 8 | 2 |

### Düz renk — Plastik Bardak (yeni kategori, sortOrder 4; Karton Bardak değil)

Fiyat **69 TL (varsayılan — kontrol et)**, paket **8**. `themeId` null.

| Ad | SKU | Renk | pack | Foto |
|---|---|---|---|---|
| Altın Plastik Bardak | GEN-BRD-ALT-08 | Altın | 8 | 1 |
| Gümüş Plastik Bardak | GEN-BRD-GMS-08 | Gümüş | 8 | 1 |
| Kırmızı Plastik Bardak | GEN-BRD-KRM-08 | Kırmızı | 8 | 2 |
| Krem Plastik Bardak | GEN-BRD-KRE-08 | Krem | 8 | 2 |
| Mavi Plastik Bardak | GEN-BRD-MAV-08 | Mavi | 8 | 2 |
| Pembe Plastik Bardak | GEN-BRD-PMB-08 | Pembe | 8 | 2 |
| Sarı Plastik Bardak | GEN-BRD-SAR-08 | Sarı | 8 | 2 |
| Siyah Plastik Bardak | GEN-BRD-SYH-08 | Siyah | 8 | 2 |
| Turuncu Plastik Bardak | GEN-BRD-TRN-08 | Turuncu | 8 | 2 |
| Yeşil Plastik Bardak | GEN-BRD-YSL-08 | Yeşil | 8 | 2 |

### Düz renk — Kağıt Peçete (mevcut Peçete kategorisi)

Fiyat **75 TL (varsayılan — kontrol et)**, paket **16** (Unicorn Peçete ile aynı). `themeId` null. Malzeme Kağıt.

| Ad | SKU | Renk | pack | Foto |
|---|---|---|---|---|
| Altın Kağıt Peçete | GEN-PCT-ALT-16 | Altın | 16 | 2 |
| Gümüş Kağıt Peçete | GEN-PCT-GMS-16 | Gümüş | 16 | 1 |
| Kırmızı Kağıt Peçete | GEN-PCT-KRM-16 | Kırmızı | 16 | 2 |
| Krem Kağıt Peçete | GEN-PCT-KRE-16 | Krem | 16 | 1 |
| Mavi Kağıt Peçete | GEN-PCT-MAV-16 | Mavi | 16 | 2 |
| Pembe Kağıt Peçete | GEN-PCT-PMB-16 | Pembe | 16 | 2 |
| Sarı Kağıt Peçete | GEN-PCT-SAR-16 | Sarı | 16 | 2 |
| Siyah Kağıt Peçete | GEN-PCT-SYH-16 | Siyah | 16 | 2 |
| Turuncu Kağıt Peçete | GEN-PCT-TRN-16 | Turuncu | 16 | 1 |
| Yeşil Kağıt Peçete | GEN-PCT-YSL-16 | Yeşil | 16 | 1 |

Unicorn Peçete (`UNI-PCT-16`) duruyor; kopya yok.

### Düz renk — Plastik Masa Örtüsü (mevcut Masa Örtüsü kategorisi)

Fiyat **75 TL**, 1 adet, ölçü **120 x 180 cm** (üçü de varsayılan — kontrol et). `themeId` null. Malzeme Plastik. `beyaz-plastik-masaortusu` → Krem.

| Ad | SKU | Renk | pack | Foto |
|---|---|---|---|---|
| Altın Plastik Masa Örtüsü | GEN-MOR-ALT-01 | Altın | 1 | 2 |
| Gümüş Plastik Masa Örtüsü | GEN-MOR-GMS-01 | Gümüş | 1 | 2 |
| Krem Plastik Masa Örtüsü (beyaz dosya) | GEN-MOR-KRE-01 | Krem | 1 | 1 |
| Kırmızı Plastik Masa Örtüsü | GEN-MOR-KRM-01 | Kırmızı | 1 | 1 |
| Mavi Plastik Masa Örtüsü | GEN-MOR-MAV-01 | Mavi | 1 | 2 |
| Mor Plastik Masa Örtüsü | GEN-MOR-MOR-01 | Mor | 1 | 1 |
| Pembe Plastik Masa Örtüsü | GEN-MOR-PMB-01 | Pembe | 1 | 2 |
| Sarı Plastik Masa Örtüsü | GEN-MOR-SAR-01 | Sarı | 1 | 1 |
| Siyah Plastik Masa Örtüsü | GEN-MOR-SYH-01 | Siyah | 1 | 1 |
| Turuncu Plastik Masa Örtüsü | GEN-MOR-TRN-01 | Turuncu | 1 | 1 |
| Yeşil Plastik Masa Örtüsü | GEN-MOR-YSL-01 | Yeşil | 1 | 1 |

Unicorn Masa Örtüsü (`UNI-MOR-01`) duruyor; kopya yok.

### Düz renk — Metalize Masa Eteği (yeni kategori, sortOrder 11)

Fiyat **99 TL (yer tutucu — kontrol et)**, 1 adet. Ölçü yok (dosya adında da yoktu, uydurulmadı). `themeId` null, ThemeProduct yok. Malzeme **Metalize folyo**. Paket özelliği yazılmaz.

| Ad | SKU | Renk | pack | Foto |
|---|---|---|---|---|
| Altın Metalize Masa Eteği | GEN-MET-ALT-01 | Altın | 1 | 1 |
| Gümüş Metalize Masa Eteği | GEN-MET-GMS-01 | Gümüş | 1 | 1 |
| Kırmızı Metalize Masa Eteği | GEN-MET-KRM-01 | Kırmızı | 1 | 1 |
| Mavi Metalize Masa Eteği | GEN-MET-MAV-01 | Mavi | 1 | 1 |
| Mor Metalize Masa Eteği | GEN-MET-MOR-01 | Mor | 1 | 1 |
| Pembe Metalize Masa Eteği | GEN-MET-PMB-01 | Pembe | 1 | 1 |
| Rose Gold Metalize Masa Eteği | GEN-MET-RSG-01 | Rose Gold | 1 | 1 |
| Siyah Metalize Masa Eteği | GEN-MET-SYH-01 | Siyah | 1 | 1 |
| Yeşil Metalize Masa Eteği | GEN-MET-YSL-01 | Yeşil | 1 | 1 |

### Düz renk — Karton Tabak (mevcut Karton Tabak kategorisi; plastik GEN-TBK değil)

Fiyat **89 TL**, paket **8**. `themeId` null. Malzeme Karton. SKU `GEN-KTB-*` — Unicorn `UNI-TBK-08` ve plastik `GEN-TBK-*` ile çakışmaz.

| Ad | SKU | Renk | pack | Foto |
|---|---|---|---|---|
| Altın Karton Tabak | GEN-KTB-ALT-08 | Altın | 8 | 2 |
| Gümüş Karton Tabak | GEN-KTB-GMS-08 | Gümüş | 8 | 2 |
| Kırmızı Karton Tabak | GEN-KTB-KRM-08 | Kırmızı | 8 | 2 |
| Mavi Karton Tabak | GEN-KTB-MAV-08 | Mavi | 8 | 2 |
| Mor Karton Tabak | GEN-KTB-MOR-08 | Mor | 8 | 1 |
| Pembe Karton Tabak | GEN-KTB-PMB-08 | Pembe | 8 | 2 |
| Sarı Karton Tabak | GEN-KTB-SAR-08 | Sarı | 8 | 2 |
| Siyah Karton Tabak | GEN-KTB-SYH-08 | Siyah | 8 | 2 |
| Turuncu Karton Tabak | GEN-KTB-TRN-08 | Turuncu | 8 | 2 |
| Yeşil Karton Tabak | GEN-KTB-YSL-08 | Yeşil | 8 | 2 |

### Düz renk — Karton Bardak (mevcut Karton Bardak kategorisi; plastik GEN-BRD değil)

Kaynak klasör: `Parti malzemeleri/Lisanssız karton bardak` (tabak klasörüne karışık değil). Fiyat **69 TL**, paket **8**. `themeId` null. Malzeme Karton. SKU `GEN-KBR-*` — Unicorn `UNI-BRD-08` ve plastik `GEN-BRD-*` ile çakışmaz.

| Ad | SKU | Renk | pack | Foto |
|---|---|---|---|---|
| Altın Karton Bardak | GEN-KBR-ALT-08 | Altın | 8 | 2 |
| Gümüş Karton Bardak | GEN-KBR-GMS-08 | Gümüş | 8 | 2 |
| Kırmızı Karton Bardak | GEN-KBR-KRM-08 | Kırmızı | 8 | 2 |
| Mavi Karton Bardak | GEN-KBR-MAV-08 | Mavi | 8 | 2 |
| Mor Karton Bardak | GEN-KBR-MOR-08 | Mor | 8 | 2 |
| Pembe Karton Bardak | GEN-KBR-PMB-08 | Pembe | 8 | 2 |
| Sarı Karton Bardak | GEN-KBR-SAR-08 | Sarı | 8 | 2 |
| Siyah Karton Bardak | GEN-KBR-SYH-08 | Siyah | 8 | 2 |
| Turuncu Karton Bardak | GEN-KBR-TRN-08 | Turuncu | 8 | 2 |
| Yeşil Karton Bardak | GEN-KBR-YSL-08 | Yeşil | 8 | 2 |

---

## 6. Import script

Kökten:

```bash
npm run import:theme -- --theme=unicorn --src=../dgtemalar --dry-run
npm run import:theme -- --theme=unicorn --src=../dgtemalar
```

`--dry-run` sadece tablo basar. Orijinaller silinmez. İkinci çalıştırma SKU/slug/kategori ile upsert eder, kopya açmaz.

Çıktı:

- `client/public/images/products/<tema-slug>/<slug>.webp` (+ `-md`, `-sm`), kare tuval, beyaz pad %6
- `client/public/images/themes/<tema-slug>/hero.webp` (1920px, kırpmadan) + `thumb.webp` (800px)
- Hero yoksa ürün fotoğraflarından 1600×900 kolaj; `heroAspectRatio` DB’ye yazılır

### Dosya adı çözümleme (`parseThemeImage.js`)

Normalize: Türkçe karakter, boşluk, `_`, `-` → slug.

Adet: `8li`, `8'li`, `8 adet`, `pk10`, `x8`… Yoksa 1.

Kategori sırası:

1. Adında `yazi` / `yazisi` → **Doğum Günü Yazısı**
2. Aksi halde `flama` / `bayrak` / `banner` **veya** `iyi ki` / `iyiki` / `dogdun` → **Flama**
3. `tabak` → Karton Tabak, `bardak` → Karton Bardak, `kurdan` → Kürdan, `pecete` → Peçete, `ortu` → Masa Örtüsü
4. `set` / `toplu` / `hepsi` / `hero` / `kapak` veya eşleşmezse → tema **hero**

Örnek: `unicorn-iyiki-dogdun-temali.webp` → Flama. `unicorn-iyiki-dogdun-yazisi.webp` → Yazı.

**Dikkat:** `banner` kelimesi flama sayılır. Unicorn kapak dosyası `unıcorn-tema-banner.jfif` import ile tekrar işlenirse flama ürününe gidebilir. Kapak için `hero`/`kapak` kullan veya `banner` kuralını hero’ya al (yapılacaklar).

Script **tema odaklıdır**; düz renk için `import:plain` kullanılır.

---

## 6b. Düz renk import

```bash
npm run import:plain -- --src="Parti malzemeleri/Arka Fon perde" --category=fon-perdesi --dry-run
npm run import:plain -- --src="Parti malzemeleri/Lisanssız Çatal" --category=plastik-catal
npm run import:plain -- --src="Parti malzemeleri/Lisanssız Bıçak" --category=plastik-bicak --naming=prefix --dry-run
npm run import:plain -- --src="Parti malzemeleri/Lisanssız Tabak" --category=plastik-tabak --naming=prefix
npm run import:plain -- --src="Parti malzemeleri/Lisanssız Bardak" --category=plastik-bardak --naming=prefix
npm run import:plain -- --src="Parti malzemeleri/Lisanssız Peçete" --category=pecete --naming=prefix
npm run import:plain -- --src="Parti malzemeleri/Lisanssız Masa örtüsü" --category=masa-ortusu --naming=prefix
npm run import:plain -- --src="Parti malzemeleri/Masa Eteği" --category=masa-etegi --naming=prefix
npm run import:plain -- --src="Parti malzemeleri/Lisanssız karton tabak" --category=karton-tabak --naming=prefix
npm run import:plain -- --src="Parti malzemeleri/Lisanssız karton bardak" --category=karton-bardak --naming=prefix
npm run import:plain -- --src="Parti malzemeleri/Arka Fon perde" --category=fon-perdesi --naming=prefix --filter=pembe
```

`--dry-run` yazmaz (kategori bile açmaz). Orijinaller silinmez/taşınmaz. İkinci çalıştırma SKU/slug ile upsert eder, kopya açmaz.

`--naming=prefix` genel kalıp: `<renk>-<malzeme>-<ürün>[N].<uzantı>`. Malzeme: `plastik`/`platik`, `kagit`/`kağıt`, `karton`, `metalize`/`metalise`/`metalik`. Renk malzeme kelimesinden önceki her şeydir. `masaortusu` = `masa-ortusu`, `masaetegi` = `masa-etegi`. `beyaz` → Krem. Görsellere bakılmaz. Klasörün %20’sinden fazlası kurala uymazsa o klasör iptal. `--filter=` yalnızca ada uyan dosyaları sayar (pembe fon: diğer Arka Fon perde dosyaları skip oranına girmez).

`plastik-tabak` / `plastik-bardak` / `masa-etegi` yoksa oluşturulur (Karton Tabak/Bardak’ın hemen arkası; Masa Eteği Masa Örtüsü’nün hemen arkası, sortOrder 11). Diğer slug’lar hâlâ mevcut kategori ister.

- Çıktı: `client/public/images/products/duz-renk/<renk-slug>/<ürün-slug>.webp` (+ `-md`, `-sm`), kare beyaz tuval
- `themeId: null`, `colorId` dolu, **ThemeProduct yazılmaz**
- Çakışan pembe ürünler (`GEN-FON-PMB-01`, `GEN-CTL-PMB-25`, `GEN-BCK-PMB-25`): yalnızca fotoğraf eklenir; fiyat ve Unicorn bağı korunur
- Varsayılan modda renk dosya adında yoksa `plain-file-colors.json` veya görselden dominant renk
- Fotoğraf yoksa rengin hexCode’u ile SVG yer tutucu
- Kategori fiyatları: fon 119, çatal/bıçak 79, plastik tabak 89 (8’li), plastik bardak 69 (8’li), peçete 75 (16’lı), masa örtüsü 75 + 120x180 cm, masa eteği 99 (ölçü yok), karton tabak 89 (8’li, GEN-KTB), karton bardak 69 (8’li, GEN-KBR) — dosyada yoksa varsayılan; kontrol et

---

## 7. Şimdiye kadar yapılanlar

- Tam yığın: mağaza + API + admin JWT + misafir sepet + set grubu + sipariş iskeleti
- Unicorn seed; kişi sayısına göre paket `ceil`
- `dgtemalar` import: tabak, bardak (2 foto), peçete, kürdan; yazı fotoğrafı flama ana görseli
- Ürün detay `/urun/:slug`: galeri (masaüstü thumbnail + 375px kaydırmalı şerit, lightbox okları), lightbox, özellik çipleri, set promo, ilgili ürünler, mobil buy bar. Ürün değişince seçili fotoğraf index’i sıfırlanır. Kart/sepet yalnızca `isPrimary`.
- Tema hero: gerçek banner, kırpmadan `object-fit: contain` + `heroAspectRatio`; yazı/buton beyaz kartta, desktop ~40px overlap
- Ana sayfa kartı aynı masa fotoğrafı (`thumb.webp`, `object-position: center 65%`); kartın tamamı tıklanabilir
- İyiki doğdun → flama kuralı; yazı ürünü pasif, temadan ve sepetten çıkarıldı
- Fiyat güncellemesi; masa örtüsü adı + Ölçü özelliği
- Pembe Fon Perdesi düz renk ürünü (çatal/bıçak mantığı), Unicorn setine ThemeProduct ile bağlı
- Düz renk import: Fon perdesi + plastik çatal + bıçak + plastik tabak + plastik bardak + kağıt peçete + plastik masa örtüsü + metalize masa eteği + karton tabak + karton bardak
- `/renk/:slug` **CategoryGroup** ile toplanır (sticky çip: Tümü / Plastikler / Kartonlar / Masa Üstü / Süsler). Kategori başlığı yok; kompakt kart + kategori etiketi + sepete ekle. Masaüstü 5, tablet 3–4, mobil 2 sütun. Tema sayfasına dokunulmadı.
- **Galeri düzeltmesi:** DB/API 2+ `ProductImage` ve `-2.webp`/`-2-sm`/`-2-md` dosyaları zaten doğruydu. Md altı şeritte flex kaydırma (`flex: 0 0 100%`), tıklanır noktalar, lightbox okları, ürün değişince index sıfırlama eklendi. `sizedImageUrl` yalnızca `-sm`/`-md` ekini kırpar, `...-2.webp` sırasına dokunmaz.
- Beyaz Color kaydı Krem’e güncellendi (`#F3E9D2`); `/renk/beyaz` yönlendirmesi
- `import:plain --naming=prefix` `<renk>-<malzeme>-<ürün>[N]`; Lisanssız Peçete (16 görsel) + Lisanssız Masa örtüsü (15 görsel) %0 kural dışı. Yeni Color yok. `beyaz` masa örtüsü → Krem. Yedek: `peçete-masa örtüsü importu öncesi yedek`
- Masa Eteği + Lisanssız karton tabak + Lisanssız karton bardak importu (dry-run %0 skip). Yeni Color yok. Pembe fon `--filter=pembe` ile mevcut `GEN-FON-PMB-01` ana görseli. Yedek: `masa eteği ve karton tabak-bardak importu öncesi yedek` (`c3e3f49`)
- Renk sadeleştirme: Lila→Mor (çatal taşındı `GEN-CTL-MOR-25`), Gri çatal Gümüş’e foto olarak birleşti, Siyah 10’lu çatal silindi (foto 25’liye eklendi), Mint silindi. Yönlendirme: `/renk/lila` → mor, `/renk/gri` → gumus. Yedek: `renk düzenlemeleri öncesi yedek` (`4dba1a8`)
- Boş kategori başlığı gizleme
- Admin: tema/ürün/kategori/renk CRUD, tema-ürün ata + sürükle sıra, sipariş listesi, ayarlar, ürün özellikleri ekle/sil

---

## 8. Eksikler / bilinen sorunlar / yapılacaklar

### Unicorn’da fotoğrafı olmayanlar

Yer tutucu (jpg URL → svg veya harf kutusu):

- Unicorn Masa Örtüsü
- Flama 2. galeri görseli (`unicorn-flama.jpg` diskte yok, svg düşer)

Pembe çatal, pembe bıçak ve pembe fon perdesinin gerçek fotoğrafı var (`duz-renk/pembe/`).

### Veri / katalog

- 40 tema daha yok
- `UNI-YZI-01` ölü kayıt (pasif, görselsiz, ThemeProduct yok) — silinebilir veya ileride gerçek yazı ürünü olarak açılır
- Balon / mum kategorileri boş
- Düz renk fiyatları/paket/ölçü varsayılan (fon 119, çatal/bıçak 79×25, plastik tabak 89×8, plastik bardak 69×8, peçete 75×16, masa örtüsü 75 + 120x180 cm, **masa eteği 99 yer tutucu**, karton tabak 89×8, karton bardak 69×8) — kontrol et

### Import / görsel

- `banner` dosya adı flama ile çakışıyor
- `hero-mobile.webp` üretildi ama hero artık tek görsel; dosya artabilir
- `parseThemeImage` `fon-perdesi`, `plastik-catal`, `plastik-bicak` dosya adını tanımaz
- Admin tema formunda `heroAspectRatio` alanı yok (import/seed yazar)

### Ürün / ödeme / hesap

- Gerçek ödeme yok; checkout uyarı + sipariş `pending`
- Üye girişi yok
- Kupon `PARTI10` iskelet
- “Gelince haber ver” snackbar “Yakında”

### Admin

- Toplu görsel yükleme / import UI yok
- Stok uyarı, rapor, kargo entegrasyonu yok
- Özellik sırası admin’de sınırlı (ekle/sil var)

---

## 9. Düz renk fotoğrafları — klasör ve import

Kaynak (orijinaller silinmez):

Diskte tek kök (büyük/küçük harf taraması): `C:\Users\cbekt\Masaüstü\dogumgunusetim.com\Parti malzemeleri` (171 dosya). Prefix kuralına uyan alt klasörler:

```
Parti malzemeleri/
  Arka Fon perde/       → fon-perdesi (önceki import)
  Lisanssız Çatal/      → plastik-catal (önceki import)
  Lisanssız Bıçak/      → plastik-bicak --naming=prefix (22 görsel)
  Lisanssız Tabak/      → plastik-tabak --naming=prefix (17 görsel)
  Lisanssız Bardak/     → plastik-bardak --naming=prefix (18 görsel)
  Lisanssız Peçete/     → pecete --naming=prefix (16 görsel)
  Lisanssız Masa örtüsü/ → masa-ortusu --naming=prefix (15 görsel)
  Masa Eteği/            → masa-etegi --naming=prefix (9 görsel)
  Lisanssız karton tabak/ → karton-tabak --naming=prefix (19 görsel; gumus jpg+png → 2 foto)
  Lisanssız karton bardak/ → karton-bardak --naming=prefix (20 görsel; ayrı klasör)
```

Komut: `npm run import:plain -- --src="<klasör>" --category=<slug> [--naming=prefix] [--filter=] [--dry-run]`

Kalan düz renk klasörleri (bu turda dokunulmadı): diğer Parti malzemeleri alt klasörleri.

---

## 10. Hızlı URL’ler (dev)

Mağaza bu oturumda Vite 5174’te de açılabilir; varsayılan 5173.

- http://localhost:5173/
- http://localhost:5173/temalar
- http://localhost:5173/tema/unicorn
- http://localhost:5173/renkler
- http://localhost:5173/renk/pembe
- http://localhost:5173/renk/mor (eski `/renk/lila` buraya)
- http://localhost:5173/renk/gumus (eski `/renk/gri` buraya)
- http://localhost:5173/renk/siyah
- http://localhost:5173/admin/kategoriler (grup yönetimi)
- http://localhost:5173/renk/mavi
- http://localhost:5173/renk/altin
- http://localhost:5173/renk/krem
- http://localhost:5173/renk/beyaz (krem’e yönlenir)
- http://localhost:5173/urun/unicorn-karton-bardak-8li (2 foto, galeri)
- http://localhost:5173/urun/altin-metalik-fon-perdesi (2 foto, galeri)
- http://localhost:5173/urun/pembe-fon-perdesi (2 gerçek foto, Unicorn bağlı)
- http://localhost:5173/urun/pembe-metalize-masa-etegi
- http://localhost:5173/urun/pembe-karton-tabak-8li (2 foto)
- http://localhost:5173/urun/pembe-karton-bardak-8li (2 foto)
- http://localhost:5173/urun/pembe-renk-plastik-catal-25li
- http://localhost:5173/urun/pembe-renk-plastik-bicak-25li (2 foto)
- http://localhost:5173/urun/pembe-plastik-tabak-8li (2 foto)
- http://localhost:5173/urun/mavi-plastik-bardak-8li (2 foto)
- http://localhost:5173/urun/altin-plastik-bicak-25li (2 foto)
- http://localhost:5173/urun/pembe-kagit-pecete-16li (2 foto)
- http://localhost:5173/urun/pembe-plastik-masa-ortusu (2 foto)
- http://localhost:5173/urun/mavi-fon-perdesi
- http://localhost:5173/admin/giris
