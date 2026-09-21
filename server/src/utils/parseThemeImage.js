import { slugify } from './slugify.js';

const YAZI_RULE = {
  slug: 'dogum-gunu-yazisi',
  name: 'Doğum Günü Yazısı',
  abbr: 'YZI',
  productName: (theme) => `${theme} İyi ki Doğdun Yazısı`,
};

const FLAMA_RULE = {
  slug: 'flama',
  name: 'Flama',
  abbr: 'FLM',
  productName: (theme) => `${theme} Flama`,
};

const CATEGORY_RULES = [
  { test: /tabak/, slug: 'karton-tabak', name: 'Karton Tabak', abbr: 'TBK', productName: (theme) => `${theme} Karton Tabak` },
  { test: /bardak/, slug: 'karton-bardak', name: 'Karton Bardak', abbr: 'BRD', productName: (theme) => `${theme} Karton Bardak` },
  { test: /kurdan|kuerdan/, slug: 'kurdan', name: 'Kürdan', abbr: 'KRD', productName: (theme) => `${theme} Kürdan` },
  { test: /pecete/, slug: 'pecete', name: 'Peçete', abbr: 'PCT', productName: (theme) => `${theme} Peçete` },
  { test: /ortu|tablecloth/, slug: 'masa-ortusu', name: 'Masa Örtüsü', abbr: 'MOR', productName: (theme) => `${theme} Masa Örtüsü` },
];

function matchCategoryRule(normalized) {
  if (/yazi/.test(normalized)) return YAZI_RULE;
  if (/flama|bayrak|banner|iyi\s*ki|iyiki|dogdun/.test(normalized)) return FLAMA_RULE;
  return CATEGORY_RULES.find((r) => r.test.test(normalized)) || null;
}

const HERO_TEST = /\b(set|toplu|hepsi|hero|kapak)\b/;

const PACK_PATTERNS = [
  /\bpk[-_]?(\d{1,2})\b/i,
  /(\d{1,2})[-_\s]*adet/i,
  /(\d{1,2})[-_\s]*pcs/i,
  /(\d{1,2})[-_\s]*['']?[-_\s]*li\b/i,
  /(\d{1,2})[-_\s]*lu\b/i,
  /\bx[-_]?(\d{1,2})\b/i,
];

export function normalizeFileKey(filename) {
  return slugify(filename.replace(/\.[^.]+$/, ''));
}

export function parsePackSize(normalized) {
  for (const re of PACK_PATTERNS) {
    const match = normalized.match(re);
    if (match) return Number(match[1]);
  }
  return null;
}

export function unitLabelFor(packSize) {
  if (!packSize || packSize <= 1) return 'adet';
  return `${packSize}'li paket`;
}

export function skuFor(themeAbbr, catAbbr, packSize) {
  const n = String(packSize || 1).padStart(2, '0');
  return `${themeAbbr}-${catAbbr}-${n}`;
}

export function productSlugFor(themeSlug, categorySlug, packSize) {
  if (packSize > 1) return slugify(`${themeSlug}-${categorySlug}-${packSize}li`);
  return slugify(`${themeSlug}-${categorySlug}`);
}

/**
 * Dosya adından ürün/kategori/adet çıkarır.
 * @param {string} filename
 * @param {{ name: string, slug: string }} theme
 */
export function parseThemeImageFilename(filename, theme) {
  const normalized = normalizeFileKey(filename);
  const isHero = HERO_TEST.test(normalized);
  const packSize = parsePackSize(normalized);
  const rule = matchCategoryRule(normalized);

  if (isHero || !rule) {
    return {
      filename,
      kind: 'hero',
      productName: 'Tema hero görseli',
      categorySlug: null,
      categoryName: '—',
      packSize: packSize || 1,
      packSizeInferred: packSize == null,
      outputName: 'hero.webp',
      normalized,
    };
  }

  const size = packSize || 1;
  const slug = productSlugFor(theme.slug, rule.slug, size);
  return {
    filename,
    kind: 'product',
    productName: rule.productName(theme.name),
    categorySlug: rule.slug,
    categoryName: rule.name,
    categoryAbbr: rule.abbr,
    packSize: size,
    packSizeInferred: packSize == null,
    slug,
    sku: skuFor(theme.slug.slice(0, 3).toUpperCase(), rule.abbr, size),
    unitLabel: unitLabelFor(size),
    outputName: `${slug}.webp`,
    groupKey: `${rule.slug}-${size}`,
    normalized,
  };
}

export const THEME_PRODUCT_SORT = [
  'karton-tabak',
  'karton-bardak',
  'pecete',
  'kurdan',
  'dogum-gunu-yazisi',
  'flama',
  'fon-perdesi',
];

export function sortOrderForCategory(slug) {
  const idx = THEME_PRODUCT_SORT.indexOf(slug);
  return idx === -1 ? 50 : idx + 1;
}
