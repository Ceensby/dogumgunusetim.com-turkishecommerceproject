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
  if (categorySlug === 'plastik-tabak') return `${color.name} Plastik Tabak`;
  if (categorySlug === 'plastik-bardak') return `${color.name} Plastik Bardak`;
  if (categorySlug === 'karton-tabak') return `${color.name} Karton Tabak`;
  if (categorySlug === 'karton-bardak') return `${color.name} Karton Bardak`;
  if (categorySlug === 'pecete') return `${color.name} Kağıt Peçete`;
  if (categorySlug === 'masa-ortusu') return `${color.name} Plastik Masa Örtüsü`;
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

function titleFromSlug(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function abbrFromSlug(slug) {
  const parts = slug.split('-').filter(Boolean);
  if (!parts.length) return 'XXX';
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase().padEnd(3, 'X');
  return parts.map((p) => p[0]).join('').slice(0, 3).toUpperCase().padEnd(3, 'X');
}

function hexFromSlug(slug) {
  let h = 2166136261;
  for (const ch of slug) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const hue = Math.abs(h) % 360;
  const s = 0.42;
  const l = 0.62;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + hue / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c);
  };
  const hex = (n) => n.toString(16).padStart(2, '0');
  return `#${hex(f(0))}${hex(f(8))}${hex(f(4))}`.toUpperCase();
}

function compactKey(value) {
  return slugify(value).replace(/-/g, '');
}

const PREFIX_MATERIALS = [
  { keys: ['plastik', 'platik'], canonical: 'plastik' },
  { keys: ['kagit'], canonical: 'kagit' },
  { keys: ['karton'], canonical: 'karton' },
];

const PREFIX_MATERIAL_RE = new RegExp(
  `^(.*?)-(${PREFIX_MATERIALS.flatMap((m) => m.keys).join('|')})-(.*)$`,
);

const PREFIX_PRODUCT_TYPES = [
  { keys: ['bicak'], material: 'plastik', categorySlug: 'plastik-bicak' },
  { keys: ['tabak'], material: 'plastik', categorySlug: 'plastik-tabak' },
  { keys: ['bardak'], material: 'plastik', categorySlug: 'plastik-bardak' },
  { keys: ['catal'], material: 'plastik', categorySlug: 'plastik-catal' },
  { keys: ['masaortusu'], material: 'plastik', categorySlug: 'masa-ortusu' },
  { keys: ['pecete'], material: 'kagit', categorySlug: 'pecete' },
  { keys: ['tabak'], material: 'karton', categorySlug: 'karton-tabak' },
  { keys: ['bardak'], material: 'karton', categorySlug: 'karton-bardak' },
];

function materialCanonical(token) {
  return PREFIX_MATERIALS.find((m) => m.keys.includes(token))?.canonical || token;
}

function matchPrefixProduct(material, productSlug) {
  const compact = compactKey(productSlug);
  return PREFIX_PRODUCT_TYPES.find((t) => {
    if (t.material !== material) return false;
    return t.keys.some((k) => compact === k || compact.startsWith(k));
  });
}

/** Prefix kuralı: malzeme kelimesinden önceki renk, sondaki rakam fotoğraf sırası. */
export function resolvePrefixColor(token) {
  const slug = slugify(token);
  if (!slug) return { color: null, mappedFromWhite: false, invented: false };
  const mappedFromWhite = slug === 'beyaz' || slug === 'white';
  const known = mappedFromWhite
    ? PLAIN_COLORS.find((c) => c.slug === 'krem')
    : PLAIN_COLORS.find((c) => c.slug === slug)
      || findColorInText(slug);
  if (known) return { color: known, mappedFromWhite, invented: false };
  return {
    color: {
      slug,
      name: titleFromSlug(slug),
      hexCode: hexFromSlug(slug),
      abbr: abbrFromSlug(slug),
      sortOrder: 80,
      aliases: [slug],
    },
    mappedFromWhite: false,
    invented: true,
  };
}

