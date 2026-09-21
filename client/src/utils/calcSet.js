/**
 * Parti kişi sayısına göre paket adetlerini hesaplar.
 * packSize 1 olan tekil ürünler (örtü, flama, yazı) 1 kalır.
 * @param {{ packSize?: number }} product
 * @param {number} partySize
 */
export function quantityForPartySize(product, partySize) {
  const packSize = Number(product.packSize) || 1;
  if (packSize <= 1) return 1;
  return Math.max(1, Math.ceil(partySize / packSize));
}

export function lineTotal(price, quantity) {
  return Math.round(Number(price) * Number(quantity) * 100) / 100;
}

export function flattenGroupedProducts(groupedProducts = []) {
  return groupedProducts.flatMap((group) => group.products || []);
}

export function matchPartySize(products, quantities, size) {
  return products.every((p) => Number(quantities[p.id] || 0) === quantityForPartySize(p, size));
}
