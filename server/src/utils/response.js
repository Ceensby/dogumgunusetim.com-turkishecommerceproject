/**
 * API yanıt zarfı: { success, data, message?, error? }
 */

export function ok(res, data, message, status = 200) {
  return res.status(status).json({
    success: true,
    data,
    ...(message ? { message } : {}),
  });
}

export function fail(res, error, status = 400, extra = {}) {
  return res.status(status).json({
    success: false,
    data: extra.data ?? null,
    error,
    ...extra,
  });
}

/** Prisma Decimal / BigInt değerlerini JSON'a çevirir. */
export function serialize(value) {
  return JSON.parse(
    JSON.stringify(value, (_key, val) => {
      if (val && typeof val === 'object' && typeof val.toNumber === 'function') {
        return val.toNumber();
      }
      if (typeof val === 'bigint') return Number(val);
      return val;
    }),
  );
}

export function toNumber(decimalLike) {
  if (decimalLike == null) return 0;
  if (typeof decimalLike === 'number') return decimalLike;
  if (typeof decimalLike === 'string') return Number(decimalLike);
  if (typeof decimalLike.toNumber === 'function') return decimalLike.toNumber();
  return Number(decimalLike);
}
