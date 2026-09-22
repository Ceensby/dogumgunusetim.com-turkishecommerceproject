import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { ok, fail, serialize } from '../utils/response.js';
import { slugify } from '../utils/slugify.js';

const themeSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  heroImage: z.string().optional().nullable(),
  heroAspectRatio: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  primaryColor: z.string().optional().nullable(),
  secondaryColor: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  ageGroup: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

const emptyToNull = (val) => (val === '' || val === undefined ? null : val);

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  themeId: z.preprocess(emptyToNull, z.coerce.number().int().positive().nullable().optional()),
  categoryId: z.coerce.number().int().positive(),
  colorId: z.preprocess(emptyToNull, z.coerce.number().int().positive().nullable().optional()),
  price: z.coerce.number().nonnegative(),
  compareAtPrice: z.preprocess(emptyToNull, z.coerce.number().nonnegative().nullable().optional()),
  taxRate: z.coerce.number().int().optional(),
  packSize: z.coerce.number().int().positive().optional(),
  unitLabel: z.string().optional(),
  stock: z.coerce.number().int().optional(),
  trackStock: z.boolean().optional(),
  barcode: z.string().optional().nullable(),
  weightGrams: z.preprocess(emptyToNull, z.coerce.number().int().nullable().optional()),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  images: z
    .array(
      z.object({
        url: z.string(),
        alt: z.string().optional().nullable(),
        sortOrder: z.number().int().optional(),
        isPrimary: z.boolean().optional(),
      }),
    )
    .optional(),
  attributes: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
        sortOrder: z.coerce.number().int().optional(),
      }),
    )
    .optional(),
});

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional().nullable(),
  pluralName: z.string().optional().nullable(),
  iconName: z.string().optional().nullable(),
  unitLabel: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
  description: z.string().optional().nullable(),
  groupId: z.preprocess(emptyToNull, z.coerce.number().int().positive().nullable().optional()),
});

const categoryGroupSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional().nullable(),
  iconName: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

const colorSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional().nullable(),
  hexCode: z.string().min(4),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function listThemes(_req, res, next) {
  try {
    const items = await prisma.theme.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { themeProducts: true } } },
    });
    return ok(res, serialize(items));
  } catch (error) {
    next(error);
  }
}

export async function getTheme(req, res, next) {
  try {
    const item = await prisma.theme.findUnique({
      where: { id: Number(req.params.id) },
      include: { images: true, themeProducts: { include: { product: true } } },
    });
    if (!item) return fail(res, 'Tema bulunamadı.', 404);
    return ok(res, serialize(item));
  } catch (error) {
    next(error);
  }
}

