/**
 * WebP boyut varyantları import script'inin yazdığı
 * /images/products/<klasör>/.../<file>.webp dosyalarında vardır
 * (tema: unicorn/, düz renk: duz-renk/<renk>/).
 *
 * Sadece sondaki -sm / -md boyut ekleri kırpılır.
 * "...-2.webp" gibi galeri sırası ekine dokunulmaz
 * (eski `replace(/\.webp$/, '-sm.webp')` "...-2.webp" → "...-2-sm.webp" üretir; bu doğrudur).
 */
const SIZE_TOKEN = /-(sm|md)(?=\.webp$)/i;

export function hasSizeVariants(src) {
  return typeof src === 'string' && /\/images\/products\/.+\.webp$/i.test(src);
}

export function stripSizeToken(src) {
  if (!src || typeof src !== 'string') return src;
  return src.replace(SIZE_TOKEN, '');
}

export function sizedImageUrl(src, size = 'lg') {
  if (!src || typeof src !== 'string') return src;
  if (!hasSizeVariants(src)) return src;
  const base = stripSizeToken(src);
  if (size === 'sm' || size === 'md') return base.replace(/\.webp$/i, `-${size}.webp`);
  return base;
}

export function primaryImageUrl(product) {
  const images = product?.images || [];
  const primary = images.find((img) => img.isPrimary);
  return primary?.url || images[0]?.url || null;
}

export function imageSrcSet(src) {
  if (!hasSizeVariants(src)) return undefined;
  return `${sizedImageUrl(src, 'sm')} 200w, ${sizedImageUrl(src, 'md')} 600w, ${sizedImageUrl(src, 'lg')} 1200w`;
}

export function imageSizes(size = 'lg') {
  if (size === 'sm') return '80px';
  if (size === 'md') return '(max-width: 600px) 50vw, 280px';
  return '(max-width: 900px) 100vw, 640px';
}
