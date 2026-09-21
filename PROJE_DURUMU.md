# doğumgünüsetim.com — Proje Durumu

Son güncelleme: 21 Eylül 2026. Bu dosya, projeyi hiç görmemiş birinin kaldığı yerden devam etmesi için yazıldı.

Çalışma dizini: `C:\Users\cbekt\Masaüstü\dogumgunusetim.com`

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

Kök scriptler: `dev`, `seed`, `studio`, `migrate`, `import:theme`.

---

## 3. Klasör yapısı

```
dogumgunusetim.com/
  client/                         Vite mağaza
    public/images/
      products/                   ürün görselleri (jpg/svg yer tutucu veya unicorn/*.webp)
      products/unicorn/           import edilmiş Unicorn ürün WebP’leri
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
      utils/imageUrl.js           yalnızca /images/products/<tema>/<file>.webp için -sm/-md
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
  PROJE_DURUMU.md                 bu dosya
```

Önemli dosyalar:

| Dosya | İş |
|---|---|
| `server/src/utils/parseThemeImage.js` | Import dosya adı kuralları (iyiki doğdun → flama) |
| `server/scripts/importThemeImages.js` | sharp WebP, upsert Product/Theme, kolaj hero |
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

### Diğer

- **Category / Color** — katalog filtreleri.
- **Cart / CartItem** — `sessionId`; `setGroupId` + `setName` set grubu; `unitPriceSnapshot`.
- **Customer / Address / Order / OrderItem** — ödeme iskeleti, sipariş `pending`.
- **AdminUser** — JWT.
- **SiteSetting** — kargo eşiği, metinler, iletişim.

---

## 5. Mevcut veriler

### Kategoriler

| sort | slug | ad | unitLabel |
|---|---|---|---|
| 1 | karton-tabak | Karton Tabak | paket |
| 2 | karton-bardak | Karton Bardak | paket |
| 3 | pecete | Peçete | paket |
| 4 | kurdan | Kürdan | paket |
| 5 | dogum-gunu-yazisi | Doğum Günü Yazısı | adet |
| 6 | flama | Flama | adet |
| 7 | fon-perdesi | Fon Perdesi | adet |
| 8 | masa-ortusu | Masa Örtüsü | adet |
| 9 | plastik-catal | Plastik Çatal | paket |
| 10 | plastik-bicak | Plastik Bıçak | paket |
| 11 | balon | Balon | paket |
| 12 | mum | Mum | adet |

Tema sayfasında **aktif ürünü olmayan kategori başlığı gösterilmez**. Yazı kategorisi Unicorn’da bu yüzden yok.

### Renkler

Pembe `#FF6FA5`, Mavi, Beyaz, Altın, Lila, Mint, Kırmızı, Siyah. Ürünü olan: **Pembe**.

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
| Pembe Fon Perdesi | GEN-FON-PMB-01 | Fon Perdesi | 1 | 119 | evet | null | Pembe | evet | hayır |
| Unicorn Masa Örtüsü (120x180 cm) | UNI-MOR-01 | Masa Örtüsü | 1 | 75 | evet | Unicorn | — | evet | hayır |
| Pembe Renk Plastik Çatal | GEN-CTL-PMB-25 | Plastik Çatal | 25 | 79 | evet | null | Pembe | evet | hayır |
| Pembe Renk Plastik Bıçak | GEN-BCK-PMB-25 | Plastik Bıçak | 25 | 79 | evet | null | Pembe | evet | hayır |
| Unicorn İyi ki Doğdun Yazısı | UNI-YZI-01 | Doğum Günü Yazısı | 1 | 99.9 | **hayır** | Unicorn | — | **yok** | görsel kaydı silindi |

Fiyatlar TL, KDV dahil.

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

Script **tema odaklıdır**; düz renk ürünü (`themeId` null, `colorId`) üretmez.

---

## 7. Şimdiye kadar yapılanlar

- Tam yığın: mağaza + API + admin JWT + misafir sepet + set grubu + sipariş iskeleti
- Unicorn seed; kişi sayısına göre paket `ceil`
- `dgtemalar` import: tabak, bardak (2 foto), peçete, kürdan; yazı fotoğrafı flama ana görseli
- Ürün detay `/urun/:slug`: galeri, lightbox, özellik çipleri, set promo, ilgili ürünler, mobil buy bar
- Tema hero: gerçek banner, kırpmadan `object-fit: contain` + `heroAspectRatio`; yazı/buton beyaz kartta, desktop ~40px overlap
- Ana sayfa kartı aynı masa fotoğrafı (`thumb.webp`, `object-position: center 65%`); kartın tamamı tıklanabilir
- İyiki doğdun → flama kuralı; yazı ürünü pasif, temadan ve sepetten çıkarıldı
- Fiyat güncellemesi; masa örtüsü adı + Ölçü özelliği
- Pembe Fon Perdesi düz renk ürünü (çatal/bıçak mantığı), Unicorn setine ThemeProduct ile bağlı
- Boş kategori başlığı gizleme
- Admin: tema/ürün/kategori/renk CRUD, tema-ürün ata + sürükle sıra, sipariş listesi, ayarlar, ürün özellikleri ekle/sil

