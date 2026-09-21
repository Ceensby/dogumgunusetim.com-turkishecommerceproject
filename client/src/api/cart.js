import { api, unwrap } from './client';

export const fetchCart = (coupon) => api.get('/cart', { params: coupon ? { coupon } : {} }).then(unwrap);
export const addSetToCart = (payload) => api.post('/cart/add-set', payload).then(unwrap);
export const addCartItem = (payload) => api.post('/cart/items', payload).then(unwrap);
export const updateCartItem = (id, quantity) => api.patch(`/cart/items/${id}`, { quantity }).then(unwrap);
export const deleteCartItem = (id) => api.delete(`/cart/items/${id}`).then(unwrap);
export const updateCartSet = (setGroupId, items) =>
  api.patch(`/cart/set/${setGroupId}`, { items }).then(unwrap);
export const deleteCartSet = (setGroupId) => api.delete(`/cart/set/${setGroupId}`).then(unwrap);
export const clearCartApi = () => api.delete('/cart').then(unwrap);
export const createOrder = (payload) => api.post('/orders', payload).then((res) => res.data);
export const fetchOrder = (orderNumber) => api.get(`/orders/${orderNumber}`).then(unwrap);