/**
 * <renk>-<malzeme>-<ürün>.png → ana fotoğraf
 * <renk>-<malzeme>-<ürün>2.png / ürün-2 / ürün_2 / ürün 2 → 2. fotoğraf
 * Malzeme: plastik/platik, kagit, karton. Yazım: masaortusu = masa-ortusu, peçete, büyük harf.
 */
export function parsePrefixPlainFilename(filename, opts = {}) {
  const requestedCategory = opts.categorySlug;
  const normalized = slugify(filename.replace(/\.[^.]+$/, ''));

  const delim = normalized.match(PREFIX_MATERIAL_RE);
  if (!delim || !delim[1] || !delim[3]) {
    return {
      filename,
      ok: false,
      skipReason: 'prefix kuralına uymuyor (<renk>-<malzeme>-<ürün>...)',
      photoIndex: 1,
    };
  }

  const colorToken = delim[1];
  const material = materialCanonical(delim[2]);
  let rest = delim[3];
  let photoIndex = 1;
  const packFromRest = parsePackSize(rest);
  const trailing = rest.match(/^(.*?)(?:-|_)?(\d+)$/);
  if (trailing && packFromRest == null) {
    const n = Number(trailing[2]);
    if (Number.isFinite(n) && n >= 1 && n < 20) {
      photoIndex = n;
      rest = trailing[1].replace(/-+$/, '');
    }
  }

  const typeHit = matchPrefixProduct(material, rest);
  if (requestedCategory && typeHit && typeHit.categorySlug !== requestedCategory) {
    return {
      filename,
      ok: false,
      skipReason: `ürün türü "${typeHit.categorySlug}" bu klasörle uyuşmuyor`,
      photoIndex,
    };
  }
  const categorySlug = requestedCategory || typeHit?.categorySlug;
  const cfg = PLAIN_CATEGORY_CONFIG[categorySlug];
  if (!typeHit || !categorySlug || !cfg) {
    return {
      filename,
      ok: false,
      skipReason: 'ürün türü anlaşılamadı',
      photoIndex,
    };
  }

  const { color, mappedFromWhite, invented } = resolvePrefixColor(colorToken);
  if (!color) {
    return {
      filename,
      ok: false,
      skipReason: 'renk anlaşılamadı',
      photoIndex,
    };
  }

  const packInferred = packFromRest == null;
  const packSize = packFromRest ?? cfg.defaultPack ?? 1;
  const sizeMatch = rest.match(/(\d+)\s*x\s*(\d+)/i);
  const size = sizeMatch ? `${sizeMatch[1]} x ${sizeMatch[2]} cm` : (cfg.defaultSize || null);
  const sizeInferred = !sizeMatch && !!cfg.defaultSize;
  const variant = detectVariant(normalized, color.slug, categorySlug);
  const title = productTitleFor(color, categorySlug, variant);
  const skuStyle = cfg.skuStyle || 'pack';
  const slug = productSlugForPlain(title, packSize, skuStyle);
  const sku = skuForPlain(cfg, color.abbr, packSize, 1);

  return {
    filename,
    ok: true,
    categorySlug,
    categoryName: cfg.name || categorySlug,
    color,
    colorFrom: invented ? 'invented' : mappedFromWhite ? 'beyaz→krem' : 'prefix',
    mappedFromWhite,
    invented,
    variant,
    photoIndex,
    packSize,
    packInferred,
    size,
    sizeInferred,
    productName: title,
    slug,
    sku,
    unitLabel: packSize > 1 ? unitLabelFor(packSize) : cfg.defaultPack === 1 ? 'adet' : 'paket',
    groupKey: groupKeyFor({ categorySlug, colorSlug: color.slug, variant, packSize }),
    hasPhoto: true,
    price: cfg.price ?? null,
    priceDefaulted: true,
    normalized,
  };
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
