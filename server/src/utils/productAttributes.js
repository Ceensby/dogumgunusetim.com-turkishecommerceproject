import { PLAIN_CATEGORY_CONFIG } from './plainColors.js';

/** Kategoriye göre malzeme metni. */
export function materialForCategory(slug) {
  if (slug === 'kurdan') return 'Ahşap + kağıt süs';
  if (slug === 'flama' || slug === 'dogum-gunu-yazisi') return 'Karton';
  if (slug === 'plastik-catal' || slug === 'plastik-bicak') return 'Plastik';
  if (slug === 'fon-perdesi') return 'Folyo';
  if (slug === 'masa-ortusu') return 'Plastik/kağıt';
  const fromPlain = PLAIN_CATEGORY_CONFIG[slug]?.material;
  if (fromPlain) return fromPlain;
  return 'Karton/Kağıt';
}

/**
 * Tema ürünleri için varsayılan özellik listesi.
 * @param {{ packSize?: number, category?: { slug?: string } }} product
 * @param {string} themeName
 */
export function defaultAttributes(product, themeName = 'Unicorn') {
  const pack = Number(product.packSize) || 1;
  return [
    { label: 'Paket İçeriği', value: `${pack} adet`, sortOrder: 0 },
    { label: 'Tema', value: themeName, sortOrder: 1 },
    { label: 'Malzeme', value: materialForCategory(product.category?.slug || product.categorySlug), sortOrder: 2 },
    { label: 'Renk', value: 'Pastel pembe & lila', sortOrder: 3 },
    { label: 'Kullanım', value: 'Tek kullanımlık', sortOrder: 4 },
  ];
}

/**
 * Düz renk ürün özellikleri. Tema yazılmaz. Bilinmeyen paket/ölçü eklenmez.
 * @param {{ packSize?: number, packKnown?: boolean, categorySlug?: string, colorName?: string, size?: string, material?: string }} opts
 */
export function plainProductAttributes(opts = {}) {
  const rows = [];
  let order = 0;
  if (opts.colorName) {
    rows.push({ label: 'Renk', value: opts.colorName, sortOrder: order });
    order += 1;
  }
  if (opts.packKnown !== false && opts.packSize) {
    rows.push({ label: 'Paket İçeriği', value: `${opts.packSize} adet`, sortOrder: order });
    order += 1;
  }
  const material = opts.material || materialForCategory(opts.categorySlug);
  if (material) {
    rows.push({ label: 'Malzeme', value: material, sortOrder: order });
    order += 1;
  }
  if (opts.size) {
    rows.push({ label: 'Ölçü', value: opts.size, sortOrder: order });
  }
  return rows;
}
