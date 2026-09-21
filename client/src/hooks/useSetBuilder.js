import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PARTY_SIZES } from '../constants/tr';
import {
  flattenGroupedProducts,
  lineTotal,
  matchPartySize,
  quantityForPartySize,
} from '../utils/calcSet';
import { useCartStore } from '../store/cartStore';

function storageKey(slug) {
  return `set-builder-${slug}`;
}

function defaultsFromTheme(products) {
  const qty = {};
  products.forEach((p) => {
    qty[p.id] = Number(p.defaultQuantity) || 0;
  });
  return qty;
}

export function useSetBuilder(theme) {
  const [searchParams] = useSearchParams();
  const setGroupId = searchParams.get('setGroupId');
  const cart = useCartStore((s) => s.cart);
  const products = useMemo(
    () => flattenGroupedProducts(theme?.groupedProducts),
    [theme],
  );

  const [quantities, setQuantities] = useState({});
  const [partySize, setPartySize] = useState('custom');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!theme?.slug || !products.length) return;

    if (setGroupId && cart?.groups) {
      const group = cart.groups.find((g) => g.setGroupId === setGroupId);
      const qty = defaultsFromTheme(products);
      if (group) {
        group.items.forEach((item) => {
          qty[item.productId] = item.quantity;
        });
      }
      setQuantities(qty);
      setPartySize('custom');
      setHydrated(true);
      return;
    }

    try {
      const raw = sessionStorage.getItem(storageKey(theme.slug));
      if (raw) {
        const parsed = JSON.parse(raw);
        setQuantities(parsed.quantities || defaultsFromTheme(products));
        setPartySize(parsed.partySize || 'custom');
        setHydrated(true);
        return;
      }
    } catch (error) {
      console.error('[set] sessionStorage okunamadı', error);
    }

    setQuantities(defaultsFromTheme(products));
    setPartySize('custom');
    setHydrated(true);
  }, [theme?.slug, products, setGroupId, cart]);

  useEffect(() => {
    if (!hydrated || !theme?.slug || setGroupId) return;
    sessionStorage.setItem(
      storageKey(theme.slug),
      JSON.stringify({ quantities, partySize }),
    );
  }, [quantities, partySize, hydrated, theme?.slug, setGroupId]);

  const setQuantity = useCallback((productId, value) => {
    const n = Number.parseInt(String(value), 10);
    const next = Number.isNaN(n) || n < 0 ? 0 : n;
    setQuantities((prev) => ({ ...prev, [productId]: next }));
    setPartySize('custom');
  }, []);

  const applyPartySize = useCallback(
    (size) => {
      const next = {};
      products.forEach((p) => {
        const max = p.trackStock ? p.stock : 99;
        const wanted = quantityForPartySize(p, size);
        next[p.id] = Math.min(wanted, max);
      });
      setQuantities(next);
      setPartySize(size);
    },
    [products],
  );

  const reset = useCallback(() => {
    setQuantities(defaultsFromTheme(products));
    setPartySize('custom');
    if (theme?.slug) sessionStorage.removeItem(storageKey(theme.slug));
  }, [products, theme?.slug]);

  const selected = useMemo(
    () => products.filter((p) => (quantities[p.id] || 0) > 0),
    [products, quantities],
  );

  const subtotal = useMemo(
    () => selected.reduce((sum, p) => sum + lineTotal(p.price, quantities[p.id]), 0),
    [selected, quantities],
  );

  const missingRequired = useMemo(
    () => products.filter((p) => p.isRequired && !(quantities[p.id] > 0)),
    [products, quantities],
  );

  const detectedSize = useMemo(() => {
    if (partySize !== 'custom') return partySize;
    const match = PARTY_SIZES.find((s) => matchPartySize(products, quantities, s));
    return match || 'custom';
  }, [partySize, products, quantities]);

  return {
    products,
    quantities,
    setQuantity,
    partySize: detectedSize,
    applyPartySize,
    reset,
    selected,
    subtotal,
    missingRequired,
    isEditing: Boolean(setGroupId),
    setGroupId,
    hydrated,
  };
}
