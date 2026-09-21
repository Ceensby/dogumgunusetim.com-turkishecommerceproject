/**
 * WebP varyantları yalnızca import script'inin yazdığı
 * /images/products/<tema>/<slug>.webp dosyalarında vardır.
 */
export function hasSizeVariants(src) {
  return typeof src === 'string' && /\/images\/products\/[^/]+\/[^/]+\.webp$/i.test(src);
}

export function sizedImageUrl(src, size = 'lg') {
  if (!src || typeof src !== 'string') return src;
  if (!hasSizeVariants(src)) return src;
  const base = src.replace(/-sm\.webp$/i, '.webp').replace(/-md\.webp$/i, '.webp');
  if (size === 'sm') return base.replace(/\.webp$/i, '-sm.webp');
  if (size === 'md') return base.replace(/\.webp$/i, '-md.webp');
  return base;
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
