import { api, unwrap } from './client';

export const fetchThemes = (params) => api.get('/themes', { params }).then(unwrap);
export const fetchTheme = (slug) => api.get(`/themes/${slug}`).then(unwrap);
export const fetchCategories = () => api.get('/categories').then(unwrap);
export const fetchColors = () => api.get('/colors').then(unwrap);
export const fetchProducts = (params) => api.get('/products', { params }).then(unwrap);
export const fetchProduct = (slug) => api.get(`/products/${slug}`).then(unwrap);
export const fetchCategory = (slug, params) => api.get(`/categories/${slug}`, { params }).then(unwrap);
export const fetchColor = (slug, params) => api.get(`/colors/${slug}`, { params }).then(unwrap);
export const fetchSearch = (q) => api.get('/search', { params: { q } }).then(unwrap);
export const fetchSettings = () => api.get('/settings').then(unwrap);
