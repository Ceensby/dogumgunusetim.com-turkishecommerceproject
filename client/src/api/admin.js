import { api, unwrap } from './client';

export const adminLogin = (payload) => api.post('/admin/login', payload).then(unwrap);
export const adminMe = () => api.get('/admin/me').then(unwrap);
export const adminStats = () => api.get('/admin/stats').then(unwrap);

export const adminThemes = () => api.get('/admin/themes').then(unwrap);
export const adminTheme = (id) => api.get(`/admin/themes/${id}`).then(unwrap);
export const adminCreateTheme = (payload) => api.post('/admin/themes', payload).then(unwrap);
export const adminUpdateTheme = (id, payload) => api.patch(`/admin/themes/${id}`, payload).then(unwrap);
export const adminDeleteTheme = (id) => api.delete(`/admin/themes/${id}`).then(unwrap);

export const adminProducts = (q) => api.get('/admin/products', { params: { q } }).then(unwrap);
export const adminProduct = (id) => api.get(`/admin/products/${id}`).then(unwrap);
export const adminCreateProduct = (payload) => api.post('/admin/products', payload).then(unwrap);
export const adminUpdateProduct = (id, payload) => api.patch(`/admin/products/${id}`, payload).then(unwrap);
export const adminDeleteProduct = (id) => api.delete(`/admin/products/${id}`).then(unwrap);

export const adminCategories = () => api.get('/admin/categories').then(unwrap);
export const adminCreateCategory = (payload) => api.post('/admin/categories', payload).then(unwrap);
export const adminUpdateCategory = (id, payload) => api.patch(`/admin/categories/${id}`, payload).then(unwrap);
export const adminDeleteCategory = (id) => api.delete(`/admin/categories/${id}`).then(unwrap);

export const adminColors = () => api.get('/admin/colors').then(unwrap);
export const adminCreateColor = (payload) => api.post('/admin/colors', payload).then(unwrap);
export const adminUpdateColor = (id, payload) => api.patch(`/admin/colors/${id}`, payload).then(unwrap);
export const adminDeleteColor = (id) => api.delete(`/admin/colors/${id}`).then(unwrap);

export const adminThemeProducts = (id) => api.get(`/admin/themes/${id}/products`).then(unwrap);
export const adminAssignProduct = (id, payload) => api.post(`/admin/themes/${id}/products`, payload).then(unwrap);
export const adminReorderProducts = (id, items) =>
  api.patch(`/admin/themes/${id}/products/reorder`, { items }).then(unwrap);
export const adminRemoveThemeProduct = (id, productId) =>
  api.delete(`/admin/themes/${id}/products/${productId}`).then(unwrap);

export const adminOrders = (status) => api.get('/admin/orders', { params: { status } }).then(unwrap);
export const adminOrder = (id) => api.get(`/admin/orders/${id}`).then(unwrap);
export const adminUpdateOrder = (id, status) => api.patch(`/admin/orders/${id}`, { status }).then(unwrap);

export const adminSettings = () => api.get('/admin/settings').then(unwrap);
export const adminUpdateSettings = (items) => api.patch('/admin/settings', { items }).then(unwrap);

export async function adminUpload(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post('/admin/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap(res);
}
