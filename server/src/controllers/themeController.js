import { prisma } from '../lib/prisma.js';
import { serialize } from '../utils/response.js';

const themeCardSelect = {
  id: true,
  slug: true,
  name: true,
  title: true,
  shortDescription: true,
  thumbnail: true,
  heroImage: true,
  heroAspectRatio: true,
  primaryColor: true,
  secondaryColor: true,
  gender: true,
  ageGroup: true,
  tags: true,
  isFeatured: true,
  sortOrder: true,
};

function parseBool(value) {
  if (value === true || value === 'true' || value === '1') return true;
  if (value === false || value === 'false' || value === '0') return false;
  return undefined;
}

export async function listThemes(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(48, Math.max(1, Number(query.limit) || 12));
  const skip = (page - 1) * limit;

  const where = {};
  const active = parseBool(query.active);
  if (active !== undefined) where.isActive = active;
  else where.isActive = true;

  if (parseBool(query.featured) === true) where.isFeatured = true;
  if (query.gender) where.gender = query.gender;
  if (query.ageGroup) where.ageGroup = query.ageGroup;
  if (query.q) {
    const q = String(query.q);
    where.OR = [
      { name: { contains: q } },
      { title: { contains: q } },
      { tags: { contains: q } },
      { shortDescription: { contains: q } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.theme.findMany({
      where,
      select: themeCardSelect,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      skip,
      take: limit,
    }),
    prisma.theme.count({ where }),
  ]);

  return {
    items: serialize(items),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getThemeBySlug(slug) {
  const theme = await prisma.theme.findUnique({
    where: { slug },
    include: {
      images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      themeProducts: {
        include: {
          product: {
            include: {
              images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
              category: true,
              color: true,
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!theme || !theme.isActive) return null;

  const categoryMap = new Map();
  for (const tp of theme.themeProducts) {
    if (!tp.product?.isActive) continue;
    const cat = tp.product.category;
    if (!categoryMap.has(cat.id)) {
      categoryMap.set(cat.id, {
        category: serialize(cat),
        products: [],
      });
    }
    categoryMap.get(cat.id).products.push(
      serialize({
        ...tp.product,
        defaultQuantity: tp.defaultQuantity,
        isRequired: tp.isRequired,
        isRecommended: tp.isRecommended,
        themeProductSortOrder: tp.sortOrder,
      }),
    );
  }

  const groupedProducts = Array.from(categoryMap.values())
    .filter((group) => group.products.length > 0)
    .sort((a, b) => (a.category.sortOrder ?? 0) - (b.category.sortOrder ?? 0));

  const { themeProducts, ...rest } = theme;
  return serialize({
    ...rest,
    groupedProducts,
    productCount: themeProducts.filter((tp) => tp.product?.isActive).length,
  });
}
