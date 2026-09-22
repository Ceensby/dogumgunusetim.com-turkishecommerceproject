import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { ok, fail, serialize } from '../utils/response.js';
import * as cartService from '../services/cartService.js';
import * as themeController from './themeController.js';
import * as productController from './productController.js';

const addSetSchema = z.object({
  themeId: z.number().int().positive(),
  setName: z.string().min(1).max(120),
  setGroupId: z.string().uuid(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().min(0).max(99),
      }),
    )
    .min(1),
});

const addItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99).default(1),
  themeId: z.number().int().positive().optional().nullable(),
  setGroupId: z.string().uuid().optional().nullable(),
  setName: z.string().max(120).optional().nullable(),
});

const qtySchema = z.object({
  quantity: z.number().int().min(0).max(99),
});

const updateSetSchema = z.object({
  items: z.array(
    z.object({
      productId: z.number().int().positive(),
      quantity: z.number().int().min(0).max(99),
    }),
  ),
});

export async function listThemes(req, res, next) {
  try {
    const data = await themeController.listThemes(req.query);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getTheme(req, res, next) {
  try {
    const data = await themeController.getThemeBySlug(req.params.slug);
    if (!data) return fail(res, 'Tema bulunamadı.', 404);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function listCategories(_req, res, next) {
  try {
    const items = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { group: true },
    });
    return ok(res, serialize(items));
  } catch (error) {
    next(error);
  }
}

export async function listColors(_req, res, next) {
  try {
    const items = await prisma.color.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: { sortOrder: 'asc' },
    });
    const mapped = items
      .map((c) => {
        const { _count, ...rest } = c;
        return { ...rest, productCount: _count?.products ?? 0 };
      })
      .sort((a, b) => {
        const aHas = a.productCount > 0 ? 0 : 1;
        const bHas = b.productCount > 0 ? 0 : 1;
        if (aHas !== bHas) return aHas - bHas;
        return a.sortOrder - b.sortOrder;
      });
    return ok(res, serialize(mapped));
  } catch (error) {
    next(error);
  }
}

export async function listProducts(req, res, next) {
  try {
    const data = await productController.listProducts(req.query);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    const data = await productController.getProductBySlug(req.params.slug);
    if (!data) return fail(res, 'Ürün bulunamadı.', 404);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getCategoryProducts(req, res, next) {
  try {
    const data = await productController.listByCategorySlug(req.params.slug, req.query);
    if (!data) return fail(res, 'Kategori bulunamadı.', 404);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getColorProducts(req, res, next) {
  try {
    const data = await productController.listByColorSlug(req.params.slug, req.query);
    if (!data) return fail(res, 'Renk bulunamadı.', 404);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function search(req, res, next) {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) {
      return fail(res, 'En az 2 karakter yazmalısın.', 400);
    }
    const [themes, products] = await Promise.all([
      prisma.theme.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q } },
            { title: { contains: q } },
            { tags: { contains: q } },
            { shortDescription: { contains: q } },
          ],
        },
        take: 12,
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [{ name: { contains: q } }, { sku: { contains: q } }, { description: { contains: q } }],
        },
        include: {
          images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1 },
          category: true,
        },
        take: 12,
      }),
    ]);
    return ok(res, { themes: serialize(themes), products: serialize(products), q });
  } catch (error) {
    next(error);
  }
}

export async function getSettings(_req, res, next) {
  try {
    const rows = await prisma.siteSetting.findMany();
    const publicKeys = [
      'site_name',
      'site_tagline',
      'shipping_fee',
      'free_shipping_threshold',
      'contact_phone',
      'contact_email',
      'whatsapp',
      'instagram',
      'homepage_hero_title',
      'homepage_hero_subtitle',
      'about_text',
      'faq_json',
      'shipping_text',
      'returns_text',
      'privacy_text',
      'distance_sales_text',
    ];
    const data = Object.fromEntries(
      rows.filter((r) => publicKeys.includes(r.key)).map((r) => [r.key, r.value]),
    );
    return ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getCart(req, res, next) {
  try {
    const data = await cartService.getCartBySession(req.cartSessionId, req.query.coupon);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function addSet(req, res, next) {
  try {
    const payload = addSetSchema.parse(req.body);
    const data = await cartService.addSet(req.cartSessionId, payload);
    return ok(res, data, 'Set sepete eklendi.');
  } catch (error) {
    console.error('[sepet] add-set hata', error);
    next(error);
  }
}

export async function addItem(req, res, next) {
  try {
    const payload = addItemSchema.parse(req.body);
    const data = await cartService.addItem(req.cartSessionId, payload);
    return ok(res, data, 'Ürün sepete eklendi.');
  } catch (error) {
    next(error);
  }
}

export async function updateItem(req, res, next) {
  try {
    const { quantity } = qtySchema.parse(req.body);
    const data = await cartService.updateItem(req.cartSessionId, Number(req.params.id), quantity);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function deleteItem(req, res, next) {
  try {
    const data = await cartService.deleteItem(req.cartSessionId, Number(req.params.id));
    return ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function updateSet(req, res, next) {
  try {
    const { items } = updateSetSchema.parse(req.body);
    const data = await cartService.updateSet(req.cartSessionId, req.params.setGroupId, items);
    return ok(res, data, 'Set güncellendi.');
  } catch (error) {
    next(error);
  }
}

export async function deleteSet(req, res, next) {
  try {
    const data = await cartService.deleteSet(req.cartSessionId, req.params.setGroupId);
    return ok(res, data, 'Set sepetten kaldırıldı.');
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req, res, next) {
  try {
    const data = await cartService.clearCart(req.cartSessionId);
    return ok(res, data, 'Sepet boşaltıldı.');
  } catch (error) {
    next(error);
  }
}