export async function createTheme(req, res, next) {
  try {
    const body = themeSchema.parse(req.body);
    const slug = slugify(body.slug || body.name);
    const item = await prisma.theme.create({
      data: { ...body, slug },
    });
    return ok(res, serialize(item), 'Tema oluşturuldu.', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateTheme(req, res, next) {
  try {
    const body = themeSchema.partial().parse(req.body);
    if (body.slug) body.slug = slugify(body.slug);
    const item = await prisma.theme.update({
      where: { id: Number(req.params.id) },
      data: body,
    });
    return ok(res, serialize(item), 'Tema güncellendi.');
  } catch (error) {
    next(error);
  }
}

export async function deleteTheme(req, res, next) {
  try {
    await prisma.theme.delete({ where: { id: Number(req.params.id) } });
    return ok(res, { id: Number(req.params.id) }, 'Tema silindi.');
  } catch (error) {
    next(error);
  }
}

export async function listProducts(req, res, next) {
  try {
    const q = String(req.query.q || '').trim();
    const where = q
      ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }, { slug: { contains: q } }] }
      : {};
    const items = await prisma.product.findMany({
      where,
      include: {
        category: true,
        color: true,
        images: { take: 1, orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return ok(res, serialize(items));
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    const item = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: { images: true, attributes: true, category: true, color: true, theme: true },
    });
    if (!item) return fail(res, 'Ürün bulunamadı.', 404);
    return ok(res, serialize(item));
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const body = productSchema.parse(req.body);
    const slug = slugify(body.slug || body.name);
    const { images, attributes, ...rest } = body;
    const item = await prisma.product.create({
      data: {
        ...rest,
        slug,
        images: images?.length
          ? {
              create: images.map((img, i) => ({
                url: img.url,
                alt: img.alt || rest.name,
                sortOrder: img.sortOrder ?? i,
                isPrimary: img.isPrimary ?? i === 0,
              })),
            }
          : undefined,
        attributes: attributes?.length
          ? {
              create: attributes.map((attr, i) => ({
                label: attr.label,
                value: attr.value,
                sortOrder: attr.sortOrder ?? i,
              })),
            }
          : undefined,
      },
      include: { images: true, attributes: true },
    });
    return ok(res, serialize(item), 'Ürün oluşturuldu.', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const body = productSchema.partial().parse(req.body);
    if (body.slug) body.slug = slugify(body.slug);
    const { images, attributes, ...rest } = body;
    const id = Number(req.params.id);

    const item = await prisma.$transaction(async (tx) => {
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length) {
          await tx.productImage.createMany({
            data: images.map((img, i) => ({
              productId: id,
              url: img.url,
              alt: img.alt || rest.name || '',
              sortOrder: img.sortOrder ?? i,
              isPrimary: img.isPrimary ?? i === 0,
            })),
          });
        }
      }
      if (attributes) {
        await tx.productAttribute.deleteMany({ where: { productId: id } });
        if (attributes.length) {
          await tx.productAttribute.createMany({
            data: attributes.map((attr, i) => ({
              productId: id,
              label: attr.label,
              value: attr.value,
              sortOrder: attr.sortOrder ?? i,
            })),
          });
        }
      }
      return tx.product.update({
        where: { id },
        data: rest,
        include: { images: true, attributes: true, category: true, color: true },
      });
    });
    return ok(res, serialize(item), 'Ürün güncellendi.');
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    return ok(res, { id: Number(req.params.id) }, 'Ürün silindi.');
  } catch (error) {
    next(error);
  }
}

export async function listCategories(_req, res, next) {
  try {
    const items = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { group: true },
    });
    return ok(res, serialize(items));
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const body = categorySchema.parse(req.body);
    const item = await prisma.category.create({
      data: { ...body, slug: slugify(body.slug || body.name) },
    });
    return ok(res, serialize(item), 'Kategori oluşturuldu.', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const body = categorySchema.partial().parse(req.body);
    if (body.slug) body.slug = slugify(body.slug);
    const item = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: body,
    });
    return ok(res, serialize(item), 'Kategori güncellendi.');
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const count = await prisma.product.count({ where: { categoryId: Number(req.params.id) } });
    if (count > 0) {
      return fail(res, 'Bu kategoriye bağlı ürünler var, önce onları taşı veya sil.', 409);
    }
    await prisma.category.delete({ where: { id: Number(req.params.id) } });
    return ok(res, { id: Number(req.params.id) }, 'Kategori silindi.');
  } catch (error) {
    next(error);
  }
}

export async function listCategoryGroups(_req, res, next) {
  try {
    const items = await prisma.categoryGroup.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { categories: true } } },
    });
    return ok(res, serialize(items));
  } catch (error) {
    next(error);
  }
}

