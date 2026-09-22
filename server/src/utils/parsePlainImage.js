import { slugify } from './slugify.js';
import { parsePackSize, unitLabelFor } from './parseThemeImage.js';
import { PLAIN_COLORS, PLAIN_CATEGORY_CONFIG } from './plainColors.js';

const VARIANT_RULES = [
  { slug: 'metalik', test: /metalik|metallic|folyo|foil/ },
  { slug: 'mat', test: /\bmat\b|matte/ },
];

function hexToRgb(hex) {
  const h = (hex || '#888888').replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function colorDistance(a, b) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

/** Uzun alias'lar önce (rose-gold, gökkuşağı). */
function aliasPatterns() {
  const rows = [];
  for (const color of PLAIN_COLORS) {
    for (const alias of color.aliases) {
      rows.push({
        color,
        alias,
        slug: slugify(alias),
        len: slugify(alias).length,
      });
    }
  }
  return rows.sort((a, b) => b.len - a.len);
}

const ALIAS_PATTERNS = aliasPatterns();

export function findColorInText(text) {
  const normalized = slugify(text || '');
  if (!normalized) return null;
  const padded = `-${normalized}-`;
  for (const row of ALIAS_PATTERNS) {
    if (padded.includes(`-${row.slug}-`)) return row.color;
  }
  return null;
}

export function detectVariant(normalized, colorSlug, categorySlug) {
  if (categorySlug !== 'fon-perdesi') return null;
  if (colorSlug === 'altin' && /gold|metalik|metallic/.test(normalized)) return 'metalik';
  if (colorSlug === 'gumus' && /gumus|silver|metalik|metallic/.test(normalized)) return 'metalik';
  for (const rule of VARIANT_RULES) {
    if (rule.test.test(normalized)) return rule.slug;
  }
  return null;
}

export function productTitleFor(color, categorySlug, variant) {
  const cfg = PLAIN_CATEGORY_CONFIG[categorySlug];
  const catName = cfg?.name || categorySlug;
  if (categorySlug === 'fon-perdesi') {
    if (variant === 'metalik') return `${color.name} Metalik Fon Perdesi`;
    if (variant === 'mat') return `${color.name} Mat Fon Perdesi`;
    return `${color.name} Fon Perdesi`;
  }
  if (categorySlug === 'plastik-catal') return `${color.name} Plastik Çatal`;
  if (categorySlug === 'plastik-bicak') return `${color.name} Plastik Bıçak`;
  return `${color.name} ${catName}`;
}

export function productSlugForPlain(title, packSize, skuStyle) {
  if (skuStyle === 'pack' && packSize > 1) return slugify(`${title}-${packSize}li`);
  return slugify(title);
}

export function skuForPlain(cfg, colorAbbr, packSize, seq = 1) {
  if (cfg.skuStyle === 'seq') {
    return `GEN-${cfg.abbr}-${colorAbbr}-${String(seq).padStart(2, '0')}`;
  }
  return `GEN-${cfg.abbr}-${colorAbbr}-${String(packSize).padStart(2, '0')}`;
}

export function groupKeyFor({ categorySlug, colorSlug, variant, packSize }) {
  return `${categorySlug}::${colorSlug}::${variant || '-'}::${packSize}`;
}

export function lookupMappedColor(filename, map = {}) {
  if (!map || !filename) return null;
  if (map[filename]) return colorByKey(map[filename]);
  const want = slugify(filename);
  const hit = Object.keys(map).find((k) => slugify(k) === want);
  return hit ? colorByKey(map[hit]) : null;
}

function colorByKey(key) {
  const slug = slugify(key);
  return PLAIN_COLORS.find((c) => c.slug === slug) || findColorInText(key);
}

export function nearestColor(rgb, { maxDistance = 140 } = {}) {
  let best = null;
  let bestD = Infinity;
  for (const color of PLAIN_COLORS) {
    if (color.slug === 'gokkusagi') continue;
    const d = colorDistance(rgb, hexToRgb(color.hexCode));
    if (d < bestD) {
      bestD = d;
      best = color;
    }
  }
  if (!best || bestD > maxDistance) return null;
  return best;
}

/**
 * @param {string} filename
 * @param {{ categorySlug: string, fileColorMap?: Record<string, string> }} opts
 */
export function parsePlainImageFilename(filename, opts) {
  const categorySlug = opts.categorySlug;
  const cfg = PLAIN_CATEGORY_CONFIG[categorySlug];
  const normalized = slugify(filename.replace(/\.[^.]+$/, ''));
  const packParsed = parsePackSize(normalized);
  const packInferred = packParsed == null;
  const packSize = packParsed ?? cfg?.defaultPack ?? 1;

  let color = findColorInText(normalized);
  let colorFrom = color ? 'filename' : null;
  if (!color) {
    color = lookupMappedColor(filename, opts.fileColorMap);
    if (color) colorFrom = 'map';
  }

  const variant = detectVariant(normalized, color?.slug, categorySlug);
  const title = color ? productTitleFor(color, categorySlug, variant) : '—';
  const skuStyle = cfg?.skuStyle || 'pack';
  const slug = color ? productSlugForPlain(title, packSize, skuStyle) : null;
  const sku = color && cfg ? skuForPlain(cfg, color.abbr, packSize, 1) : null;

  return {
    filename,
    categorySlug,
    categoryName: cfg?.name || categorySlug,
    color,
    colorFrom,
    variant,
    packSize,
    packInferred,
    productName: title,
    slug,
    sku,
    unitLabel: packSize > 1 ? unitLabelFor(packSize) : cfg?.defaultPack === 1 ? 'adet' : 'paket',
    groupKey: color ? groupKeyFor({ categorySlug, colorSlug: color.slug, variant, packSize }) : `unknown::${filename}`,
    hasPhoto: true,
    price: cfg?.price ?? null,
    priceDefaulted: true,
    normalized,
  };
}

export { hexToRgb };
