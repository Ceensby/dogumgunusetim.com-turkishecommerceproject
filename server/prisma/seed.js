import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { defaultAttributes, plainProductAttributes } from '../src/utils/productAttributes.js';
import { seedColorRows, PLAIN_CATEGORY_CONFIG } from '../src/utils/plainColors.js';
import { CATEGORY_GROUPS, CATEGORY_GROUP_BY_SLUG } from '../src/utils/categoryGroups.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: 'karton-tabak', name: 'Karton Tabak', pluralName: 'Karton Tabaklar', iconName: 'DinnerDining', unitLabel: 'paket', sortOrder: 1, description: 'Temalı karton tabaklar' },
  { slug: 'plastik-tabak', name: 'Plastik Tabak', pluralName: 'Plastik Tabaklar', iconName: 'DinnerDining', unitLabel: 'paket', sortOrder: 2, description: 'Renkli plastik tabaklar' },
  { slug: 'karton-bardak', name: 'Karton Bardak', pluralName: 'Karton Bardaklar', iconName: 'LocalCafe', unitLabel: 'paket', sortOrder: 3, description: 'Temalı karton bardaklar' },
  { slug: 'plastik-bardak', name: 'Plastik Bardak', pluralName: 'Plastik Bardaklar', iconName: 'LocalCafe', unitLabel: 'paket', sortOrder: 4, description: 'Renkli plastik bardaklar' },
  { slug: 'pecete', name: 'Peçete', pluralName: 'Peçeteler', iconName: 'DryCleaning', unitLabel: 'paket', sortOrder: 5, description: 'Temalı peçeteler' },
  { slug: 'kurdan', name: 'Kürdan', pluralName: 'Kürdanlar', iconName: 'Restaurant', unitLabel: 'paket', sortOrder: 6, description: 'Temalı süs kürdanları' },
  { slug: 'dogum-gunu-yazisi', name: 'Doğum Günü Yazısı', pluralName: 'Yazılar', iconName: 'FontDownload', unitLabel: 'adet', sortOrder: 7, description: 'İyi ki doğdun yazıları' },
  { slug: 'flama', name: 'Flama', pluralName: 'Flamalar', iconName: 'Flag', unitLabel: 'adet', sortOrder: 8, description: 'Asılabilir flama süslemeleri' },
  { slug: 'fon-perdesi', name: 'Fon Perdesi', pluralName: 'Fon Perdeleri', iconName: 'Curtains', unitLabel: 'adet', sortOrder: 9, description: 'Tema fon perdeleri' },
  { slug: 'masa-ortusu', name: 'Masa Örtüsü', pluralName: 'Masa Örtüleri', iconName: 'TableRestaurant', unitLabel: 'adet', sortOrder: 10, description: 'Tek kullanımlık masa örtüleri' },
  { slug: 'masa-etegi', name: 'Masa Eteği', pluralName: 'Masa Etekleri', iconName: 'ViewWeek', unitLabel: 'adet', sortOrder: 11, description: 'Metalize masa etekleri' },
  { slug: 'plastik-catal', name: 'Plastik Çatal', pluralName: 'Çatallar', iconName: 'Restaurant', unitLabel: 'paket', sortOrder: 12, description: 'Renkli plastik çatallar' },
  { slug: 'plastik-bicak', name: 'Plastik Bıçak', pluralName: 'Bıçaklar', iconName: 'ContentCut', unitLabel: 'paket', sortOrder: 13, description: 'Renkli plastik bıçaklar' },
  { slug: 'balon', name: 'Balon', pluralName: 'Balonlar', iconName: 'BubbleChart', unitLabel: 'paket', sortOrder: 14, description: 'Lateks ve folyo balonlar' },
  { slug: 'mum', name: 'Mum', pluralName: 'Mumlar', iconName: 'Cake', unitLabel: 'adet', sortOrder: 15, description: 'Pasta mumları' },
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

