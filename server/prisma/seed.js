import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { defaultAttributes } from '../src/utils/productAttributes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: 'karton-tabak', name: 'Karton Tabak', pluralName: 'Tabaklar', iconName: 'DinnerDining', unitLabel: 'paket', sortOrder: 1, description: 'Temalı karton tabaklar' },
  { slug: 'karton-bardak', name: 'Karton Bardak', pluralName: 'Bardaklar', iconName: 'LocalCafe', unitLabel: 'paket', sortOrder: 2, description: 'Temalı karton bardaklar' },
  { slug: 'pecete', name: 'Peçete', pluralName: 'Peçeteler', iconName: 'DryCleaning', unitLabel: 'paket', sortOrder: 3, description: 'Temalı peçeteler' },
  { slug: 'kurdan', name: 'Kürdan', pluralName: 'Kürdanlar', iconName: 'Restaurant', unitLabel: 'paket', sortOrder: 4, description: 'Temalı süs kürdanları' },
  { slug: 'dogum-gunu-yazisi', name: 'Doğum Günü Yazısı', pluralName: 'Yazılar', iconName: 'FontDownload', unitLabel: 'adet', sortOrder: 5, description: 'İyi ki doğdun yazıları' },
  { slug: 'flama', name: 'Flama', pluralName: 'Flamalar', iconName: 'Flag', unitLabel: 'adet', sortOrder: 6, description: 'Asılabilir flama süslemeleri' },
  { slug: 'fon-perdesi', name: 'Fon Perdesi', pluralName: 'Fon Perdeleri', iconName: 'Curtains', unitLabel: 'adet', sortOrder: 7, description: 'Tema fon perdeleri' },
  { slug: 'masa-ortusu', name: 'Masa Örtüsü', pluralName: 'Masa Örtüleri', iconName: 'TableRestaurant', unitLabel: 'adet', sortOrder: 8, description: 'Tek kullanımlık masa örtüleri' },
  { slug: 'plastik-catal', name: 'Plastik Çatal', pluralName: 'Çatallar', iconName: 'Restaurant', unitLabel: 'paket', sortOrder: 9, description: 'Renkli plastik çatallar' },
  { slug: 'plastik-bicak', name: 'Plastik Bıçak', pluralName: 'Bıçaklar', iconName: 'ContentCut', unitLabel: 'paket', sortOrder: 10, description: 'Renkli plastik bıçaklar' },
  { slug: 'balon', name: 'Balon', pluralName: 'Balonlar', iconName: 'BubbleChart', unitLabel: 'paket', sortOrder: 11, description: 'Lateks ve folyo balonlar' },
  { slug: 'mum', name: 'Mum', pluralName: 'Mumlar', iconName: 'Cake', unitLabel: 'adet', sortOrder: 12, description: 'Pasta mumları' },
];

const COLORS = [
  { slug: 'pembe', name: 'Pembe', hexCode: '#FF6FA5', sortOrder: 1 },
  { slug: 'mavi', name: 'Mavi', hexCode: '#4DA8FF', sortOrder: 2 },
  { slug: 'beyaz', name: 'Beyaz', hexCode: '#FFFFFF', sortOrder: 3 },
  { slug: 'altin', name: 'Altın', hexCode: '#E5B94E', sortOrder: 4 },
  { slug: 'lila', name: 'Lila', hexCode: '#C77DFF', sortOrder: 5 },
  { slug: 'mint', name: 'Mint', hexCode: '#7BE0C0', sortOrder: 6 },
  { slug: 'kirmizi', name: 'Kırmızı', hexCode: '#F0483E', sortOrder: 7 },
  { slug: 'siyah', name: 'Siyah', hexCode: '#1F1B2E', sortOrder: 8 },
];

