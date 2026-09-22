import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';
import { slugify } from '../src/utils/slugify.js';
import { unitLabelFor } from '../src/utils/parseThemeImage.js';
import { plainProductAttributes } from '../src/utils/productAttributes.js';
import {
  PLAIN_CATEGORY_CONFIG,
  PLAIN_COLORS,
  PRESERVED_PLAIN_SKUS,
  CREATABLE_PLAIN_CATEGORIES,
} from '../src/utils/plainColors.js';
import {
  parsePlainImageFilename,
  parsePrefixPlainFilename,
  nearestColor,
  hexToRgb,
  skuForPlain,
  productTitleFor,
  productSlugForPlain,
  groupKeyFor,
} from '../src/utils/parsePlainImage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const TEXT_EXTS = new Set(['.txt', '.csv']);
const SKIP_DOC_EXTS = new Set(['.xlsx', '.xls', '.docx', '.doc', '.pdf']);

function parseArgs(argv) {
  const out = { src: '', category: '', dryRun: false, naming: 'default', filter: '' };
  for (const arg of argv.slice(2)) {
    if (arg === '--dry-run') out.dryRun = true;
    else if (arg.startsWith('--src=')) out.src = arg.slice(6).replace(/^["']|["']$/g, '');
    else if (arg.startsWith('--category=')) out.category = arg.slice(11);
    else if (arg.startsWith('--naming=')) out.naming = arg.slice(9);
    else if (arg.startsWith('--filter=')) out.filter = arg.slice(9);
  }
  return out;
}

function resolveSrc(src) {
  const candidates = [
    path.resolve(process.cwd(), src),
    path.resolve(__dirname, '..', src),
    path.resolve(__dirname, '../..', src),
    path.resolve(__dirname, '../..', src.replace(/^\.\.\//, '')),
  ];
  return candidates.find((p) => fs.existsSync(p)) || candidates[0];
}

function loadFileColorMap() {
  const mapPath = path.join(__dirname, 'data/plain-file-colors.json');
  if (!fs.existsSync(mapPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  } catch {
    return {};
  }
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(full));
    else files.push(full);
  }
  return files;
}

function printTable(rows, naming) {
  const prefix = naming === 'prefix';
  const cols = prefix
    ? ['Dosya', 'Renk', 'Fotoğraf sırası', 'Ürün adı', 'SKU', 'Yeni/mevcut']
    : ['Kaynak dosya', 'Kategori', 'Renk', 'Varyant/özellik', 'Paket adedi', 'Oluşacak ürün adı', 'SKU', 'Fotoğraf var mı'];
  const data = rows.map((r) => (prefix
    ? [
      r.filename,
      r.color?.name || '?',
      String(r.photoIndex || 1),
      r.productName,
      r.sku || '—',
      r.existingLabel || '?',
    ]
    : [
      r.filename,
      r.categoryName,
      r.color?.name || '?',
      r.variant || '—',
      r.packInferred ? `${r.packSize} (varsayılan)` : String(r.packSize),
      r.productName,
      r.sku || '—',
      r.hasPhoto ? 'evet' : 'hayır',
    ]));
  const widths = cols.map((c, i) => Math.max(c.length, ...data.map((d) => String(d[i]).length)));
  const line = (cells) => cells.map((c, i) => String(c).padEnd(widths[i])).join(' | ');
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

function isLightHex(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 170;
}

function placeholderSvg(hex, letter, label) {
  const bg = hex || '#888888';
  const fg = isLightHex(bg) ? '#1F1B2E' : '#ffffff';
  const safe = (label || '').replace(/[<>&]/g, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="${bg}"/>
  <circle cx="400" cy="336" r="112" fill="${fg}" opacity="0.22"/>
  <text x="400" y="376" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="96" fill="${fg}" font-weight="700">${letter}</text>
  <text x="400" y="544" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="${fg}">${safe}</text>
</svg>`;
}

async function detectColorFromImage(filePath) {
  const { data, info } = await sharp(filePath)
    .rotate()
    .resize(80, 80, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const pr = data[i];
    const pg = data[i + 1];
    const pb = data[i + 2];
    const max = Math.max(pr, pg, pb);
    const min = Math.min(pr, pg, pb);
    if (max > 245 && min > 230) continue;
    if (max < 18) {
      r += pr;
      g += pg;
      b += pb;
      n += 1;
      continue;
    }
    r += pr;
    g += pg;
    b += pb;
    n += 1;
  }
  if (!n) return null;
  return nearestColor({ r: r / n, g: g / n, b: b / n });
}

function parseTxtProducts(content, categorySlug, cfg) {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-*\d.)]+\s*/, '').trim())
    .filter((l) => l && !l.startsWith('#'));
  const rows = [];
  for (const line of lines) {
    const parsed = parsePlainImageFilename(`${line}.txt`, { categorySlug });
    parsed.hasPhoto = false;
    parsed.filename = line;
    if (!parsed.color) continue;
    parsed.productName = productTitleFor(parsed.color, categorySlug, parsed.variant);
    parsed.slug = productSlugForPlain(parsed.productName, parsed.packSize, cfg.skuStyle);
    parsed.sku = skuForPlain(cfg, parsed.color.abbr, parsed.packSize, 1);
    parsed.groupKey = groupKeyFor({
      categorySlug,
      colorSlug: parsed.color.slug,
      variant: parsed.variant,
      packSize: parsed.packSize,
    });
    parsed.colorFrom = parsed.colorFrom || 'filename';
    rows.push(parsed);
  }
  return rows;
}

async function nextSkuSeq(catAbbr, colorAbbr) {
  const prefix = `GEN-${catAbbr}-${colorAbbr}-`;
  const existing = await prisma.product.findMany({
    where: { sku: { startsWith: prefix } },
    select: { sku: true },
  });
  let max = 0;
  for (const row of existing) {
    const n = Number(row.sku.slice(prefix.length));
    if (Number.isFinite(n) && n > max) max = n;
  }
  return max + 1;
}

async function findExistingProduct(row, categoryId, colorId) {
  if (row.sku) {
    const bySku = await prisma.product.findUnique({ where: { sku: row.sku } });
    if (bySku) return bySku;
  }
  if (row.slug) {
    const bySlug = await prisma.product.findUnique({ where: { slug: row.slug } });
    if (bySlug) return bySlug;
  }
  return prisma.product.findFirst({
    where: {
      categoryId,
      colorId,
      packSize: row.packSize,
      NOT: { sku: { startsWith: 'UNI-' } },
    },
  });
}

function gallerySort(a, b) {
  const aIdx = a.photoIndex || 0;
  const bIdx = b.photoIndex || 0;
  if (aIdx && bIdx && aIdx !== bIdx) return aIdx - bIdx;
  const aNamed = a.colorFrom === 'filename' || a.colorFrom === 'prefix' ? 0 : 1;
  const bNamed = b.colorFrom === 'filename' || b.colorFrom === 'prefix' ? 0 : 1;
  if (aNamed !== bNamed) return aNamed - bNamed;
  return a.filename.localeCompare(b.filename, 'tr');
}

async function ensureColor(color) {
  return prisma.color.upsert({
    where: { slug: color.slug },
    update: { name: color.name, hexCode: color.hexCode, isActive: true },
    create: {
      slug: color.slug,
      name: color.name,
      hexCode: color.hexCode,
      sortOrder: color.sortOrder,
      isActive: true,
    },
  });
}

const CATEGORY_META = {
  'karton-tabak': { sortOrder: 1, pluralName: 'Karton Tabaklar' },
  'plastik-tabak': { sortOrder: 2, pluralName: 'Plastik Tabaklar' },
  'karton-bardak': { sortOrder: 3, pluralName: 'Karton Bardaklar' },
  'plastik-bardak': { sortOrder: 4, pluralName: 'Plastik Bardaklar' },
  pecete: { sortOrder: 5 },
  kurdan: { sortOrder: 6 },
  'dogum-gunu-yazisi': { sortOrder: 7 },
  flama: { sortOrder: 8 },
  'fon-perdesi': { sortOrder: 9 },
  'masa-ortusu': { sortOrder: 10 },
  'masa-etegi': { sortOrder: 11, pluralName: 'Masa Etekleri' },
  'plastik-catal': { sortOrder: 12 },
  'plastik-bicak': { sortOrder: 13 },
  balon: { sortOrder: 14 },
  mum: { sortOrder: 15 },
};

async function applyCategorySort() {
  for (const [s, data] of Object.entries(CATEGORY_META)) {
    await prisma.category.updateMany({ where: { slug: s }, data });
  }
}

async function ensureCategory(slug) {
  let existing = await prisma.category.findUnique({ where: { slug } });
  if (!existing) {
    const spec = CREATABLE_PLAIN_CATEGORIES[slug];
    if (!spec) return null;
    const { groupSlug, ...rest } = spec;
    const group = groupSlug
      ? await prisma.categoryGroup.findUnique({ where: { slug: groupSlug } })
      : null;
    existing = await prisma.category.create({
      data: { ...rest, groupId: group?.id ?? null, isActive: true },
    });
    console.log(`[import:plain] kategori oluşturuldu: ${spec.name}`);
  }
  await applyCategorySort();
  return prisma.category.findUnique({ where: { slug } });
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.src || !args.category) {
    console.error('Kullanım: npm run import:plain -- --src="<klasör yolu>" --category=<kategori-slug> [--naming=prefix] [--dry-run]');
    console.error('Kategoriler:', Object.keys(PLAIN_CATEGORY_CONFIG).join(', '));
    process.exit(1);
  }
  if (args.naming !== 'default' && args.naming !== 'prefix') {
    console.error('[import:plain] --naming default veya prefix olmalı');
    process.exit(1);
  }

  const cfg = PLAIN_CATEGORY_CONFIG[args.category];
  if (!cfg) {
    console.error(`[import:plain] Bilinmeyen kategori: ${args.category}`);
    process.exit(1);
  }

  const srcDir = resolveSrc(args.src);
  console.log(`[import:plain] kategori=${args.category} naming=${args.naming} src=${srcDir} dryRun=${args.dryRun}${args.filter ? ` filter=${args.filter}` : ''}`);

  if (!fs.existsSync(srcDir)) {
    console.error('[import:plain] Kaynak klasör bulunamadı:', srcDir);
    process.exit(1);
  }

  let category = await prisma.category.findUnique({ where: { slug: args.category } });
  if (args.dryRun) {
    if (!category && CREATABLE_PLAIN_CATEGORIES[args.category]) {
      category = { id: 0, ...CREATABLE_PLAIN_CATEGORIES[args.category] };
      console.log(`[import:plain] dry-run: "${category.name}" yok, yazılmadan varsayıldı.`);
    }
  } else if (!category) {
    category = await ensureCategory(args.category);
  } else {
    await applyCategorySort();
    category = await prisma.category.findUnique({ where: { slug: args.category } });
  }
  if (!category) {
    console.error(`[import:plain] "${args.category}" kategorisi veri tabanında yok. Yeni kategori açılmıyor.`);
    process.exit(1);
  }

  const fileColorMap = loadFileColorMap();
  const allFiles = listFiles(srcDir);
  let imageFiles = allFiles.filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()));
  const otherFiles = allFiles.filter((f) => !IMAGE_EXTS.has(path.extname(f).toLowerCase()));
  if (args.filter) {
    const needle = slugify(args.filter);
    imageFiles = imageFiles.filter((f) => slugify(path.basename(f)).includes(needle));
    console.log(`[import:plain] --filter=${args.filter} → ${imageFiles.length} görsel`);
  }

  const skipped = [];
  const guessed = [];
  const whiteMapped = [];
  const rows = [];
  const prefixMode = args.naming === 'prefix';
  let skippedImageCount = 0;

  for (const full of imageFiles) {
    const filename = path.basename(full);
    let parsed;
    if (prefixMode) {
      parsed = parsePrefixPlainFilename(filename, { categorySlug: args.category });
      parsed.fullPath = full;
      parsed.hasPhoto = true;
      if (!parsed.ok) {
        skippedImageCount += 1;
        skipped.push(`${filename} — ${parsed.skipReason}`);
        continue;
      }
      if (parsed.mappedFromWhite) whiteMapped.push(`${filename} → Krem`);
      if (parsed.invented) guessed.push(`${filename} → ${parsed.color.name} (yeni renk, prefix)`);
    } else {
      parsed = parsePlainImageFilename(filename, {
        categorySlug: args.category,
        fileColorMap,
      });
      parsed.fullPath = full;
      parsed.hasPhoto = true;
      parsed.photoIndex = parsed.photoIndex || 1;

      if (!parsed.color) {
        try {
          const detected = await detectColorFromImage(full);
          if (detected) {
            parsed.color = detected;
            parsed.colorFrom = 'image';
            parsed.productName = productTitleFor(detected, args.category, parsed.variant);
            parsed.slug = productSlugForPlain(parsed.productName, parsed.packSize, cfg.skuStyle);
            parsed.sku = skuForPlain(cfg, detected.abbr, parsed.packSize, 1);
            parsed.groupKey = groupKeyFor({
              categorySlug: args.category,
              colorSlug: detected.slug,
              variant: parsed.variant,
              packSize: parsed.packSize,
            });
            guessed.push(`${filename} → ${detected.name} (görselden)`);
          }
        } catch (err) {
          skipped.push(`${filename} — görsel okunamadı: ${err.message}`);
          continue;
        }
      } else if (parsed.colorFrom === 'map' || parsed.colorFrom === 'image') {
        guessed.push(`${filename} → ${parsed.color.name} (${parsed.colorFrom === 'map' ? 'görsel eşlemesi' : 'görselden'})`);
      }
    }

    if (!parsed.color) {
      skipped.push(`${filename} — renk anlaşılamadı, atlandı`);
      continue;
    }
    rows.push(parsed);
  }

  if (!prefixMode) {
    for (const full of otherFiles) {
      const ext = path.extname(full).toLowerCase();
      const filename = path.basename(full);
      if (TEXT_EXTS.has(ext)) {
        const extra = parseTxtProducts(fs.readFileSync(full, 'utf8'), args.category, cfg);
        extra.forEach((r) => {
          r.sourceNote = filename;
          r.photoIndex = r.photoIndex || 1;
          rows.push(r);
        });
        if (!extra.length) skipped.push(`${filename} — metin okundu ama ürün satırı çıkmadı`);
      } else if (SKIP_DOC_EXTS.has(ext)) {
        skipped.push(`${filename} — ${ext} okuyucu yok, atlandı`);
      } else {
        skipped.push(`${filename} — desteklenmeyen dosya türü`);
      }
    }
  } else {
    otherFiles.forEach((full) => {
      skipped.push(`${path.basename(full)} — prefix modunda görsel olmayan dosya atlandı`);
    });
  }

  const skipRate = imageFiles.length ? skippedImageCount / imageFiles.length : 0;
  const skipPct = Math.round(skipRate * 100);
  console.log(`[import:plain] kural dışı görsel: ${skippedImageCount}/${imageFiles.length} (%${skipPct})`);

  if (!rows.length) {
    console.error('[import:plain] İşlenecek ürün/görsel yok.');
    skipped.forEach((s) => console.log('  atlandı:', s));
    process.exit(1);
  }

  for (const row of rows) {
    const bySku = row.sku ? await prisma.product.findUnique({ where: { sku: row.sku } }) : null;
    const bySlug = !bySku && row.slug ? await prisma.product.findUnique({ where: { slug: row.slug } }) : null;
    row.existingLabel = (bySku || bySlug) ? 'mevcut' : 'yeni';
  }

  console.log('\nİçe aktarma tablosu:\n');
  printTable(rows, args.naming);
  console.log('');

  if (skipRate > 0.2) {
    console.error(`[import:plain] Klasörün %${skipPct}'i kurala uymuyor (eşik %20). İçe aktarma iptal.`);
    skipped.forEach((s) => console.log('  atlandı:', s));
    process.exit(2);
  }

  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row.groupKey)) groups.set(row.groupKey, []);
    groups.get(row.groupKey).push(row);
  }
  for (const list of groups.values()) {
    list.sort(gallerySort);
    const used = new Set();
    for (const row of list) {
      let idx = row.photoIndex || 1;
      while (used.has(idx)) idx += 1;
      row.photoIndex = idx;
      used.add(idx);
    }
  }

  if (args.dryRun) {
    console.log(`[dry-run] ${rows.length} kayıt, ${groups.size} ürün. Yazma yok.`);
    rows.filter((r) => r.packInferred).forEach((r) => {
      console.log(`[uyarı] "${r.filename}" paket adedi yok, ${r.packSize} kabul edildi.`);
    });
    rows.filter((r) => r.sizeInferred).forEach((r) => {
      console.log(`[uyarı] "${r.filename}" ölçü yok, ${r.size} kabul edildi.`);
    });
    guessed.forEach((g) => console.log(`[tahmin] ${g}`));
    whiteMapped.forEach((g) => console.log(`[beyaz→krem] ${g}`));
    skipped.forEach((s) => console.log(`[atlandı] ${s}`));
    return;
  }

  const root = path.resolve(__dirname, '../..');
  const created = [];
  const updated = [];
  const photosAdded = [];
  const pricePlaceholders = [];
  const createdColors = [];
  const promotedSecondary = [];
  const sizePlaceholders = [];

  for (const [, list] of groups) {
    const primary = list[0];
    const colorSpec = PLAIN_COLORS.find((c) => c.slug === primary.color.slug) || primary.color;
    const existingColor = await prisma.color.findUnique({ where: { slug: colorSpec.slug } });
    const color = await ensureColor(colorSpec);
    if (!existingColor) createdColors.push(`${color.name} ${color.hexCode}`);

    let sku = primary.sku;
    const colorAbbr = colorSpec.abbr || primary.color.abbr;
    if (cfg.skuStyle === 'seq') {
      const bySlug = await prisma.product.findUnique({ where: { slug: primary.slug } });
      const byColorPack = await prisma.product.findFirst({
        where: { categoryId: category.id, colorId: color.id, packSize: primary.packSize, name: primary.productName },
      });
      const found = bySlug || byColorPack;
      if (found) {
        sku = found.sku.includes('undefined') && colorAbbr
          ? skuForPlain(cfg, colorAbbr, primary.packSize, await nextSkuSeq(cfg.abbr, colorAbbr))
          : found.sku;
        primary.sku = sku;
      } else {
        const seq = await nextSkuSeq(cfg.abbr, colorAbbr);
        sku = skuForPlain(cfg, colorAbbr, primary.packSize, seq);
        primary.sku = sku;
      }
    }

    const existing = await findExistingProduct({ ...primary, sku }, category.id, color.id);
    const preserved = existing && PRESERVED_PLAIN_SKUS.has(existing.sku);
    const isNew = !existing;

    const packKnown = cfg.omitPackAttribute
      ? false
      : prefixMode || cfg.defaultPack === 1 || list.some((r) => !r.packInferred);
    const unitLabel = packKnown || cfg.defaultPack === 1
      ? (primary.packSize > 1 ? unitLabelFor(primary.packSize) : 'adet')
      : 'paket';

    let product;
    if (existing) {
      if (preserved) {
        product = existing;
        photosAdded.push(existing.name);
      } else {
        const updateData = {
          name: primary.productName,
          packSize: primary.packSize,
          unitLabel,
          categoryId: category.id,
          colorId: color.id,
          themeId: null,
          isActive: true,
        };
        if (sku && sku !== existing.sku) updateData.sku = sku;
        product = await prisma.product.update({
          where: { id: existing.id },
          data: updateData,
        });
        updated.push(product.name);
      }
    } else {
      product = await prisma.product.create({
        data: {
          name: primary.productName,
          sku,
          slug: primary.slug,
          description: `${primary.productName}. ${
            packKnown && primary.packSize > 1 ? `${primary.packSize}'li paket. ` : ''
          }Birden fazla temada kullanılabilir.`,
          themeId: null,
          categoryId: category.id,
          colorId: color.id,
          price: cfg.price,
          packSize: primary.packSize,
          unitLabel,
          stock: 100,
          trackStock: true,
          isActive: true,
          sortOrder: 40 + (color.sortOrder || 0),
        },
      });
      created.push(product.name);
      pricePlaceholders.push(`${product.name} → ₺${cfg.price}`);
    }
    if (primary.sizeInferred && primary.size) {
      sizePlaceholders.push(`${product.name} → ${primary.size}`);
    }

    const photoRows = list.filter((r) => r.hasPhoto && r.fullPath);
    const destDir = path.join(root, 'client/public/images/products/duz-renk', color.slug);
    const urls = [];

    if (photoRows.length) {
      const minIdx = Math.min(...photoRows.map((r) => r.photoIndex || 1));
      if (minIdx > 1) {
        promotedSecondary.push(`${product.name} (yalnızca ${minIdx}. foto vardı, ana görsel yapıldı)`);
      }
      for (const row of photoRows) {
        const rawIdx = row.photoIndex || 1;
        const idx = minIdx > 1 ? rawIdx - minIdx + 1 : rawIdx;
        const destBase = path.join(destDir, idx <= 1 ? product.slug : `${product.slug}-${idx}`);
        await writeSizes(row.fullPath, destBase);
        urls.push(`/images/products/duz-renk/${color.slug}/${path.basename(destBase)}.webp`);
      }
    } else {
      fs.mkdirSync(destDir, { recursive: true });
      const svgName = `${product.slug}.svg`;
      const svgPath = path.join(destDir, svgName);
      const letter = (color.name || '?').trim().charAt(0).toUpperCase();
      fs.writeFileSync(svgPath, placeholderSvg(color.hexCode, letter, product.name), 'utf8');
      urls.push(`/images/products/duz-renk/${color.slug}/${svgName}`);
    }

    await prisma.productImage.deleteMany({
      where: {
        productId: product.id,
        OR: [
          { url: { contains: `/images/products/duz-renk/${color.slug}/` } },
          ...(photoRows.length
            ? [{ url: { contains: `/images/products/${product.slug}` } }]
            : []),
        ],
      },
    });

    const existingImgs = await prisma.productImage.findMany({ where: { productId: product.id } });
    const existingUrls = new Set(existingImgs.map((img) => img.url));
    const toAdd = urls.filter((url) => !existingUrls.has(url));
    if (toAdd.length) {
      const start = existingImgs.length;
      await prisma.productImage.createMany({
        data: toAdd.map((url, i) => ({
          productId: product.id,
          url,
          alt: `${product.name}`,
          sortOrder: start + i,
          isPrimary: existingImgs.length === 0 && i === 0,
        })),
      });
    }

    if (!preserved) {
      await prisma.productAttribute.deleteMany({ where: { productId: product.id } });
      await prisma.productAttribute.createMany({
        data: plainProductAttributes({
          packSize: primary.packSize,
          packKnown,
          categorySlug: args.category,
          colorName: color.name,
          material: cfg.material,
          size: primary.size || cfg.defaultSize,
        }).map((a) => ({ ...a, productId: product.id })),
      });
    }
  }

  console.log('[import:plain] özet');
  console.log(`  yeni ürün: ${created.length ? created.join(', ') : '—'}`);
  console.log(`  güncellenen ürün: ${updated.length ? updated.join(', ') : '—'}`);
  console.log(`  yalnızca fotoğraf eklenen: ${photosAdded.length ? photosAdded.join(', ') : '—'}`);
  if (createdColors.length) {
    console.log('  yeni renkler:');
    createdColors.forEach((c) => console.log(`    - ${c}`));
  }
  if (pricePlaceholders.length) {
    console.log('  fiyatı kontrol et:');
    pricePlaceholders.forEach((p) => console.log(`    - ${p}`));
  }
  if (sizePlaceholders.length) {
    console.log('  ölçüyü kontrol et:');
    sizePlaceholders.forEach((p) => console.log(`    - ${p}`));
  }
  if (promotedSecondary.length) {
    console.log('  yalnızca 2+ foto vardı, ana yapıldı:');
    promotedSecondary.forEach((p) => console.log(`    - ${p}`));
  }
  guessed.forEach((g) => console.log(`  tahmin: ${g}`));
  whiteMapped.forEach((g) => console.log(`  beyaz→krem: ${g}`));
  skipped.forEach((s) => console.log(`  atlandı: ${s}`));
}

main()
  .catch((error) => {
    console.error('[import:plain] hata', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
