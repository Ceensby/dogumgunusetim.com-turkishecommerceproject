import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as cartApi from '../api/cart';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: null,
      coupon: '',
      loading: false,
      error: null,

      setCart: (cart) => set({ cart, error: null }),

      refresh: async () => {
        set({ loading: true });
        try {
          const cart = await cartApi.fetchCart(get().coupon || undefined);
          set({ cart, loading: false, error: null });
          return cart;
        } catch (error) {
          console.error('[sepet] yenileme hatası', error);
          set({ loading: false, error: error.response?.data?.error || 'Sepet yüklenemedi.' });
          throw error;
        }
      },

      addSet: async (payload) => {
        console.log('[sepet] set ekleniyor', payload);
        const cart = await cartApi.addSetToCart(payload);
        set({ cart });
        return cart;
      },

      updateSet: async (setGroupId, items) => {
        console.log('[sepet] set güncelleniyor', { setGroupId, items });
        const cart = await cartApi.updateCartSet(setGroupId, items);
        set({ cart });
        return cart;
      },

      addItem: async (payload) => {
        const cart = await cartApi.addCartItem(payload);
        set({ cart });
        return cart;
      },

      updateItem: async (id, quantity) => {
        const cart = await cartApi.updateCartItem(id, quantity);
        set({ cart });
        return cart;
      },

      removeItem: async (id) => {
        const cart = await cartApi.deleteCartItem(id);
        set({ cart });
        return cart;
      },

      removeSet: async (setGroupId) => {
        const cart = await cartApi.deleteCartSet(setGroupId);
        set({ cart });
        return cart;
      },

      applyCoupon: async (code) => {
        set({ coupon: code });
        const cart = await cartApi.fetchCart(code || undefined);
        set({ cart });
        return cart;
      },

      clear: async () => {
        const cart = await cartApi.clearCartApi();
        set({ cart, coupon: '' });
        return cart;
      },
    }),
    {
      name: 'dgs-cart-ui',
      partialize: (state) => ({ coupon: state.coupon, cart: state.cart }),
    },
  ),
);
