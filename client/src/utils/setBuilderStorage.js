export function setBuilderStorageKey(slug) {
  return `set-builder-${slug}`;
}

/** Tema sayfasındaki set seçimine bir ürün adedi yazar. */
export function mergeSetBuilderQuantity(themeSlug, productId, quantity) {
  if (!themeSlug || !productId) return;
  const key = setBuilderStorageKey(themeSlug);
  let data = { quantities: {}, partySize: 'custom' };
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) data = { ...data, ...JSON.parse(raw) };
  } catch (error) {
    console.error('[set] sessionStorage okunamadı', error);
  }
  data.quantities = { ...(data.quantities || {}), [productId]: quantity };
  data.partySize = 'custom';
  sessionStorage.setItem(key, JSON.stringify(data));
}
