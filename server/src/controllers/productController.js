import { prisma } from '../lib/prisma.js';
import { serialize } from '../utils/response.js';

const productInclude = {
  images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
  attributes: { orderBy: { sortOrder: 'asc' } },
  category: { include: { group: true } },
  color: true,
  theme: {
    select: { id: true, slug: true, name: true, title: true, primaryColor: true, thumbnail: true },
  },
};

export async function listProducts(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(48, Math.max(1, Number(query.limit) || 12));
  const skip = (page - 1) * limit;

  const where = { isActive: true };
  if (query.themeId) where.themeId = Number(query.themeId);
  if (query.categoryId) where.categoryId = Number(query.categoryId);
  if (query.colorId) where.colorId = Number(query.colorId);
  if (query.q) {
    const q = String(query.q);
    where.OR = [
      { name: { contains: q } },
      { sku: { contains: q } },
      { description: { contains: q } },
    ];
  }

  let orderBy = [{ sortOrder: 'asc' }, { name: 'asc' }];
  if (query.sort === 'price_asc') orderBy = [{ price: 'asc' }];
  if (query.sort === 'price_desc') orderBy = [{ price: 'desc' }];
  if (query.sort === 'newest') orderBy = [{ createdAt: 'desc' }];

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: serialize(items),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProductBySlug(slug) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      ...productInclude,
      themeProducts: {
        include: {
          theme: {
            select: {
              id: true,
              slug: true,
              name: true,
              title: true,
              thumbnail: true,
              primaryColor: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  if (!product || !product.isActive) return null;

  const themeIds = product.themeProducts
    .filter((tp) => tp.theme?.isActive)
    .map((tp) => tp.theme.id);
  const primaryThemeId = product.themeId || themeIds[0];

  let relatedProducts = [];
  if (primaryThemeId) {
    const relatedLinks = await prisma.themeProduct.findMany({
      where: {
        themeId: primaryThemeId,
        productId: { not: product.id },
        product: { isActive: true },
      },
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
            category: { include: { group: true } },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
      take: 8,
    });
    relatedProducts = relatedLinks.map((tp) => tp.product);
  }

  return serialize({ ...product, relatedProducts });
}

export async function listByCategorySlug(slug, query) {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category || !category.isActive) return null;
  const data = await listProducts({ ...query, categoryId: category.id });
  return { category: serialize(category), ...data };
}

export async function listByColorSlug(slug, query) {
  const aliases = { beyaz: 'krem', lila: 'mor', gri: 'gumus' };
  const resolved = aliases[slug] || slug;
  const color = await prisma.color.findUnique({ where: { slug: resolved } });
  if (!color || !color.isActive) return null;
  const data = await listProducts({ ...query, colorId: color.id, limit: query.limit || 48 });
  return { color: serialize(color), ...data };
}