---

## 8. Eksikler / bilinen sorunlar / yapılacaklar

### Unicorn’da fotoğrafı olmayanlar

Yer tutucu (jpg URL → svg veya harf kutusu):

- Unicorn Masa Örtüsü
- Pembe Fon Perdesi
- Pembe Renk Plastik Çatal
- Pembe Renk Plastik Bıçak
- Flama 2. galeri görseli (`unicorn-flama.jpg` diskte yok, svg düşer)

### Veri / katalog

- 40 tema daha yok
- `UNI-YZI-01` ölü kayıt (pasif, görselsiz, ThemeProduct yok) — silinebilir veya ileride gerçek yazı ürünü olarak açılır
- Balon / mum kategorileri boş
- Pembe dışında renk ürünü yok

### Import / görsel

- **Düz renk import script’i yok** (aşağıdaki rehber + yapılacak)
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

## 9. Düz renk fotoğrafları — hazırlık rehberi

### Önerilen klasör

Proje kökü (import henüz bunu okumaz; hazırlık için):

```
dgrenkler/
  pembe/
    pembe-tabak-8li.jpg
    pembe-bardak-8li.jpg
    pembe-pecete-16li.jpg
    pembe-fon-perdesi.jpg
    pembe-catal-25li.jpg
    pembe-bicak-25li.jpg
  mavi/
    mavi-tabak-8li.jpg
    …
```

### Dosya adı (renk + ürün + adet)

Türkçe karakter, boşluk, `8'li` / `8 adet` / `pk10` ileride aynı normalize ile okunmalı.

```
pembe tabak 8li.jpg
pembe-karton-tabak-8-adet.webp
mavi bardak 8li.jpg
pembe fon perdesi.jpg
pembe catal 25li.jpg
pembe bicak 25li.jpg
```

### Desteklenen ürün tipleri (mevcut kategoriler)

Karton Tabak, Karton Bardak, Peçete, Kürdan, Doğum Günü Yazısı, Flama, Fon Perdesi, Masa Örtüsü, Plastik Çatal, Plastik Bıçak, Balon, Mum.

Düz renkte asıl ihtiyaç: çatal, bıçak, fon perdesi, belki düz tabak/bardak.

### Fotoğraf önerisi

- Düz/beyaz arka plan
- Ürün ortalı, tercihen kare
- En az 1200px kenar
- İyi, eşit ışık; EXIF yönü import’ta `.rotate()` ile düzelir

### Import script’i düz renk için hazır değil — yapılacaklar

`importThemeImages.js` `--theme=` bekler, ürün adı `"${theme} Karton Tabak"` üretir, `themeId` set eder.

Yeni komut örneği:

```bash
npm run import:color -- --color=pembe --src=../dgrenkler/pembe
```

Gerekli değişiklikler:

1. `parseThemeImage.js` (veya `parseColorImage.js`): ilk token renk (`pembe`, `mavi`…); kategori eşlemesine `fon`, `perde`, `catal`, `bicak` ekle; ürün adı `"Pembe Fon Perdesi"`; SKU `GEN-FON-PMB-01` kalıbı.
2. `themeId: null`, `colorId` eşleşen renk; mevcut ürünü SKU/slug ile upsert (pembe çatalı ezmeden).
3. Çıktı klasörü: `client/public/images/products/<renk-slug>/` veya mevcut düz dosya adları.
4. `ThemeProduct` **otomatik bağlama** — dikkat: pembe çatal her temaya değil, admin’de seçilen temalara bağlı. Import yalnızca ürün + görsel güncellesin; tema bağını zorla açmasın (veya `--attach-theme=unicorn` opsiyonel).
5. Hero/kolaj üretme (düz renkte tema hero yok).
6. Seed’deki `GEN-*` SKU’ları ile çakışmayı önceden map et.

O zamana kadar düz renk fotoğrafını admin ürün formundan yükle veya `client/public/images/products/<slug>.jpg` koy (ImageWithFallback jpg dener).

---

## 10. Hızlı URL’ler (dev)

- http://localhost:5173/
- http://localhost:5173/temalar
- http://localhost:5173/tema/unicorn
- http://localhost:5173/renk/pembe
- http://localhost:5173/urun/unicorn-flama
- http://localhost:5173/urun/pembe-fon-perdesi
- http://localhost:5173/admin/giris