export async function createCategoryGroup(req, res, next) {
  try {
    const body = categoryGroupSchema.parse(req.body);
    const item = await prisma.categoryGroup.create({
      data: { ...body, slug: slugify(body.slug || body.name), isActive: body.isActive ?? true },
    });
    return ok(res, serialize(item), 'Grup oluşturuldu.', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateCategoryGroup(req, res, next) {
  try {
    const body = categoryGroupSchema.partial().parse(req.body);
    if (body.slug) body.slug = slugify(body.slug);
    const item = await prisma.categoryGroup.update({
      where: { id: Number(req.params.id) },
      data: body,
    });
    return ok(res, serialize(item), 'Grup güncellendi.');
  } catch (error) {
    next(error);
  }
}

export async function deleteCategoryGroup(req, res, next) {
  try {
    const id = Number(req.params.id);
    const count = await prisma.category.count({ where: { groupId: id } });
    if (count > 0) {
      await prisma.category.updateMany({ where: { groupId: id }, data: { groupId: null } });
    }
    await prisma.categoryGroup.delete({ where: { id } });
    return ok(res, { id }, 'Grup silindi.');
  } catch (error) {
    next(error);
  }
}

export async function listColors(_req, res, next) {
  try {
    const items = await prisma.color.findMany({ orderBy: { sortOrder: 'asc' } });
    return ok(res, serialize(items));
  } catch (error) {
    next(error);
  }
}

export async function createColor(req, res, next) {
  try {
    const body = colorSchema.parse(req.body);
    const item = await prisma.color.create({
      data: { ...body, slug: slugify(body.slug || body.name) },
    });
    return ok(res, serialize(item), 'Renk oluşturuldu.', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateColor(req, res, next) {
  try {
    const body = colorSchema.partial().parse(req.body);
    if (body.slug) body.slug = slugify(body.slug);
    const item = await prisma.color.update({
      where: { id: Number(req.params.id) },
      data: body,
    });
    return ok(res, serialize(item), 'Renk güncellendi.');
  } catch (error) {
    next(error);
  }
}

export async function deleteColor(req, res, next) {
  try {
    await prisma.color.delete({ where: { id: Number(req.params.id) } });
    return ok(res, { id: Number(req.params.id) }, 'Renk silindi.');
  } catch (error) {
    next(error);
  }
}

const assignSchema = z.object({
  productId: z.number().int().positive(),
  sortOrder: z.number().int().optional(),
  defaultQuantity: z.number().int().min(0).max(99).optional(),
  isRequired: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
});

export async function getThemeProducts(req, res, next) {
  try {
    const themeId = Number(req.params.id);
    const theme = await prisma.theme.findUnique({ where: { id: themeId } });
    if (!theme) return fail(res, 'Tema bulunamadı.', 404);
    const items = await prisma.themeProduct.findMany({
      where: { themeId },
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
            category: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return ok(res, { theme: serialize(theme), items: serialize(items) });
  } catch (error) {
    next(error);
  }
}

export async function assignThemeProduct(req, res, next) {
  try {
    const themeId = Number(req.params.id);
    const body = assignSchema.parse(req.body);
    const item = await prisma.themeProduct.upsert({
      where: {
        themeId_productId: { themeId, productId: body.productId },
      },
      create: {
        themeId,
        productId: body.productId,
        sortOrder: body.sortOrder ?? 0,
        defaultQuantity: body.defaultQuantity ?? 0,
        isRequired: body.isRequired ?? false,
        isRecommended: body.isRecommended ?? false,
      },
      update: {
        sortOrder: body.sortOrder,
        defaultQuantity: body.defaultQuantity,
        isRequired: body.isRequired,
        isRecommended: body.isRecommended,
      },
    });
    return ok(res, serialize(item), 'Ürün temaya atandı.');
  } catch (error) {
    next(error);
  }
}

export async function reorderThemeProducts(req, res, next) {
  try {
    const themeId = Number(req.params.id);
    const schema = z.object({
      items: z.array(
        z.object({
          productId: z.number().int().positive(),
          sortOrder: z.number().int(),
        }),
      ),
    });
    const { items } = schema.parse(req.body);
    await prisma.$transaction(
      items.map((item) =>
        prisma.themeProduct.update({
          where: { themeId_productId: { themeId, productId: item.productId } },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
    return ok(res, { updated: items.length }, 'Sıralama kaydedildi.');
  } catch (error) {
    next(error);
  }
}

export async function removeThemeProduct(req, res, next) {
  try {
    const themeId = Number(req.params.id);
    const productId = Number(req.params.productId);
    await prisma.themeProduct.delete({
      where: { themeId_productId: { themeId, productId } },
    });
    return ok(res, { themeId, productId }, 'Ürün temadan çıkarıldı.');
  } catch (error) {
    next(error);
  }
}

export async function listOrders(req, res, next) {
  try {
    const status = req.query.status;
    const where = status ? { status: String(status) } : {};
    const items = await prisma.order.findMany({
      where,
      include: { customer: true, _count: { select: { items: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, serialize(items));
  } catch (error) {
    next(error);
  }
}

export async function getOrder(req, res, next) {
  try {
    const item = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: { items: true, customer: true, address: true },
    });
    if (!item) return fail(res, 'Sipariş bulunamadı.', 404);
    return ok(res, serialize(item));
  } catch (error) {
    next(error);
  }
}

export async function updateOrder(req, res, next) {
  try {
    const schema = z.object({
      status: z.enum(['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled']),
    });
    const { status } = schema.parse(req.body);
    const item = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status },
    });
    return ok(res, serialize(item), 'Sipariş durumu güncellendi.');
  } catch (error) {
    next(error);
  }
}

export async function listSettings(_req, res, next) {
  try {
    const items = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
    return ok(res, serialize(items));
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const schema = z.object({
      items: z.array(z.object({ key: z.string(), value: z.string() })),
    });
    const { items } = schema.parse(req.body);
    await prisma.$transaction(
      items.map((item) =>
        prisma.siteSetting.upsert({
          where: { key: item.key },
          update: { value: item.value },
          create: { key: item.key, value: item.value },
        }),
      ),
    );
    const all = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
    return ok(res, serialize(all), 'Ayarlar kaydedildi.');
  } catch (error) {
    next(error);
  }
}
