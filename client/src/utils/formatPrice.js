const formatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
});

export function formatPrice(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return formatter.format(0);
  return formatter.format(n);
}

export function formatNumber(value) {
  return new Intl.NumberFormat('tr-TR').format(Number(value) || 0);
}
