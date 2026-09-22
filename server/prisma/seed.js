import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { defaultAttributes, plainProductAttributes } from '../src/utils/productAttributes.js';
import { seedColorRows } from '../src/utils/plainColors.js';

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

const COLORS = seedColorRows();

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
      imageUrls: ['/images/products/pembe-fon-perdesi.svg'],
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
      imageDir: 'duz-renk/pembe',
      extraImages: ['pembe-renk-plastik-catal-25li-2'],
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
    const colorName = data.colorId
      ? Object.values(colors).find((c) => c.id === data.colorId)?.name
      : null;
    await prisma.productAttribute.deleteMany({ where: { productId: product.id } });
    await prisma.productAttribute.createMany({
      data: [
        ...(colorName
          ? plainProductAttributes({
              packSize: data.packSize,
              packKnown: true,
              categorySlug: cat?.slug,
              colorName,
            })
          : defaultAttributes(
              { packSize: data.packSize, category: { slug: cat?.slug } },
              theme.name,
            )),
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

function duzUrls(colorSlug, slug, extra = 0) {
  const names = [slug, ...Array.from({ length: extra }, (_, i) => `${slug}-${i + 2}`)];
  return names.map((name) => `/images/products/duz-renk/${colorSlug}/${name}.webp`);
}

async function upsertPlainCatalog(categories, colors) {
  const rows = [
    { sku: 'GEN-FON-ALT-01', slug: 'altin-metalik-fon-perdesi', name: 'Altın Metalik Fon Perdesi', color: 'altin', category: 'fon-perdesi', price: 119, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 1 },
    { sku: 'GEN-FON-GMS-01', slug: 'gumus-metalik-fon-perdesi', name: 'Gümüş Metalik Fon Perdesi', color: 'gumus', category: 'fon-perdesi', price: 119, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 1 },
    { sku: 'GEN-FON-KRM-01', slug: 'kirmizi-fon-perdesi', name: 'Kırmızı Fon Perdesi', color: 'kirmizi', category: 'fon-perdesi', price: 119, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 1 },
    { sku: 'GEN-FON-SYH-01', slug: 'siyah-mat-fon-perdesi', name: 'Siyah Mat Fon Perdesi', color: 'siyah', category: 'fon-perdesi', price: 119, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 1 },
    { sku: 'GEN-FON-MOR-01', slug: 'mor-fon-perdesi', name: 'Mor Fon Perdesi', color: 'mor', category: 'fon-perdesi', price: 119, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 1 },
    { sku: 'GEN-FON-YSL-01', slug: 'yesil-fon-perdesi', name: 'Yeşil Fon Perdesi', color: 'yesil', category: 'fon-perdesi', price: 119, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 1 },
    { sku: 'GEN-FON-GKK-01', slug: 'gokkusagi-fon-perdesi', name: 'Gökkuşağı Fon Perdesi', color: 'gokkusagi', category: 'fon-perdesi', price: 119, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 1 },
    { sku: 'GEN-FON-MAV-01', slug: 'mavi-fon-perdesi', name: 'Mavi Fon Perdesi', color: 'mavi', category: 'fon-perdesi', price: 119, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 1 },
    { sku: 'GEN-FON-RSG-01', slug: 'rose-gold-fon-perdesi', name: 'Rose Gold Fon Perdesi', color: 'rose-gold', category: 'fon-perdesi', price: 119, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 1 },
    { sku: 'GEN-CTL-MAV-25', slug: 'mavi-plastik-catal-25li', name: 'Mavi Plastik Çatal', color: 'mavi', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: 'paket', packKnown: false, extra: 1 },
    { sku: 'GEN-CTL-SAR-25', slug: 'sari-plastik-catal-25li', name: 'Sarı Plastik Çatal', color: 'sari', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: "25'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-CTL-SYH-25', slug: 'siyah-plastik-catal-25li', name: 'Siyah Plastik Çatal', color: 'siyah', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: "25'li paket", packKnown: true, extra: 0 },
    { sku: 'GEN-CTL-SYH-10', slug: 'siyah-plastik-catal-10li', name: 'Siyah Plastik Çatal', color: 'siyah', category: 'plastik-catal', price: 79, packSize: 10, unitLabel: "10'lu paket", packKnown: true, extra: 0 },
    { sku: 'GEN-CTL-GMS-25', slug: 'gumus-plastik-catal-25li', name: 'Gümüş Plastik Çatal', color: 'gumus', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: 'paket', packKnown: false, extra: 0 },
    { sku: 'GEN-CTL-YSL-25', slug: 'yesil-plastik-catal-25li', name: 'Yeşil Plastik Çatal', color: 'yesil', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: 'paket', packKnown: false, extra: 1 },
    { sku: 'GEN-CTL-TRN-25', slug: 'turuncu-plastik-catal-25li', name: 'Turuncu Plastik Çatal', color: 'turuncu', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: 'paket', packKnown: false, extra: 1 },
    { sku: 'GEN-CTL-LIL-25', slug: 'lila-plastik-catal-25li', name: 'Lila Plastik Çatal', color: 'lila', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: 'paket', packKnown: false, extra: 1 },
    { sku: 'GEN-CTL-KRE-25', slug: 'krem-plastik-catal-25li', name: 'Krem Plastik Çatal', color: 'krem', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: 'paket', packKnown: false, extra: 1 },
    { sku: 'GEN-CTL-GRI-25', slug: 'gri-plastik-catal-25li', name: 'Gri Plastik Çatal', color: 'gri', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: 'paket', packKnown: false, extra: 0 },
    { sku: 'GEN-CTL-KRM-25', slug: 'kirmizi-plastik-catal-25li', name: 'Kırmızı Plastik Çatal', color: 'kirmizi', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: 'paket', packKnown: false, extra: 1 },
    { sku: 'GEN-CTL-ALT-25', slug: 'altin-plastik-catal-25li', name: 'Altın Plastik Çatal', color: 'altin', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: 'paket', packKnown: false, extra: 1 },
  ];

  for (const row of rows) {
    const color = colors[row.color];
    const category = categories[row.category];
    if (!color || !category) {
      console.warn(`[seed] düz renk atlandı: ${row.sku} (renk veya kategori yok)`);
      continue;
    }
    const data = {
      sku: row.sku,
      slug: row.slug,
      name: row.name,
      description: `${row.name}. Birden fazla temada kullanılabilir.`,
      themeId: null,
      categoryId: category.id,
      colorId: color.id,
      price: row.price,
      packSize: row.packSize,
      unitLabel: row.unitLabel,
      stock: 100,
      isActive: true,
      sortOrder: 40 + (color.sortOrder || 0),
    };
    const product = await prisma.product.upsert({
      where: { sku: data.sku },
      update: data,
      create: data,
    });

    await prisma.productAttribute.deleteMany({ where: { productId: product.id } });
    await prisma.productAttribute.createMany({
      data: plainProductAttributes({
        packSize: row.packSize,
        packKnown: row.packKnown,
        categorySlug: row.category,
        colorName: color.name,
      }).map((a) => ({ ...a, productId: product.id })),
    });

    const images = duzUrls(color.slug, row.slug, row.extra);
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: images.map((url, i) => ({
        productId: product.id,
        url,
        alt: product.name,
        sortOrder: i,
        isPrimary: i === 0,
      })),
    });
  }
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
  await upsertPlainCatalog(categories, colors);
  await syncCarts();
  console.log('[seed] tamamlandı — Unicorn teması, düz renk ürünleri ve kategoriler hazır');
}

main()
  .catch((error) => {
    console.error('[seed] hata', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
