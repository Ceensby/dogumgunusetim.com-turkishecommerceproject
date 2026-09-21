import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';
import {
  parseThemeImageFilename,
  sortOrderForCategory,
  unitLabelFor,
} from '../src/utils/parseThemeImage.js';
import { defaultAttributes } from '../src/utils/productAttributes.js';
import { slugify } from '../src/utils/slugify.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const PLACEHOLDER_PRICES = {
  'karton-tabak': 89.9,
  'karton-bardak': 79.9,
  pecete: 59.9,
  kurdan: 39.9,
  'dogum-gunu-yazisi': 99.9,
  flama: 69.9,
  'masa-ortusu': 119.9,
};

function parseArgs(argv) {
  const out = { theme: 'unicorn', src: '../dgtemalar', dryRun: false };
  for (const arg of argv.slice(2)) {
    if (arg === '--dry-run') out.dryRun = true;
    else if (arg.startsWith('--theme=')) out.theme = arg.slice(8);
    else if (arg.startsWith('--src=')) out.src = arg.slice(6);
  }
  return out;
}

function resolveSrc(src) {
  const candidates = [
    path.resolve(process.cwd(), src),
    path.resolve(__dirname, '..', src),
    path.resolve(__dirname, '../..', src.replace(/^\.\.\//, '')),
    path.resolve(__dirname, '../../dgtemalar'),
  ];
  return candidates.find((p) => fs.existsSync(p)) || candidates[0];
}

function listImageFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listImageFiles(full));
    else if (IMAGE_EXTS.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

function printTable(rows) {
  const cols = ['Orijinal dosya', 'Algılanan ürün', 'Kategori', 'Paket adedi', 'Yeni dosya adı'];
  const data = rows.map((r) => [
    r.filename,
    r.productName,
    r.categoryName,
    String(r.packSize) + (r.packSizeInferred ? ' (varsayılan)' : ''),
    r.outputName,
  ]);
  const widths = cols.map((c, i) => Math.max(c.length, ...data.map((d) => d[i].length)));
  const line = (cells) => cells.map((c, i) => c.padEnd(widths[i])).join(' | ');
  console.log(line(cols));
  console.log(widths.map((w) => '-'.repeat(w)).join('-|-'));
  data.forEach((d) => console.log(line(d)));
}

async function squareWebp(inputPath, size) {
  const inner = Math.round(size * 0.88);
  const pad = Math.round((size - inner) / 2);
  return sharp(inputPath)
    .rotate()
    .resize(inner, inner, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .extend({
      top: pad,
      bottom: size - inner - pad,
      left: pad,
      right: size - inner - pad,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .webp({ quality: 82 })
    .toBuffer();
}

async function writeSizes(bufferOrPath, destBase) {
  const dir = path.dirname(destBase);
  fs.mkdirSync(dir, { recursive: true });
  const lgPath = `${destBase}.webp`;
  const mdPath = `${destBase}-md.webp`;
  const smPath = `${destBase}-sm.webp`;

  const lgBuf = Buffer.isBuffer(bufferOrPath)
    ? await sharp(bufferOrPath).webp({ quality: 82 }).toBuffer()
    : await squareWebp(bufferOrPath, 1200);
  await sharp(lgBuf).toFile(lgPath);
  await sharp(lgBuf).resize(600, 600, { fit: 'cover' }).webp({ quality: 80 }).toFile(mdPath);
  await sharp(lgBuf).resize(200, 200, { fit: 'cover' }).webp({ quality: 78 }).toFile(smPath);
  return path.basename(lgPath);
}

function hexToRgb(hex) {
  const h = (hex || '#7C4DFF').replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

async function buildCollage(imagePaths, destDir, theme) {
  const width = 1600;
  const height = 900;
  const primary = hexToRgb(theme.primaryColor);
  const secondary = hexToRgb(theme.secondaryColor || '#FFB3D9');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="rgb(${primary.r},${primary.g},${primary.b})"/>
        <stop offset="100%" stop-color="rgb(${secondary.r},${secondary.g},${secondary.b})"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`;

  const tiles = [];
  const layout = [
    { left: 80, top: 90, size: 420 },
    { left: 430, top: 160, size: 360 },
    { left: 760, top: 80, size: 400 },
    { left: 1080, top: 140, size: 380 },
    { left: 250, top: 470, size: 340 },
    { left: 620, top: 500, size: 320 },
    { left: 980, top: 480, size: 360 },
  ];

  for (let i = 0; i < Math.min(imagePaths.length, layout.length); i += 1) {
    const { left, top, size } = layout[i];
    const buf = await sharp(imagePaths[i])
      .rotate()
      .resize(size, size, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();
    tiles.push({ input: buf, left, top });
  }

  const heroBuf = await sharp(Buffer.from(svg)).png().composite(tiles).webp({ quality: 84 }).toBuffer();
  fs.mkdirSync(destDir, { recursive: true });
  await sharp(heroBuf).toFile(path.join(destDir, 'hero.webp'));
  await sharp(heroBuf)
    .resize(800, 600, { fit: 'cover' })
    .webp({ quality: 82 })
    .toFile(path.join(destDir, 'thumb.webp'));
}

async function ensureCategory(slug, name) {
  return prisma.category.upsert({
    where: { slug },
    update: { name, isActive: true },
    create: {
      slug,
      name,
      pluralName: name === 'Kürdan' ? 'Kürdanlar' : `${name}ler`,
      unitLabel: 'paket',
      sortOrder: 11,
      isActive: true,
      description: `${name} ürünleri`,
      iconName: 'Restaurant',
    },
  });
}

async function findExistingProduct(themeId, parsed, categoryId) {
  const bySku = await prisma.product.findUnique({ where: { sku: parsed.sku } });
  if (bySku) return bySku;
  const bySlug = await prisma.product.findUnique({ where: { slug: parsed.slug } });
  if (bySlug) return bySlug;
  return prisma.product.findFirst({
    where: {
      categoryId,
      themeProducts: { some: { themeId } },
    },
  });
}

async function upsertAttributes(productId, product, themeName) {
  const attrs = defaultAttributes(
    { packSize: product.packSize, category: { slug: product.categorySlug } },
    themeName,
  );
  await prisma.productAttribute.deleteMany({ where: { productId } });
  await prisma.productAttribute.createMany({
    data: attrs.map((a) => ({ ...a, productId })),
  });
}

async function main() {
  const args = parseArgs(process.argv);
  const srcDir = resolveSrc(args.src);
  const themeSlug = slugify(args.theme);
  console.log(`[import] tema=${themeSlug} src=${srcDir} dryRun=${args.dryRun}`);

  if (!fs.existsSync(srcDir)) {
    console.error('[import] Kaynak klasör bulunamadı:', srcDir);
    process.exit(1);
  }

  const theme = await prisma.theme.findUnique({ where: { slug: themeSlug } });
  if (!theme) {
    console.error(`[import] "${themeSlug}" teması veri tabanında yok. Önce admin veya seed ile oluştur.`);
    process.exit(1);
  }

  const files = listImageFiles(srcDir);
  if (!files.length) {
    console.error('[import] Klasörde görsel yok.');
    process.exit(1);
  }

  const parsedRows = files.map((full) => {
    const filename = path.basename(full);
    return { ...parseThemeImageFilename(filename, theme), fullPath: full };
  });

  console.log('\nGörsel çözümleme tablosu:\n');
  printTable(parsedRows);
  console.log('');

  const heroFiles = parsedRows.filter((r) => r.kind === 'hero');
  const productFiles = parsedRows.filter((r) => r.kind === 'product');
  const groups = new Map();
  for (const row of productFiles) {
    if (!groups.has(row.groupKey)) groups.set(row.groupKey, []);
    groups.get(row.groupKey).push(row);
  }

  if (args.dryRun) {
    console.log(`[dry-run] ${files.length} dosya, ${groups.size} ürün, ${heroFiles.length} hero adayı. Yazma yok.`);
    parsedRows.filter((r) => r.packSizeInferred).forEach((r) => {
      console.log(`[uyarı] "${r.filename}" içinde adet bulunamadı, 1 kabul edildi.`);
    });
    return;
  }

  const root = path.resolve(__dirname, '../..');
  const productDir = path.join(root, 'client/public/images/products', themeSlug);
  const themeDir = path.join(root, 'client/public/images/themes', themeSlug);
  fs.mkdirSync(productDir, { recursive: true });
  fs.mkdirSync(themeDir, { recursive: true });

  let processedImages = 0;
  const created = [];
  const updated = [];
  const pricePlaceholders = [];
  const warnings = [];

  for (const [, rows] of groups) {
    const primary = rows[0];
    const category = await ensureCategory(primary.categorySlug, primary.categoryName);
    const existing = await findExistingProduct(theme.id, primary, category.id);
    const isNew = !existing;
    const data = {
      name: primary.productName,
      sku: existing?.sku || primary.sku,
      slug: existing?.slug || primary.slug,
      description:
        existing?.description ||
        `${primary.packSize > 1 ? `${primary.packSize}'li pakette ` : ''}${theme.name} temalı ${primary.categoryName.toLowerCase()}.`,
      themeId: existing?.themeId ?? theme.id,
      categoryId: category.id,
      packSize: primary.packSize,
      unitLabel: unitLabelFor(primary.packSize),
      isActive: true,
    };
    if (isNew) {
      data.price = PLACEHOLDER_PRICES[primary.categorySlug] ?? 49.9;
      data.stock = 100;
      pricePlaceholders.push(`${data.name} → ₺${data.price}`);
    }

    const product = existing
      ? await prisma.product.update({
          where: { id: existing.id },
          data: {
            name: data.name,
            packSize: data.packSize,
            unitLabel: data.unitLabel,
            categoryId: data.categoryId,
            isActive: true,
          },
        })
      : await prisma.product.create({ data });

    if (isNew) created.push(product.name);
    else updated.push(product.name);

    const urls = [];
    for (let i = 0; i < rows.length; i += 1) {
      const destBase = path.join(productDir, i === 0 ? product.slug : `${product.slug}-${i + 1}`);
      await writeSizes(rows[i].fullPath, destBase);
      processedImages += 1;
      urls.push(`/images/products/${themeSlug}/${path.basename(destBase)}.webp`);
    }

    await prisma.productImage.deleteMany({
      where: { productId: product.id, url: { contains: `/images/products/${themeSlug}/` } },
    });
    await prisma.productImage.createMany({
      data: urls.map((url, i) => ({
        productId: product.id,
        url,
        alt: `${product.name}, ${product.unitLabel}`,
        sortOrder: i,
        isPrimary: i === 0,
      })),
    });

    await prisma.themeProduct.upsert({
      where: { themeId_productId: { themeId: theme.id, productId: product.id } },
      update: { sortOrder: sortOrderForCategory(primary.categorySlug) },
      create: {
        themeId: theme.id,
        productId: product.id,
        sortOrder: sortOrderForCategory(primary.categorySlug),
        defaultQuantity: primary.categorySlug === 'flama' ? 0 : 1,
        isRequired: ['karton-tabak', 'karton-bardak'].includes(primary.categorySlug),
        isRecommended: ['karton-tabak', 'karton-bardak', 'dogum-gunu-yazisi'].includes(primary.categorySlug),
      },
    });

    await upsertAttributes(product.id, { ...product, categorySlug: primary.categorySlug }, theme.name);
  }

  const collageSources = productFiles.map((r) => r.fullPath);
  if (heroFiles.length) {
    const heroSrc = heroFiles[0].fullPath;
    await sharp(heroSrc)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(themeDir, 'hero.webp'));
    await sharp(heroSrc)
      .rotate()
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(themeDir, 'thumb.webp'));
    processedImages += 1;
  } else {
    warnings.push('Hero/set fotoğrafı yok — ürün görsellerinden kolaj üretildi.');
    await buildCollage(collageSources, themeDir, theme);
    processedImages += 1;
  }

  const heroMeta = await sharp(path.join(themeDir, 'hero.webp')).metadata();
  const heroAspectRatio = heroMeta.width && heroMeta.height
    ? `${heroMeta.width} / ${heroMeta.height}`
    : null;

  await prisma.theme.update({
    where: { id: theme.id },
    data: {
      heroImage: `/images/themes/${themeSlug}/hero.webp`,
      heroAspectRatio,
      thumbnail: `/images/themes/${themeSlug}/thumb.webp`,
    },
  });

  parsedRows.filter((r) => r.packSizeInferred).forEach((r) => {
    warnings.push(`"${r.filename}" içinde adet yok, 1 kabul edildi.`);
  });

  console.log('[import] özet');
  console.log(`  işlenen görsel: ${processedImages}`);
  console.log(`  yeni ürün: ${created.length ? created.join(', ') : '—'}`);
  console.log(`  güncellenen ürün: ${updated.length ? updated.join(', ') : '—'}`);
  if (pricePlaceholders.length) {
    console.log('  yer tutucu fiyat (güncelle):');
    pricePlaceholders.forEach((p) => console.log(`    - ${p}`));
  }
  warnings.forEach((w) => console.log(`  uyarı: ${w}`));
}

main()
  .catch((error) => {
    console.error('[import] hata', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
