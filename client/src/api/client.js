import axios from 'axios';
import { ADMIN_TOKEN_KEY, CART_SESSION_KEY } from '../constants/tr';

function ensureSession() {
  let id = localStorage.getItem(CART_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CART_SESSION_KEY, id);
  }
  return id;
}

export const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  config.headers['X-Cart-Session'] = ensureSession();
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    const sid = res.headers?.['x-cart-session'];
    if (sid) localStorage.setItem(CART_SESSION_KEY, sid);
    return res;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'İstek başarısız.';
    console.error('[api]', message, error.response?.data);
    return Promise.reject(error);
  },
);

export function unwrap(response) {
  return response.data?.data;
}
