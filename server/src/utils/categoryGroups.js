/** Renk sayfası ve seed için kategori grupları. */

export const CATEGORY_GROUPS = [
  { slug: 'plastikler', name: 'Plastikler', iconName: 'DinnerDining', sortOrder: 1 },
  { slug: 'kartonlar', name: 'Kartonlar', iconName: 'Inventory2', sortOrder: 2 },
  { slug: 'masa-ustu', name: 'Masa Üstü', iconName: 'TableRestaurant', sortOrder: 3 },
  { slug: 'susler', name: 'Süsler', iconName: 'Celebration', sortOrder: 4 },
];

/** Kategori slug → grup slug. Tanımsız kalan kategoriler groupId null kalır. */
export const CATEGORY_GROUP_BY_SLUG = {
  'plastik-tabak': 'plastikler',
  'plastik-bardak': 'plastikler',
  'karton-tabak': 'kartonlar',
  'karton-bardak': 'kartonlar',
  pecete: 'kartonlar',
  'plastik-catal': 'masa-ustu',
  'plastik-bicak': 'masa-ustu',
  'masa-ortusu': 'masa-ustu',
  'masa-etegi': 'masa-ustu',
  'fon-perdesi': 'susler',
  balon: 'susler',
};
