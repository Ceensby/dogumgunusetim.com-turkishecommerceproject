/** Kategoriye göre malzeme metni. */
export function materialForCategory(slug) {
  if (slug === 'kurdan') return 'Ahşap + kağıt süs';
  if (slug === 'flama' || slug === 'dogum-gunu-yazisi') return 'Karton';
  if (slug === 'plastik-catal' || slug === 'plastik-bicak') return 'Plastik';
  if (slug === 'masa-ortusu') return 'Plastik/kağıt';
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
