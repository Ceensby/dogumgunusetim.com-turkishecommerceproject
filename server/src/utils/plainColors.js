/** Düz renk katalogu: seed, import ve renk algılama ortak kaynağı. */

export const PLAIN_COLORS = [
  { slug: 'pembe', name: 'Pembe', hexCode: '#FF6FA5', abbr: 'PMB', sortOrder: 1, aliases: ['pembe', 'pink', 'fusya', 'fuşya'] },
  { slug: 'mavi', name: 'Mavi', hexCode: '#4DA8FF', abbr: 'MAV', sortOrder: 2, aliases: ['mavi', 'blue', 'acik-mavi', 'açık mavi'] },
  { slug: 'krem', name: 'Krem', hexCode: '#F3E9D2', abbr: 'KRE', sortOrder: 3, aliases: ['krem', 'cream', 'ivory', 'bej', 'beige', 'beyaz', 'white'] },
  { slug: 'altin', name: 'Altın', hexCode: '#E5B94E', abbr: 'ALT', sortOrder: 4, aliases: ['altin', 'altın', 'gold'] },
  { slug: 'kirmizi', name: 'Kırmızı', hexCode: '#F0483E', abbr: 'KRM', sortOrder: 7, aliases: ['kirmizi', 'kırmızı', 'red'] },
  { slug: 'siyah', name: 'Siyah', hexCode: '#1F1B2E', abbr: 'SYH', sortOrder: 8, aliases: ['siyah', 'black'] },
  { slug: 'gumus', name: 'Gümüş', hexCode: '#C0C5CA', abbr: 'GMS', sortOrder: 9, aliases: ['gumus', 'gümüş', 'silver', 'gri', 'gray', 'grey'] },
  { slug: 'rose-gold', name: 'Rose Gold', hexCode: '#C98973', abbr: 'RSG', sortOrder: 10, aliases: ['rose-gold', 'rosegold', 'rose gold', 'roz-gold'] },
  { slug: 'mor', name: 'Mor', hexCode: '#7A1FA2', abbr: 'MOR', sortOrder: 11, aliases: ['mor', 'purple', 'violet', 'lila', 'lavender', 'lavanta'] },
  { slug: 'yesil', name: 'Yeşil', hexCode: '#22A34A', abbr: 'YSL', sortOrder: 12, aliases: ['yesil', 'yeşil', 'green'] },
  { slug: 'gokkusagi', name: 'Gökkuşağı', hexCode: '#FF7A62', abbr: 'GKK', sortOrder: 13, aliases: ['gokkusagi', 'gökkuşağı', 'rainbow'] },
  { slug: 'sari', name: 'Sarı', hexCode: '#F5C400', abbr: 'SAR', sortOrder: 14, aliases: ['sari', 'sarı', 'yellow'] },
  { slug: 'turuncu', name: 'Turuncu', hexCode: '#FF8A1A', abbr: 'TRN', sortOrder: 15, aliases: ['turuncu', 'orange'] },
  { slug: 'gri', name: 'Gri', hexCode: '#9A9EA6', abbr: 'GRI', sortOrder: 16, aliases: ['gri', 'gray', 'grey'] },
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
  'plastik-tabak': {
    name: 'Plastik Tabak',
    abbr: 'TBK',
    price: 89,
    defaultPack: 8,
    skuStyle: 'pack',
    material: 'Plastik',
  },
  'plastik-bardak': {
    name: 'Plastik Bardak',
    abbr: 'BRD',
    price: 69,
    defaultPack: 8,
    skuStyle: 'pack',
    material: 'Plastik',
  },
  'karton-tabak': {
    name: 'Karton Tabak',
    abbr: 'KTB',
    price: 89,
    defaultPack: 8,
    skuStyle: 'pack',
    material: 'Karton',
  },
  'karton-bardak': {
    name: 'Karton Bardak',
    abbr: 'KBR',
    price: 69,
    defaultPack: 8,
    skuStyle: 'pack',
    material: 'Karton',
  },
  'masa-etegi': {
    name: 'Metalize Masa Eteği',
    abbr: 'MET',
    price: 99,
    defaultPack: 1,
    skuStyle: 'seq',
    material: 'Metalize folyo',
    omitPackAttribute: true,
  },
  pecete: {
    name: 'Kağıt Peçete',
    abbr: 'PCT',
    price: 75,
    defaultPack: 16,
    skuStyle: 'pack',
    material: 'Kağıt',
  },
  'masa-ortusu': {
    name: 'Plastik Masa Örtüsü',
    abbr: 'MOR',
    price: 75,
    defaultPack: 1,
    skuStyle: 'pack',
    material: 'Plastik',
    defaultSize: '120 x 180 cm',
  },
};

export const CREATABLE_PLAIN_CATEGORIES = {
  'plastik-tabak': {
    slug: 'plastik-tabak',
    name: 'Plastik Tabak',
    pluralName: 'Plastik Tabaklar',
    iconName: 'DinnerDining',
    unitLabel: 'paket',
    sortOrder: 2,
    description: 'Renkli plastik tabaklar',
    groupSlug: 'plastikler',
  },
  'plastik-bardak': {
    slug: 'plastik-bardak',
    name: 'Plastik Bardak',
    pluralName: 'Plastik Bardaklar',
    iconName: 'LocalCafe',
    unitLabel: 'paket',
    sortOrder: 4,
    description: 'Renkli plastik bardaklar',
    groupSlug: 'plastikler',
  },
  'masa-etegi': {
    slug: 'masa-etegi',
    name: 'Masa Eteği',
    pluralName: 'Masa Etekleri',
    iconName: 'ViewWeek',
    unitLabel: 'adet',
    sortOrder: 11,
    description: 'Metalize masa etekleri',
    groupSlug: 'masa-ustu',
  },
};
export const PRESERVED_PLAIN_SKUS = new Set(['GEN-FON-PMB-01', 'GEN-CTL-PMB-25', 'GEN-BCK-PMB-25']);

export function colorBySlug(slug) {
  return PLAIN_COLORS.find((c) => c.slug === slug) || null;
}

export function seedColorRows() {
  return PLAIN_COLORS.map(({ slug, name, hexCode, sortOrder }) => ({ slug, name, hexCode, sortOrder }));
}
