import { prisma } from '../lib/prisma.js';
import { toNumber } from '../utils/response.js';

const DEFAULT_SHIPPING_FEE = 79.9;
const DEFAULT_FREE_THRESHOLD = 750;
const COUPON_CODE = 'PARTI10';
const COUPON_PERCENT = 10;

export async function getSettingMap() {
  const rows = await prisma.siteSetting.findMany();
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export function calcShippingFee(subtotal, settings) {
  const fee = Number(settings.shipping_fee ?? DEFAULT_SHIPPING_FEE);
  const threshold = Number(settings.free_shipping_threshold ?? DEFAULT_FREE_THRESHOLD);
  if (subtotal >= threshold) return 0;
  return fee;
}

export function applyCoupon(subtotal, couponCode) {
  if (!couponCode) return { discount: 0, couponCode: null };
  const normalized = String(couponCode).trim().toUpperCase();
  if (normalized === COUPON_CODE) {
    return {
      discount: Math.round(subtotal * (COUPON_PERCENT / 100) * 100) / 100,
      couponCode: COUPON_CODE,
    };
  }
  return { discount: 0, couponCode: null, invalid: true };
}

/**
 * Satır toplamı ve sepet özetini sunucuda hesaplar — istemci fiyatına güvenilmez.
 */
export async function summarizeItems(items, couponCode) {
  const settings = await getSettingMap();
  const subtotal = items.reduce((sum, item) => {
    const unit = toNumber(item.unitPriceSnapshot ?? item.unitPrice ?? item.price);
    return sum + unit * item.quantity;
  }, 0);
  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const { discount, couponCode: applied, invalid } = applyCoupon(roundedSubtotal, couponCode);
  const shippingFee = calcShippingFee(Math.max(0, roundedSubtotal - discount), settings);
  const total = Math.round((roundedSubtotal - discount + shippingFee) * 100) / 100;

  return {
    subtotal: roundedSubtotal,
    shippingFee,
    discount,
    total,
    couponCode: applied,
    couponInvalid: Boolean(invalid),
    freeShippingThreshold: Number(settings.free_shipping_threshold ?? DEFAULT_FREE_THRESHOLD),
    settings,
  };
}
