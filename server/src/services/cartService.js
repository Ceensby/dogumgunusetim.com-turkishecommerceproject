import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma.js';
import { createHttpError } from '../middleware/errorHandler.js';
import { serialize, toNumber } from '../utils/response.js';
import { summarizeItems } from './pricingService.js';

const productInclude = {
  images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
  category: true,
  color: true,
};

async function getOrCreateCart(sessionId) {
  return prisma.cart.upsert({
    where: { sessionId },
    update: { updatedAt: new Date() },
    create: { sessionId },
  });
}

function assertStock(product, quantity) {
  if (!product.trackStock) return;
  if (product.stock < quantity) {
    throw createHttpError(
      409,
      `"${product.name}" için yeterli stok yok. Kalan: ${product.stock}.`,
      { productId: product.id, available: product.stock, requested: quantity },
    );
  }
}

async function loadProducts(ids) {
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, isActive: true },
    include: productInclude,
  });
  const map = new Map(products.map((p) => [p.id, p]));
  return { products, map };
}

export async function getCartBySession(sessionId, couponCode) {
  const cart = await getOrCreateCart(sessionId);
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      product: { include: productInclude },
      theme: {
        select: { id: true, slug: true, name: true, title: true, thumbnail: true, primaryColor: true },
      },
    },
    orderBy: { addedAt: 'asc' },
  });

  const groupsMap = new Map();
  const ungroupedItems = [];

  for (const item of items) {
    const serialized = serialize(item);
    if (item.setGroupId) {
      if (!groupsMap.has(item.setGroupId)) {
        groupsMap.set(item.setGroupId, {
          setGroupId: item.setGroupId,
          setName: item.setName || 'Parti Seti',
          themeId: item.themeId,
          theme: serialized.theme,
          items: [],
          total: 0,
        });
      }
      const group = groupsMap.get(item.setGroupId);
      group.items.push(serialized);
      group.total += toNumber(item.unitPriceSnapshot) * item.quantity;
    } else {
      ungroupedItems.push(serialized);
    }
  }

  const groups = Array.from(groupsMap.values()).map((g) => ({
    ...g,
    total: Math.round(g.total * 100) / 100,
    itemCount: g.items.reduce((n, i) => n + i.quantity, 0),
  }));

  const nameSeen = {};
  for (const group of groups) {
    const base = group.setName || 'Parti Seti';
    nameSeen[base] = (nameSeen[base] || 0) + 1;
    group.displayName = nameSeen[base] > 1 ? `${base} (${nameSeen[base]})` : base;
  }

  const summary = await summarizeItems(items, couponCode);
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  return serialize({
    id: cart.id,
    sessionId: cart.sessionId,
    items: serialize(items),
    groups,
    ungroupedItems,
    itemCount,
    ...summary,
  });
}

export async function addSet(sessionId, payload) {
  const { themeId, setName, setGroupId, items } = payload;
  console.log('[sepet] add-set başladı', { themeId, setGroupId, itemCount: items?.length });

  const filtered = (items || []).filter((i) => i.quantity > 0);
  if (!filtered.length) {
    throw createHttpError(400, 'Sete eklenecek en az bir ürün seçmelisin.');
  }

  const ids = filtered.map((i) => i.productId);
  const { map } = await loadProducts(ids);

  for (const line of filtered) {
    const product = map.get(line.productId);
    if (!product) {
      throw createHttpError(400, `Ürün bulunamadı (id: ${line.productId}).`);
    }
    assertStock(product, line.quantity);
  }

  const cart = await getOrCreateCart(sessionId);
  const groupId = setGroupId || randomUUID();

  const created = await prisma.$transaction(async (tx) => {
    const rows = [];
    for (const line of filtered) {
      const product = map.get(line.productId);
      const row = await tx.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: line.quantity,
          unitPriceSnapshot: product.price,
          themeId: themeId ?? null,
          setGroupId: groupId,
          setName: setName || 'Parti Seti',
        },
        include: { product: { include: productInclude } },
      });
      rows.push(row);
    }
    return rows;
  });

  console.log('[sepet] add-set tamamlandı', { setGroupId: groupId, created: created.length });
  return getCartBySession(sessionId);
}

export async function addItem(sessionId, { productId, quantity = 1, themeId, setGroupId, setName }) {
  if (!productId || quantity < 1) {
    throw createHttpError(400, 'Geçerli bir ürün ve adet gerekli.');
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
    include: productInclude,
  });
  if (!product) throw createHttpError(404, 'Ürün bulunamadı.');
  assertStock(product, quantity);

  const cart = await getOrCreateCart(sessionId);

  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      setGroupId: setGroupId || null,
    },
  });

  if (existing && !setGroupId) {
    const nextQty = existing.quantity + quantity;
    assertStock(product, nextQty);
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQty, unitPriceSnapshot: product.price },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        unitPriceSnapshot: product.price,
        themeId: themeId ?? null,
        setGroupId: setGroupId || null,
        setName: setName || null,
      },
    });
  }

  console.log('[sepet] tekil ürün eklendi', { productId, quantity });
  return getCartBySession(sessionId);
}

export async function updateItem(sessionId, itemId, quantity) {
  const cart = await getOrCreateCart(sessionId);
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { product: true },
  });
  if (!item) throw createHttpError(404, 'Sepet satırı bulunamadı.');

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
    console.log('[sepet] satır silindi (adet 0)', { itemId });
    return getCartBySession(sessionId);
  }

  assertStock(item.product, quantity);
  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity, unitPriceSnapshot: item.product.price },
  });
  return getCartBySession(sessionId);
}

export async function deleteItem(sessionId, itemId) {
  const cart = await getOrCreateCart(sessionId);
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
  });
  if (!item) throw createHttpError(404, 'Sepet satırı bulunamadı.');
  await prisma.cartItem.delete({ where: { id: item.id } });
  return getCartBySession(sessionId);
}

export async function updateSet(sessionId, setGroupId, items) {
  console.log('[sepet] set güncelleniyor', { setGroupId, itemCount: items?.length });
  const cart = await getOrCreateCart(sessionId);
  const existing = await prisma.cartItem.findMany({
    where: { cartId: cart.id, setGroupId },
  });
  if (!existing.length) {
    throw createHttpError(404, 'Güncellenecek set grubu bulunamadı.');
  }

  const meta = existing[0];
  const filtered = (items || []).filter((i) => i.quantity > 0);
  const ids = filtered.map((i) => i.productId);
  const { map } = await loadProducts(ids);

  for (const line of filtered) {
    const product = map.get(line.productId);
    if (!product) throw createHttpError(400, `Ürün bulunamadı (id: ${line.productId}).`);
    assertStock(product, line.quantity);
  }

  await prisma.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({ where: { cartId: cart.id, setGroupId } });
    for (const line of filtered) {
      const product = map.get(line.productId);
      await tx.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: line.quantity,
          unitPriceSnapshot: product.price,
          themeId: meta.themeId,
          setGroupId,
          setName: meta.setName,
        },
      });
    }
  });

  console.log('[sepet] set güncellendi', { setGroupId });
  return getCartBySession(sessionId);
}

export async function deleteSet(sessionId, setGroupId) {
  const cart = await getOrCreateCart(sessionId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, setGroupId } });
  return getCartBySession(sessionId);
}

export async function clearCart(sessionId) {
  const cart = await getOrCreateCart(sessionId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return getCartBySession(sessionId);
}
