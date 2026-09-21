const TR_MAP = {
  ı: 'i',
  İ: 'i',
  ş: 's',
  Ş: 's',
  ğ: 'g',
  Ğ: 'g',
  ü: 'u',
  Ü: 'u',
  ö: 'o',
  Ö: 'o',
  ç: 'c',
  Ç: 'c',
};

/**
 * Türkçe karakterleri ASCII'ye çevirip URL dostu slug üretir.
 * @param {string} value
 * @returns {string}
 */
export function slugify(value) {
  if (!value) return '';
  const replaced = String(value)
    .split('')
    .map((ch) => TR_MAP[ch] ?? ch)
    .join('');

  return replaced
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