async function upsertCategoryGroups() {
  const map = {};
  for (const group of CATEGORY_GROUPS) {
    const row = await prisma.categoryGroup.upsert({
      where: { slug: group.slug },
      update: group,
      create: { ...group, isActive: true },
    });
    map[group.slug] = row;
  }
  return map;
}

async function upsertCategories(groups) {
  const map = {};
  for (const cat of CATEGORIES) {
    const groupSlug = CATEGORY_GROUP_BY_SLUG[cat.slug];
    const data = { ...cat, groupId: groupSlug ? groups[groupSlug]?.id ?? null : null };
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: data,
      create: data,
    });
    map[cat.slug] = row;
  }
  return map;
}

async function migrateBeyazToKrem() {
  const white = await prisma.color.findUnique({ where: { slug: 'beyaz' } });
  const cream = await prisma.color.findUnique({ where: { slug: 'krem' } });
  if (white && cream && white.id !== cream.id) {
    const moved = await prisma.product.updateMany({
      where: { colorId: cream.id },
      data: { colorId: white.id },
    });
    await prisma.color.delete({ where: { id: cream.id } });
    console.log(`[seed] Krem ürünleri Beyaz kaydına taşındı (${moved.count}), eski krem satırı silindi`);
  }
  if (white && (white.slug !== 'krem' || white.name !== 'Krem')) {
    await prisma.color.update({
      where: { id: white.id },
      data: { name: 'Krem', slug: 'krem', hexCode: '#F3E9D2', sortOrder: 3, isActive: true },
    });
    console.log('[seed] Beyaz rengi Krem olarak güncellendi (slug krem, #F3E9D2)');
  }
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

async function deleteProductBySku(sku) {
  const product = await prisma.product.findUnique({ where: { sku } });
  if (!product) return;
  await prisma.cartItem.deleteMany({ where: { productId: product.id } });
  await prisma.themeProduct.deleteMany({ where: { productId: product.id } });
  await prisma.product.delete({ where: { id: product.id } });
  console.log(`[seed] ürün silindi: ${sku}`);
}

async function migrateLegacyColors() {
  await deleteProductBySku('GEN-CTL-SYH-10');
  await deleteProductBySku('GEN-CTL-GRI-25');
  await deleteProductBySku('GEN-CTL-LIL-25');
  for (const slug of ['lila', 'gri', 'mint']) {
    const color = await prisma.color.findUnique({ where: { slug } });
    if (!color) continue;
    const leftover = await prisma.product.count({ where: { colorId: color.id } });
    if (leftover === 0) {
      await prisma.color.delete({ where: { id: color.id } });
      console.log(`[seed] renk silindi: ${slug}`);
    } else if (slug === 'mint') {
      await prisma.color.update({ where: { id: color.id }, data: { isActive: false } });
      console.log(`[seed] mint pasif (${leftover} ürün)`);
    }
  }
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
      imageDir: 'duz-renk/pembe',
      extraImages: ['pembe-fon-perdesi-2'],
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
      imageDir: 'duz-renk/pembe',
      extraImages: ['pembe-renk-plastik-bicak-25li-2'],
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

function duzUrls(colorSlug, slug, extra = 0, extraUrls = []) {
  const names = [slug, ...Array.from({ length: extra }, (_, i) => `${slug}-${i + 2}`)];
  return [
    ...names.map((name) => `/images/products/duz-renk/${colorSlug}/${name}.webp`),
    ...extraUrls,
  ];
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
    { sku: 'GEN-CTL-SYH-25', slug: 'siyah-plastik-catal-25li', name: 'Siyah Plastik Çatal', color: 'siyah', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: "25'li paket", packKnown: true, extra: 0, extraUrls: ['/images/products/duz-renk/siyah/siyah-plastik-catal-10li.webp'] },
    { sku: 'GEN-CTL-GMS-25', slug: 'gumus-plastik-catal-25li', name: 'Gümüş Plastik Çatal', color: 'gumus', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: 'paket', packKnown: false, extra: 0, extraUrls: ['/images/products/duz-renk/gri/gri-plastik-catal-25li.webp'] },
    { sku: 'GEN-CTL-YSL-25', slug: 'yesil-plastik-catal-25li', name: 'Yeşil Plastik Çatal', color: 'yesil', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: 'paket', packKnown: false, extra: 1 },
    { sku: 'GEN-CTL-TRN-25', slug: 'turuncu-plastik-catal-25li', name: 'Turuncu Plastik Çatal', color: 'turuncu', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: 'paket', packKnown: false, extra: 1 },
    { sku: 'GEN-CTL-MOR-25', slug: 'mor-plastik-catal-25li', name: 'Mor Plastik Çatal', color: 'mor', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: 'paket', packKnown: false, extra: 1, imageDir: 'lila', imageSlug: 'lila-plastik-catal-25li' },
    { sku: 'GEN-CTL-KRE-25', slug: 'krem-plastik-catal-25li', name: 'Krem Plastik Çatal', color: 'krem', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: 'paket', packKnown: false, extra: 1 },
    { sku: 'GEN-CTL-KRM-25', slug: 'kirmizi-plastik-catal-25li', name: 'Kırmızı Plastik Çatal', color: 'kirmizi', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: 'paket', packKnown: false, extra: 1 },
    { sku: 'GEN-CTL-ALT-25', slug: 'altin-plastik-catal-25li', name: 'Altın Plastik Çatal', color: 'altin', category: 'plastik-catal', price: 79, packSize: 25, unitLabel: 'paket', packKnown: false, extra: 1 },
    { sku: 'GEN-BCK-ALT-25', slug: 'altin-plastik-bicak-25li', name: 'Altın Plastik Bıçak', color: 'altin', category: 'plastik-bicak', price: 79, packSize: 25, unitLabel: "25'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-BCK-GMS-25', slug: 'gumus-plastik-bicak-25li', name: 'Gümüş Plastik Bıçak', color: 'gumus', category: 'plastik-bicak', price: 79, packSize: 25, unitLabel: "25'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-BCK-KRM-25', slug: 'kirmizi-plastik-bicak-25li', name: 'Kırmızı Plastik Bıçak', color: 'kirmizi', category: 'plastik-bicak', price: 79, packSize: 25, unitLabel: "25'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-BCK-KRE-25', slug: 'krem-plastik-bicak-25li', name: 'Krem Plastik Bıçak', color: 'krem', category: 'plastik-bicak', price: 79, packSize: 25, unitLabel: "25'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-BCK-MAV-25', slug: 'mavi-plastik-bicak-25li', name: 'Mavi Plastik Bıçak', color: 'mavi', category: 'plastik-bicak', price: 79, packSize: 25, unitLabel: "25'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-BCK-MOR-25', slug: 'mor-plastik-bicak-25li', name: 'Mor Plastik Bıçak', color: 'mor', category: 'plastik-bicak', price: 79, packSize: 25, unitLabel: "25'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-BCK-SAR-25', slug: 'sari-plastik-bicak-25li', name: 'Sarı Plastik Bıçak', color: 'sari', category: 'plastik-bicak', price: 79, packSize: 25, unitLabel: "25'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-BCK-SYH-25', slug: 'siyah-plastik-bicak-25li', name: 'Siyah Plastik Bıçak', color: 'siyah', category: 'plastik-bicak', price: 79, packSize: 25, unitLabel: "25'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-BCK-TRN-25', slug: 'turuncu-plastik-bicak-25li', name: 'Turuncu Plastik Bıçak', color: 'turuncu', category: 'plastik-bicak', price: 79, packSize: 25, unitLabel: "25'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-BCK-YSL-25', slug: 'yesil-plastik-bicak-25li', name: 'Yeşil Plastik Bıçak', color: 'yesil', category: 'plastik-bicak', price: 79, packSize: 25, unitLabel: "25'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-TBK-ALT-08', slug: 'altin-plastik-tabak-8li', name: 'Altın Plastik Tabak', color: 'altin', category: 'plastik-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 0 },
    { sku: 'GEN-TBK-GMS-08', slug: 'gumus-plastik-tabak-8li', name: 'Gümüş Plastik Tabak', color: 'gumus', category: 'plastik-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 0 },
    { sku: 'GEN-TBK-KRM-08', slug: 'kirmizi-plastik-tabak-8li', name: 'Kırmızı Plastik Tabak', color: 'kirmizi', category: 'plastik-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-TBK-KRE-08', slug: 'krem-plastik-tabak-8li', name: 'Krem Plastik Tabak', color: 'krem', category: 'plastik-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 0 },
    { sku: 'GEN-TBK-MAV-08', slug: 'mavi-plastik-tabak-8li', name: 'Mavi Plastik Tabak', color: 'mavi', category: 'plastik-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-TBK-PMB-08', slug: 'pembe-plastik-tabak-8li', name: 'Pembe Plastik Tabak', color: 'pembe', category: 'plastik-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-TBK-SAR-08', slug: 'sari-plastik-tabak-8li', name: 'Sarı Plastik Tabak', color: 'sari', category: 'plastik-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-TBK-SYH-08', slug: 'siyah-plastik-tabak-8li', name: 'Siyah Plastik Tabak', color: 'siyah', category: 'plastik-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-TBK-TRN-08', slug: 'turuncu-plastik-tabak-8li', name: 'Turuncu Plastik Tabak', color: 'turuncu', category: 'plastik-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-TBK-YSL-08', slug: 'yesil-plastik-tabak-8li', name: 'Yeşil Plastik Tabak', color: 'yesil', category: 'plastik-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-BRD-ALT-08', slug: 'altin-plastik-bardak-8li', name: 'Altın Plastik Bardak', color: 'altin', category: 'plastik-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 0 },
    { sku: 'GEN-BRD-GMS-08', slug: 'gumus-plastik-bardak-8li', name: 'Gümüş Plastik Bardak', color: 'gumus', category: 'plastik-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 0 },
    { sku: 'GEN-BRD-KRM-08', slug: 'kirmizi-plastik-bardak-8li', name: 'Kırmızı Plastik Bardak', color: 'kirmizi', category: 'plastik-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-BRD-KRE-08', slug: 'krem-plastik-bardak-8li', name: 'Krem Plastik Bardak', color: 'krem', category: 'plastik-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-BRD-MAV-08', slug: 'mavi-plastik-bardak-8li', name: 'Mavi Plastik Bardak', color: 'mavi', category: 'plastik-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-BRD-PMB-08', slug: 'pembe-plastik-bardak-8li', name: 'Pembe Plastik Bardak', color: 'pembe', category: 'plastik-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-BRD-SAR-08', slug: 'sari-plastik-bardak-8li', name: 'Sarı Plastik Bardak', color: 'sari', category: 'plastik-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-BRD-SYH-08', slug: 'siyah-plastik-bardak-8li', name: 'Siyah Plastik Bardak', color: 'siyah', category: 'plastik-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-BRD-TRN-08', slug: 'turuncu-plastik-bardak-8li', name: 'Turuncu Plastik Bardak', color: 'turuncu', category: 'plastik-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-BRD-YSL-08', slug: 'yesil-plastik-bardak-8li', name: 'Yeşil Plastik Bardak', color: 'yesil', category: 'plastik-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-PCT-ALT-16', slug: 'altin-kagit-pecete-16li', name: 'Altın Kağıt Peçete', color: 'altin', category: 'pecete', price: 75, packSize: 16, unitLabel: "16'lı paket", packKnown: true, extra: 1 },
    { sku: 'GEN-PCT-GMS-16', slug: 'gumus-kagit-pecete-16li', name: 'Gümüş Kağıt Peçete', color: 'gumus', category: 'pecete', price: 75, packSize: 16, unitLabel: "16'lı paket", packKnown: true, extra: 0 },
    { sku: 'GEN-PCT-KRM-16', slug: 'kirmizi-kagit-pecete-16li', name: 'Kırmızı Kağıt Peçete', color: 'kirmizi', category: 'pecete', price: 75, packSize: 16, unitLabel: "16'lı paket", packKnown: true, extra: 1 },
    { sku: 'GEN-PCT-KRE-16', slug: 'krem-kagit-pecete-16li', name: 'Krem Kağıt Peçete', color: 'krem', category: 'pecete', price: 75, packSize: 16, unitLabel: "16'lı paket", packKnown: true, extra: 0 },
    { sku: 'GEN-PCT-MAV-16', slug: 'mavi-kagit-pecete-16li', name: 'Mavi Kağıt Peçete', color: 'mavi', category: 'pecete', price: 75, packSize: 16, unitLabel: "16'lı paket", packKnown: true, extra: 1 },
    { sku: 'GEN-PCT-PMB-16', slug: 'pembe-kagit-pecete-16li', name: 'Pembe Kağıt Peçete', color: 'pembe', category: 'pecete', price: 75, packSize: 16, unitLabel: "16'lı paket", packKnown: true, extra: 1 },
    { sku: 'GEN-PCT-SAR-16', slug: 'sari-kagit-pecete-16li', name: 'Sarı Kağıt Peçete', color: 'sari', category: 'pecete', price: 75, packSize: 16, unitLabel: "16'lı paket", packKnown: true, extra: 1 },
    { sku: 'GEN-PCT-SYH-16', slug: 'siyah-kagit-pecete-16li', name: 'Siyah Kağıt Peçete', color: 'siyah', category: 'pecete', price: 75, packSize: 16, unitLabel: "16'lı paket", packKnown: true, extra: 1 },
    { sku: 'GEN-PCT-TRN-16', slug: 'turuncu-kagit-pecete-16li', name: 'Turuncu Kağıt Peçete', color: 'turuncu', category: 'pecete', price: 75, packSize: 16, unitLabel: "16'lı paket", packKnown: true, extra: 0 },
    { sku: 'GEN-PCT-YSL-16', slug: 'yesil-kagit-pecete-16li', name: 'Yeşil Kağıt Peçete', color: 'yesil', category: 'pecete', price: 75, packSize: 16, unitLabel: "16'lı paket", packKnown: true, extra: 0 },
    { sku: 'GEN-MOR-ALT-01', slug: 'altin-plastik-masa-ortusu', name: 'Altın Plastik Masa Örtüsü', color: 'altin', category: 'masa-ortusu', price: 75, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 1, size: '120 x 180 cm' },
    { sku: 'GEN-MOR-GMS-01', slug: 'gumus-plastik-masa-ortusu', name: 'Gümüş Plastik Masa Örtüsü', color: 'gumus', category: 'masa-ortusu', price: 75, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 1, size: '120 x 180 cm' },
    { sku: 'GEN-MOR-KRE-01', slug: 'krem-plastik-masa-ortusu', name: 'Krem Plastik Masa Örtüsü', color: 'krem', category: 'masa-ortusu', price: 75, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 0, size: '120 x 180 cm' },
    { sku: 'GEN-MOR-KRM-01', slug: 'kirmizi-plastik-masa-ortusu', name: 'Kırmızı Plastik Masa Örtüsü', color: 'kirmizi', category: 'masa-ortusu', price: 75, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 0, size: '120 x 180 cm' },
    { sku: 'GEN-MOR-MAV-01', slug: 'mavi-plastik-masa-ortusu', name: 'Mavi Plastik Masa Örtüsü', color: 'mavi', category: 'masa-ortusu', price: 75, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 1, size: '120 x 180 cm' },
    { sku: 'GEN-MOR-MOR-01', slug: 'mor-plastik-masa-ortusu', name: 'Mor Plastik Masa Örtüsü', color: 'mor', category: 'masa-ortusu', price: 75, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 0, size: '120 x 180 cm' },
    { sku: 'GEN-MOR-PMB-01', slug: 'pembe-plastik-masa-ortusu', name: 'Pembe Plastik Masa Örtüsü', color: 'pembe', category: 'masa-ortusu', price: 75, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 1, size: '120 x 180 cm' },
    { sku: 'GEN-MOR-SAR-01', slug: 'sari-plastik-masa-ortusu', name: 'Sarı Plastik Masa Örtüsü', color: 'sari', category: 'masa-ortusu', price: 75, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 0, size: '120 x 180 cm' },
    { sku: 'GEN-MOR-SYH-01', slug: 'siyah-plastik-masa-ortusu', name: 'Siyah Plastik Masa Örtüsü', color: 'siyah', category: 'masa-ortusu', price: 75, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 0, size: '120 x 180 cm' },
    { sku: 'GEN-MOR-TRN-01', slug: 'turuncu-plastik-masa-ortusu', name: 'Turuncu Plastik Masa Örtüsü', color: 'turuncu', category: 'masa-ortusu', price: 75, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 0, size: '120 x 180 cm' },
    { sku: 'GEN-MOR-YSL-01', slug: 'yesil-plastik-masa-ortusu', name: 'Yeşil Plastik Masa Örtüsü', color: 'yesil', category: 'masa-ortusu', price: 75, packSize: 1, unitLabel: 'adet', packKnown: true, extra: 0, size: '120 x 180 cm' },
    { sku: 'GEN-MET-ALT-01', slug: 'altin-metalize-masa-etegi', name: 'Altın Metalize Masa Eteği', color: 'altin', category: 'masa-etegi', price: 99, packSize: 1, unitLabel: 'adet', packKnown: false, extra: 0 },
    { sku: 'GEN-MET-GMS-01', slug: 'gumus-metalize-masa-etegi', name: 'Gümüş Metalize Masa Eteği', color: 'gumus', category: 'masa-etegi', price: 99, packSize: 1, unitLabel: 'adet', packKnown: false, extra: 0 },
    { sku: 'GEN-MET-KRM-01', slug: 'kirmizi-metalize-masa-etegi', name: 'Kırmızı Metalize Masa Eteği', color: 'kirmizi', category: 'masa-etegi', price: 99, packSize: 1, unitLabel: 'adet', packKnown: false, extra: 0 },
    { sku: 'GEN-MET-MAV-01', slug: 'mavi-metalize-masa-etegi', name: 'Mavi Metalize Masa Eteği', color: 'mavi', category: 'masa-etegi', price: 99, packSize: 1, unitLabel: 'adet', packKnown: false, extra: 0 },
    { sku: 'GEN-MET-MOR-01', slug: 'mor-metalize-masa-etegi', name: 'Mor Metalize Masa Eteği', color: 'mor', category: 'masa-etegi', price: 99, packSize: 1, unitLabel: 'adet', packKnown: false, extra: 0 },
    { sku: 'GEN-MET-PMB-01', slug: 'pembe-metalize-masa-etegi', name: 'Pembe Metalize Masa Eteği', color: 'pembe', category: 'masa-etegi', price: 99, packSize: 1, unitLabel: 'adet', packKnown: false, extra: 0 },
    { sku: 'GEN-MET-RSG-01', slug: 'rose-gold-metalize-masa-etegi', name: 'Rose Gold Metalize Masa Eteği', color: 'rose-gold', category: 'masa-etegi', price: 99, packSize: 1, unitLabel: 'adet', packKnown: false, extra: 0 },
    { sku: 'GEN-MET-SYH-01', slug: 'siyah-metalize-masa-etegi', name: 'Siyah Metalize Masa Eteği', color: 'siyah', category: 'masa-etegi', price: 99, packSize: 1, unitLabel: 'adet', packKnown: false, extra: 0 },
    { sku: 'GEN-MET-YSL-01', slug: 'yesil-metalize-masa-etegi', name: 'Yeşil Metalize Masa Eteği', color: 'yesil', category: 'masa-etegi', price: 99, packSize: 1, unitLabel: 'adet', packKnown: false, extra: 0 },
    { sku: 'GEN-KTB-ALT-08', slug: 'altin-karton-tabak-8li', name: 'Altın Karton Tabak', color: 'altin', category: 'karton-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-KTB-GMS-08', slug: 'gumus-karton-tabak-8li', name: 'Gümüş Karton Tabak', color: 'gumus', category: 'karton-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-KTB-KRM-08', slug: 'kirmizi-karton-tabak-8li', name: 'Kırmızı Karton Tabak', color: 'kirmizi', category: 'karton-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-KTB-MAV-08', slug: 'mavi-karton-tabak-8li', name: 'Mavi Karton Tabak', color: 'mavi', category: 'karton-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-KTB-MOR-08', slug: 'mor-karton-tabak-8li', name: 'Mor Karton Tabak', color: 'mor', category: 'karton-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 0 },
    { sku: 'GEN-KTB-PMB-08', slug: 'pembe-karton-tabak-8li', name: 'Pembe Karton Tabak', color: 'pembe', category: 'karton-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-KTB-SAR-08', slug: 'sari-karton-tabak-8li', name: 'Sarı Karton Tabak', color: 'sari', category: 'karton-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-KTB-SYH-08', slug: 'siyah-karton-tabak-8li', name: 'Siyah Karton Tabak', color: 'siyah', category: 'karton-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-KTB-TRN-08', slug: 'turuncu-karton-tabak-8li', name: 'Turuncu Karton Tabak', color: 'turuncu', category: 'karton-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-KTB-YSL-08', slug: 'yesil-karton-tabak-8li', name: 'Yeşil Karton Tabak', color: 'yesil', category: 'karton-tabak', price: 89, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-KBR-ALT-08', slug: 'altin-karton-bardak-8li', name: 'Altın Karton Bardak', color: 'altin', category: 'karton-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-KBR-GMS-08', slug: 'gumus-karton-bardak-8li', name: 'Gümüş Karton Bardak', color: 'gumus', category: 'karton-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-KBR-KRM-08', slug: 'kirmizi-karton-bardak-8li', name: 'Kırmızı Karton Bardak', color: 'kirmizi', category: 'karton-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-KBR-MAV-08', slug: 'mavi-karton-bardak-8li', name: 'Mavi Karton Bardak', color: 'mavi', category: 'karton-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-KBR-MOR-08', slug: 'mor-karton-bardak-8li', name: 'Mor Karton Bardak', color: 'mor', category: 'karton-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-KBR-PMB-08', slug: 'pembe-karton-bardak-8li', name: 'Pembe Karton Bardak', color: 'pembe', category: 'karton-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-KBR-SAR-08', slug: 'sari-karton-bardak-8li', name: 'Sarı Karton Bardak', color: 'sari', category: 'karton-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-KBR-SYH-08', slug: 'siyah-karton-bardak-8li', name: 'Siyah Karton Bardak', color: 'siyah', category: 'karton-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-KBR-TRN-08', slug: 'turuncu-karton-bardak-8li', name: 'Turuncu Karton Bardak', color: 'turuncu', category: 'karton-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
    { sku: 'GEN-KBR-YSL-08', slug: 'yesil-karton-bardak-8li', name: 'Yeşil Karton Bardak', color: 'yesil', category: 'karton-bardak', price: 69, packSize: 8, unitLabel: "8'li paket", packKnown: true, extra: 1 },
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
        material: PLAIN_CATEGORY_CONFIG[row.category]?.material,
        size: row.size,
      }).map((a) => ({ ...a, productId: product.id })),
    });

    const images = duzUrls(row.imageDir || color.slug, row.imageSlug || row.slug, row.extra, row.extraUrls || []);
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
  const groups = await upsertCategoryGroups();
  const categories = await upsertCategories(groups);
  await migrateBeyazToKrem();
  const colors = await upsertColors();
  await migrateLegacyColors();
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