const SETTINGS = {
  site_name: 'doğumgünüsetim',
  site_tagline: 'Partinin her şeyi tek bir sette',
  shipping_fee: '79.90',
  free_shipping_threshold: '750',
  contact_phone: '+90 555 000 00 00',
  contact_email: 'merhaba@dogumgunusetim.com',
  whatsapp: '905550000000',
  instagram: 'dogumgunusetim',
  homepage_hero_title: 'Partinin her şeyi tek bir sette',
  homepage_hero_subtitle: 'Temanı seç, adetleri sen belirle, setin kapına gelsin. 41 temaya kadar genişleyen parti dünyası.',
  about_text:
    'doğumgünüsetim, doğum günü partisi hazırlayanlar için temalı parti setleri satar. Tabak, bardak, masa örtüsü ve süslemeleri tek yerden, istediğin adetlerle bir araya getirirsin.',
  faq_json: JSON.stringify([
    {
      q: 'Kargo ne kadar sürer?',
      a: 'Stoktaki siparişler aynı gün kargoya verilir. Teslimat genellikle 1-3 iş günü sürer.',
    },
    {
      q: 'İade yapabilir miyim?',
      a: 'Açılmamış ve kullanılmamış ürünleri 14 gün içinde iade edebilirsin. Hijyen nedeniyle açılmış sofra ürünleri iade alınmaz.',
    },
    {
      q: 'Seti kendim mi oluşturuyorum?',
      a: 'Evet. Temayı seçtikten sonra her ürünün adedini sen belirlersin. 0 adet olanlar sete dahil edilmez.',
    },
  ]),
  shipping_text:
    '₺750 ve üzeri siparişlerde kargo ücretsizdir. Altındaki siparişlerde kargo ücreti site ayarlarından belirlenir. Teslimat Türkiye genelinde 1-3 iş günüdür.',
  returns_text:
    'Cayma hakkı kapsamında 14 gün içinde, kullanılmamış ve ambalajı açılmamış ürünleri iade edebilirsin. Hijyenik sofra ürünlerinde açılmış paketler iade kapsamı dışındadır.',
  privacy_text:
    'Kişisel verilerin yalnızca siparişini iletmek ve yasal yükümlülükler için işlenir. Üçüncü taraflarla pazarlama amacıyla paylaşılmaz.',
  distance_sales_text:
    'Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında düzenlenmiştir. Satıcı: dogumgunusetim.com',
};

async function upsertCategories() {
  const map = {};
  for (const cat of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    map[cat.slug] = row;
  }
  return map;
}

async function upsertColors() {
  const map = {};
  for (const color of COLORS) {
    const row = await prisma.color.upsert({
      where: { slug: color.slug },
      update: color,
      create: color,
    });
    map[color.slug] = row;
  }
  return map;
}

async function upsertSettings() {
  for (const [key, value] of Object.entries(SETTINGS)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}

async function upsertAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@dogumgunusetim.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const name = process.env.ADMIN_NAME || 'Cansu';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { name, passwordHash, role: 'admin' },
    create: { email, name, passwordHash, role: 'admin' },
  });
}

