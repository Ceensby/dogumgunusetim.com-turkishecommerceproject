# doğumgünüsetim.com

Temalı doğum günü parti seti e-ticaret sitesi. Müşteri bir tema seçer (ör. Unicorn), kişi sayısını girer, tabak / bardak / örtü / süs ürünlerinin adetini tek tek belirler ve hepsini **tek set grubu** olarak sepete ekler.

Ürünler, temalar, fiyatlar ve görseller kodda gömülü değildir; hepsi Prisma üzerinden gelir. Yeni tema eklemek için mağaza kodunu değiştirmen gerekmez — admin paneli veya import scriptleri yeterlidir.

Şu an katalogda **Unicorn** teması ve ilk **düz renk** ürünler (fon perdesi, plastik çatal) vardır. Ödeme gerçek değildir; sepet misafir oturumu (`X-Cart-Session` cookie) ile çalışır.

## Ekran listesi

### Mağaza

| Rota | Sayfa |
|---|---|
| `/` | Ana sayfa (temalar, renk daireleri) |
| `/temalar` | Tema listesi |
| `/tema/:slug` | Tema detayı ve set kurucu |
| `/urun/:slug` | Ürün detayı |
| `/kategori/:slug` | Kategori ürünleri |
| `/renkler` | Düz renk listesi |
| `/renk/:slug` | Renk detayı (kategori grupları) |
| `/arama` | Arama |
| `/sepet` | Sepet |
| `/odeme` | Ödeme (iskelet) |
| `/siparis-onay/:orderNumber` | Sipariş onay |
| `/hakkimizda` `/iletisim` `/sss` | Kurumsal |
| `/kargo-ve-teslimat` `/iade-ve-degisim` `/gizlilik` `/mesafeli-satis-sozlesmesi` | Yasal sayfalar |

### Admin

| Rota | Sayfa |
|---|---|
| `/admin/giris` | Giriş |
| `/admin` | Özet |
| `/admin/temalar` | Tema listesi / form |
| `/admin/urunler` | Ürün listesi / form |
| `/admin/kategoriler` | Kategoriler |
| `/admin/renkler` | Renkler |
| `/admin/tema-urun/:themeId` | Temaya ürün atama |
| `/admin/siparisler` | Siparişler |
| `/admin/ayarlar` | Site ayarları |

## Teknoloji yığını

| Katman | Stack |
|---|---|
| Mağaza | React 18, Vite, JSX (TypeScript yok), MUI v6, Zustand, TanStack Query, React Router, notistack |
| API | Express (ESM), Prisma 6, SQLite, JWT admin, Zod, bcrypt, multer, sharp |
| Görsel | WebP (ürün 1200 / `-md` 600 / `-sm` 200) |

Gereksinim: **Node.js 20+**.

## Kurulum

Kök dizinde:

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
- Prisma Studio: kök dizinden `npm run studio`

`npm install` hem `server` hem `client` bağımlılıklarını kurar (`postinstall`).

PostgreSQL’e geçmek için `server/prisma/schema.prisma` içinde `provider = "sqlite"` satırını `postgresql` yapın ve `DATABASE_URL` değerini güncelleyin.

### `.env.example`

Kökteki `.env.example` şablonudur; gerçek sırları repoya koymayın. Prisma ve seed `server/.env` okur, API hem `server/.env` hem kök `.env` dener.

```bash
copy .env.example server\.env
```

| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | SQLite için `file:./dev.db` (Prisma `server/prisma/` altında çalışır) |
| `PORT` | API portu (varsayılan `5000`) |
| `CLIENT_URL` | CORS / mağaza adresi (`http://localhost:5173`) |
| `NODE_ENV` | `development` veya `production` |
| `JWT_SECRET` | Admin JWT imzası — üretimde mutlaka değiştirin |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Seed ile oluşturulan ilk admin |

Varsayılan admin: http://localhost:5173/admin/giris — `admin@dogumgunusetim.com` / `Admin123!`

## Yeni tema ve düz renk ürün

Orijinal fotoğraflar `dgtemalar/` ve `Parti malzemeleri/` altında kalır (Git’e girmez). Script WebP üretir ve veritabanını günceller.

```bash
npm run import:theme -- --theme=unicorn --src=../dgtemalar --dry-run
npm run import:theme -- --theme=unicorn --src=../dgtemalar

npm run import:plain -- --src="../Parti malzemeleri/Arka Fon perde" --category=fon-perdesi --dry-run
npm run import:plain -- --src="../Parti malzemeleri/Lisanssız Çatal" --category=plastik-catal --dry-run
```

Çıktı görselleri:

- Tema ürün: `client/public/images/products/<tema-slug>/`
- Düz renk: `client/public/images/products/duz-renk/<renk-slug>/`
- Tema kapak: `client/public/images/themes/<tema-slug>/`

Admin’den tema oluşturma, ürün atama ve kupon (`PARTI10` → %10) için mevcut admin ekranlarını kullanın. Seed tekrar çalıştırılabilir (`upsert`); mevcut veriyi silmez.
