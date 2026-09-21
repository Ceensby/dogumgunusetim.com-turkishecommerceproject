import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { ok, fail, serialize, toNumber } from '../utils/response.js';
import { getCartBySession, clearCart } from '../services/cartService.js';
import { summarizeItems } from '../services/pricingService.js';
import { createHttpError } from '../middleware/errorHandler.js';

function makeOrderNumber() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DGS${y}${m}${d}${rand}`;
}

const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(2, 'Ad soyad en az 2 karakter olmalı.'),
    email: z.string().email('Geçerli bir e-posta yaz.'),
    phone: z.string().min(10, 'Telefon numarası eksik.'),
  }),
  address: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(10),
    city: z.string().min(2, 'İl gerekli.'),
    district: z.string().min(2, 'İlçe gerekli.'),
    addressLine: z.string().min(8, 'Adres satırı çok kısa.'),
    postalCode: z.string().optional().nullable(),
  }),
  note: z.string().max(500).optional().nullable(),
  couponCode: z.string().max(40).optional().nullable(),
});

export async function createOrder(req, res, next) {
  try {
    const payload = orderSchema.parse(req.body);
    const cart = await getCartBySession(req.cartSessionId, payload.couponCode);

    if (!cart.items?.length) {
      return fail(res, 'Sepetin boş. Sipariş oluşturulamıyor.', 400);
    }

    // Stok kontrolü
    for (const item of cart.items) {
      if (item.product.trackStock && item.product.stock < item.quantity) {
        throw createHttpError(
          409,
          `"${item.product.name}" için yeterli stok yok.`,
          { productId: item.productId, available: item.product.stock },
        );
      }
    }

    if (cart.couponInvalid) {
      return fail(res, 'Kupon kodu geçersiz.', 400);
    }

    const summary = await summarizeItems(cart.items, payload.couponCode);
    const orderNumber = makeOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          name: payload.customer.name,
          email: payload.customer.email,
          phone: payload.customer.phone,
        },
      });

      const address = await tx.address.create({
        data: {
          customerId: customer.id,
          fullName: payload.address.fullName,
          phone: payload.address.phone,
          city: payload.address.city,
          district: payload.address.district,
          addressLine: payload.address.addressLine,
          postalCode: payload.address.postalCode || null,
        },
      });

      const created = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          addressId: address.id,
          status: 'pending',
          subtotal: summary.subtotal,
          shippingFee: summary.shippingFee,
          discount: summary.discount,
          total: summary.total,
          couponCode: summary.couponCode,
          note: payload.note || null,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: toNumber(item.unitPriceSnapshot),
              total: Math.round(toNumber(item.unitPriceSnapshot) * item.quantity * 100) / 100,
              setGroupId: item.setGroupId,
              setName: item.setName,
              productName: item.product.name,
              productSku: item.product.sku,
            })),
          },
        },
        include: {
          items: true,
          customer: true,
          address: true,
        },
      });

      for (const item of cart.items) {
        if (item.product.trackStock) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return created;
    });

    await clearCart(req.cartSessionId);
    console.log('[sipariş] oluşturuldu', { orderNumber: order.orderNumber });
    return ok(res, serialize(order), 'Siparişin alındı.', 201);
  } catch (error) {
    console.error('[sipariş] oluşturma hatası', error);
    next(error);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                slug: true,
                images: { take: 1, orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
              },
            },
          },
        },
        customer: true,
        address: true,
      },
    });
    if (!order) return fail(res, 'Sipariş bulunamadı.', 404);
    return ok(res, serialize(order));
  } catch (error) {
    next(error);
  }
}
