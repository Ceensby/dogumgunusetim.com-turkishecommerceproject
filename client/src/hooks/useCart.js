import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchCart } from '../api/cart';
import { useCartStore } from '../store/cartStore';

export function useCart() {
  const cart = useCartStore((s) => s.cart);
  const coupon = useCartStore((s) => s.coupon);
  const setCart = useCartStore((s) => s.setCart);
  const refresh = useCartStore((s) => s.refresh);

  const query = useQuery({
    queryKey: ['cart', coupon],
    queryFn: () => fetchCart(coupon || undefined),
  });

  useEffect(() => {
    if (query.data) setCart(query.data);
  }, [query.data, setCart]);

  return {
    cart: query.data || cart,
    isLoading: query.isLoading,
    error: query.error,
    refresh,
    itemCount: (query.data || cart)?.itemCount || 0,
  };
}
