/** Düz renk katalogu: seed, import ve renk algılama ortak kaynağı. */

export const PLAIN_COLORS = [
  { slug: 'pembe', name: 'Pembe', hexCode: '#FF6FA5', abbr: 'PMB', sortOrder: 1, aliases: ['pembe', 'pink', 'fusya', 'fuşya'] },
  { slug: 'mavi', name: 'Mavi', hexCode: '#4DA8FF', abbr: 'MAV', sortOrder: 2, aliases: ['mavi', 'blue', 'acik-mavi', 'açık mavi'] },
  { slug: 'beyaz', name: 'Beyaz', hexCode: '#FFFFFF', abbr: 'BYZ', sortOrder: 3, aliases: ['beyaz', 'white'] },
  { slug: 'altin', name: 'Altın', hexCode: '#E5B94E', abbr: 'ALT', sortOrder: 4, aliases: ['altin', 'altın', 'gold'] },
  { slug: 'lila', name: 'Lila', hexCode: '#C77DFF', abbr: 'LIL', sortOrder: 5, aliases: ['lila', 'lavender', 'lavanta'] },
  { slug: 'mint', name: 'Mint', hexCode: '#7BE0C0', abbr: 'MNT', sortOrder: 6, aliases: ['mint', 'mint-yesil'] },
  { slug: 'kirmizi', name: 'Kırmızı', hexCode: '#F0483E', abbr: 'KRM', sortOrder: 7, aliases: ['kirmizi', 'kırmızı', 'red'] },
  { slug: 'siyah', name: 'Siyah', hexCode: '#1F1B2E', abbr: 'SYH', sortOrder: 8, aliases: ['siyah', 'black'] },
  { slug: 'gumus', name: 'Gümüş', hexCode: '#C0C5CA', abbr: 'GMS', sortOrder: 9, aliases: ['gumus', 'gümüş', 'silver'] },
  { slug: 'rose-gold', name: 'Rose Gold', hexCode: '#C98973', abbr: 'RSG', sortOrder: 10, aliases: ['rose-gold', 'rosegold', 'rose gold', 'roz-gold'] },
  { slug: 'mor', name: 'Mor', hexCode: '#7A1FA2', abbr: 'MOR', sortOrder: 11, aliases: ['mor', 'purple', 'violet'] },
  { slug: 'yesil', name: 'Yeşil', hexCode: '#22A34A', abbr: 'YSL', sortOrder: 12, aliases: ['yesil', 'yeşil', 'green'] },
  { slug: 'gokkusagi', name: 'Gökkuşağı', hexCode: '#FF7A62', abbr: 'GKK', sortOrder: 13, aliases: ['gokkusagi', 'gökkuşağı', 'rainbow'] },
  { slug: 'sari', name: 'Sarı', hexCode: '#F5C400', abbr: 'SAR', sortOrder: 14, aliases: ['sari', 'sarı', 'yellow'] },
  { slug: 'turuncu', name: 'Turuncu', hexCode: '#FF8A1A', abbr: 'TRN', sortOrder: 15, aliases: ['turuncu', 'orange'] },
  { slug: 'krem', name: 'Krem', hexCode: '#F0D9B5', abbr: 'KRE', sortOrder: 16, aliases: ['krem', 'cream', 'ivory', 'bej', 'beige'] },
  { slug: 'gri', name: 'Gri', hexCode: '#9A9EA6', abbr: 'GRI', sortOrder: 17, aliases: ['gri', 'gray', 'grey'] },
];

export const PLAIN_CATEGORY_CONFIG = {
  'fon-perdesi': {
    name: 'Fon Perdesi',
    abbr: 'FON',
    price: 119,
    defaultPack: 1,
    skuStyle: 'seq',
    material: 'Folyo',
  },
  'plastik-catal': {
    name: 'Plastik Çatal',
    abbr: 'CTL',
    price: 79,
    defaultPack: 25,
    skuStyle: 'pack',
    material: 'Plastik',
  },
  'plastik-bicak': {
    name: 'Plastik Bıçak',
    abbr: 'BCK',
    price: 79,
    defaultPack: 25,
    skuStyle: 'pack',
    material: 'Plastik',
  },
  'karton-tabak': {
    name: 'Karton Tabak',
    abbr: 'TBK',
    price: 89,
    defaultPack: 8,
    skuStyle: 'pack',
    material: 'Karton',
  },
  'karton-bardak': {
    name: 'Karton Bardak',
    abbr: 'BRD',
    price: 69,
    defaultPack: 8,
    skuStyle: 'pack',
    material: 'Karton',
  },
  pecete: {
    name: 'Peçete',
    abbr: 'PCT',
    price: 75,
    defaultPack: 16,
    skuStyle: 'pack',
    material: 'Kağıt',
  },
  'masa-ortusu': {
    name: 'Masa Örtüsü',
    abbr: 'MOR',
    price: 75,
    defaultPack: 1,
    skuStyle: 'seq',
    material: 'Plastik',
  },
};

/** Mevcut pembe ürünler: fotoğraf eklenir, fiyat / ad / tema bağına dokunulmaz. */
export const PRESERVED_PLAIN_SKUS = new Set(['GEN-FON-PMB-01', 'GEN-CTL-PMB-25', 'GEN-BCK-PMB-25']);

export function colorBySlug(slug) {
  return PLAIN_COLORS.find((c) => c.slug === slug) || null;
}

export function seedColorRows() {
  return PLAIN_COLORS.map(({ slug, name, hexCode, sortOrder }) => ({ slug, name, hexCode, sortOrder }));
}