async function upsertUnicorn(categories, colors) {
  const themeData = {
    slug: 'unicorn',
    name: 'Unicorn',
    title: 'Unicorn Doğum Günü Seti',
    shortDescription: 'Pastel bulutlar, gökkuşağı ve tek boynuzlu at temalı eksiksiz parti seti.',
    description:
      'Unicorn Doğum Günü Seti, pastel pembe ve lila tonlarında masanı bir peri masalına çevirir. Karton tabak ve bardaktan masa örtüsüne, flamadan “İyi ki Doğdun” yazısına kadar partinin her parçasını kendi adetlerinle bir araya getir.',
    primaryColor: '#C77DFF',
    secondaryColor: '#FFB3D9',
    gender: 'kiz',
    ageGroup: 'cocuk',
    tags: 'unicorn,tek boynuzlu at,pony,gökkuşağı,pembe,pastel,kız çocuk',
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    heroImage: '/images/themes/unicorn/hero.webp',
    heroAspectRatio: '1920 / 596',
    thumbnail: '/images/themes/unicorn/thumb.webp',
    seoTitle: 'Unicorn Doğum Günü Seti | doğumgünüsetim',
    seoDescription: 'Unicorn temalı tabak, bardak, masa örtüsü ve süslemeleri tek sette birleştir. Adetleri sen seç.',
  };

  const theme = await prisma.theme.upsert({
    where: { slug: 'unicorn' },
    update: themeData,
    create: themeData,
  });

  const gallery = [
    { url: '/images/themes/unicorn/hero.webp', alt: 'Unicorn set masa kurulumu', sortOrder: 0, isPrimary: true },
  ];

  await prisma.themeImage.deleteMany({ where: { themeId: theme.id } });
  await prisma.themeImage.createMany({
    data: gallery.map((img) => ({ ...img, themeId: theme.id })),
  });

  const pink = colors.pembe;

  const staleFon = await prisma.product.findUnique({ where: { sku: 'UNI-FON-01' } });
  if (staleFon) {
    await prisma.product.update({
      where: { id: staleFon.id },
      data: { sku: 'GEN-FON-PMB-01', slug: 'pembe-fon-perdesi' },
    });
  }

  const products = [
    {
      sku: 'UNI-TBK-08',
      slug: 'unicorn-karton-tabak-8li',
      name: 'Unicorn Karton Tabak',
      description: '8’li pakette pastel unicorn desenli karton tabak. Pasta ve ikramlar için ideal.',
      themeId: theme.id,
      categoryId: categories['karton-tabak'].id,
      colorId: null,
      price: 89,
      packSize: 8,
      unitLabel: "8'li paket",
      stock: 150,
      defaultQuantity: 1,
      isRequired: true,
      isRecommended: true,
      sortOrder: 1,
      imageDir: 'unicorn',
      extraImages: [],
    },
    {
      sku: 'UNI-BRD-08',
      slug: 'unicorn-karton-bardak-8li',
      name: 'Unicorn Karton Bardak',
      description: '8’li pakette unicorn baskılı karton bardak. Soğuk ve ılık içecekler için uygundur.',
      themeId: theme.id,
      categoryId: categories['karton-bardak'].id,
      colorId: null,
      price: 69,
      packSize: 8,
      unitLabel: "8'li paket",
      stock: 150,
      defaultQuantity: 1,
      isRequired: true,
      isRecommended: true,
      sortOrder: 2,
      imageDir: 'unicorn',
      extraImages: ['unicorn-karton-bardak-8li-2'],
    },
    {
      sku: 'UNI-PCT-16',
      slug: 'unicorn-pecete-16li',
      name: 'Unicorn Peçete',
      description: '16’lı pakette unicorn desenli peçete. Masa ve ikram sunumu için.',
      themeId: theme.id,
      categoryId: categories.pecete.id,
      colorId: null,
      price: 75,
      packSize: 16,
      unitLabel: "16'lı paket",
      stock: 100,
      defaultQuantity: 1,
      isRequired: false,
      isRecommended: true,
      sortOrder: 3,
      imageDir: 'unicorn',
      extraImages: [],
    },
    {
      sku: 'UNI-KRD-10',
      slug: 'unicorn-kurdan-10li',
      name: 'Unicorn Kürdan',
      description: '10’lu pakette unicorn süs kürdanı. Cupcake ve atıştırmalıklar için.',
      themeId: theme.id,
      categoryId: categories.kurdan.id,
      colorId: null,
      price: 45,
      packSize: 10,
      unitLabel: "10'lu paket",
      stock: 100,
      defaultQuantity: 1,
      isRequired: false,
      isRecommended: false,
      sortOrder: 4,
      imageDir: 'unicorn',
      extraImages: [],
    },
    {
      sku: 'UNI-YZI-01',
      slug: 'unicorn-iyi-ki-dogdun-yazisi',
      name: 'Unicorn İyi ki Doğdun Yazısı',
      description: 'Asılabilir “İyi ki Doğdun” unicorn yazısı. Duvar veya masa arkası süslemesi.',
      themeId: theme.id,
      categoryId: categories['dogum-gunu-yazisi'].id,
      colorId: null,
      price: 99.9,
      packSize: 1,
      unitLabel: 'adet',
      stock: 60,
      isActive: false,
      attachToTheme: false,
      defaultQuantity: 1,
      isRequired: false,
      isRecommended: true,
      sortOrder: 5,
      imageUrls: [],
    },
    {
      sku: 'UNI-FLM-01',
      slug: 'unicorn-flama',
      name: 'Unicorn Flama',
      description: 'Pastel unicorn flamalar. Tavan veya duvar süslemesi olarak asılır.',
      themeId: theme.id,
      categoryId: categories.flama.id,
      colorId: null,
      price: 59,
      packSize: 1,
      unitLabel: 'adet',
      stock: 90,
      defaultQuantity: 0,
      isRequired: false,
      isRecommended: false,
      sortOrder: 5,
      imageUrls: [
        '/images/products/unicorn/unicorn-flama.webp',
        '/images/products/unicorn-flama.jpg',
      ],
    },
    {
      sku: 'GEN-FON-PMB-01',
      slug: 'pembe-fon-perdesi',
      name: 'Pembe Fon Perdesi',
      description: 'Pembe fon perdesi. Fotoğraf köşesi ve masa arkası için.',
      themeId: null,
      categoryId: categories['fon-perdesi'].id,
      colorId: pink.id,
      price: 119,
      packSize: 1,
      unitLabel: 'adet',
      stock: 100,
      defaultQuantity: 1,
      isRequired: false,
      isRecommended: false,
      sortOrder: 6,
      imageDir: null,
      extraImages: [],
    },
    {
      sku: 'UNI-MOR-01',
      slug: 'unicorn-masa-ortusu',
      name: 'Unicorn Masa Örtüsü (120x180 cm)',
      description: 'Tek kullanımlık unicorn desenli masa örtüsü. Masayı saniyeler içinde giydirir.',
      themeId: theme.id,
      categoryId: categories['masa-ortusu'].id,
      colorId: null,
      price: 75,
      packSize: 1,
      unitLabel: 'adet',
      stock: 80,
      defaultQuantity: 1,
      isRequired: true,
      isRecommended: true,
      sortOrder: 7,
      imageDir: null,
      extraImages: [],
      extraAttributes: [{ label: 'Ölçü', value: '120 x 180 cm', sortOrder: 5 }],
    },
    {
      sku: 'GEN-CTL-PMB-25',
      slug: 'pembe-renk-plastik-catal-25li',
      name: 'Pembe Renk Plastik Çatal',
      description: 'Düz pembe plastik çatal, 25’li paket. Birden fazla temada kullanılabilir.',
      themeId: null,
      categoryId: categories['plastik-catal'].id,
      colorId: pink.id,
      price: 79,
      packSize: 25,
      unitLabel: "25'li paket",
      stock: 200,
      defaultQuantity: 1,
      isRequired: false,
      isRecommended: false,
      sortOrder: 8,
      imageDir: null,
      extraImages: [],
    },
    {
      sku: 'GEN-BCK-PMB-25',
      slug: 'pembe-renk-plastik-bicak-25li',
      name: 'Pembe Renk Plastik Bıçak',
      description: 'Düz pembe plastik bıçak, 25’li paket. Pasta dilimlemek için pratik.',
      themeId: null,
      categoryId: categories['plastik-bicak'].id,
      colorId: pink.id,
      price: 79,
      packSize: 25,
      unitLabel: "25'li paket",
      stock: 200,
      defaultQuantity: 1,
      isRequired: false,
      isRecommended: false,
      sortOrder: 9,
      imageDir: null,
      extraImages: [],
    },
  ];

  for (const p of products) {
    const {
      defaultQuantity,
      isRequired,
      isRecommended,
      sortOrder,
      imageDir,
      extraImages,
      imageUrls,
      extraAttributes,
      attachToTheme,
      ...data
    } = p;
    const product = await prisma.product.upsert({
      where: { sku: data.sku },
      update: data,
      create: data,
    });

    const cat = Object.values(categories).find((c) => c.id === data.categoryId);
    await prisma.productAttribute.deleteMany({ where: { productId: product.id } });
    await prisma.productAttribute.createMany({
      data: [
        ...defaultAttributes(
          { packSize: data.packSize, category: { slug: cat?.slug } },
          theme.name,
        ),
        ...(extraAttributes || []),
      ].map((a) => ({ ...a, productId: product.id })),
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    const images = imageUrls
      ? imageUrls
      : (imageDir ? [product.slug, ...(extraImages || [])] : [product.slug]).map((name) =>
          imageDir ? `/images/products/${imageDir}/${name}.webp` : `/images/products/${name}.jpg`,
        );
    if (images.length) {
      await prisma.productImage.createMany({
        data: images.map((url, i) => ({
          productId: product.id,
          url,
          alt: `${product.name}, ${product.unitLabel}`,
          sortOrder: i,
          isPrimary: i === 0,
        })),
      });
    }

    if (attachToTheme === false) {
      await prisma.themeProduct.deleteMany({
        where: { themeId: theme.id, productId: product.id },
      });
    } else {
      await prisma.themeProduct.upsert({
        where: {
          themeId_productId: { themeId: theme.id, productId: product.id },
        },
        update: { sortOrder, defaultQuantity, isRequired, isRecommended },
        create: {
          themeId: theme.id,
          productId: product.id,
          sortOrder,
          defaultQuantity,
          isRequired,
          isRecommended,
        },
      });
    }
  }

  return theme;
}

async function syncCarts() {
  const yazi = await prisma.product.findUnique({ where: { sku: 'UNI-YZI-01' } });
  if (yazi) {
    const removed = await prisma.cartItem.deleteMany({ where: { productId: yazi.id } });
    if (removed.count) console.log(`[seed] sepetten yazı ürünü çıkarıldı: ${removed.count}`);
  }

  const products = await prisma.product.findMany({ select: { id: true, price: true } });
  for (const product of products) {
    await prisma.cartItem.updateMany({
      where: { productId: product.id },
      data: { unitPriceSnapshot: product.price },
    });
  }
}

async function main() {
  console.log('[seed] başlıyor');
  const categories = await upsertCategories();
  const colors = await upsertColors();
  await upsertSettings();
  await upsertAdmin();
  await upsertUnicorn(categories, colors);
  await syncCarts();
  console.log('[seed] tamamlandı — Unicorn teması, yeni kategoriler ve ürünler hazır');
}

main()
  .catch((error) => {
    console.error('[seed] hata', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
