import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/common/Loader';
import HomePage from './pages/HomePage';
import ThemesPage from './pages/ThemesPage';
import ThemeDetailPage from './pages/ThemeDetailPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryPage from './pages/CategoryPage';
import ColorsPage from './pages/ColorsPage';
import ColorDetailPage from './pages/ColorDetailPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import {
  AboutPage,
  ContactPage,
  DistanceSalesPage,
  FaqPage,
  PrivacyPage,
  ReturnsPage,
  ShippingPage,
} from './pages/StaticPages';
import NotFoundPage from './pages/NotFoundPage';

const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminThemesPage = lazy(() => import('./pages/admin/AdminThemesPage'));
const AdminThemeFormPage = lazy(() => import('./pages/admin/AdminThemeFormPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminProductFormPage = lazy(() => import('./pages/admin/AdminProductFormPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminColorsPage = lazy(() => import('./pages/admin/AdminColorsPage'));
const AdminThemeProductsPage = lazy(() => import('./pages/admin/AdminThemeProductsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

function AdminSuspense({ children }) {
  return <Suspense fallback={<Loader />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/giris" element={<AdminSuspense><AdminLoginPage /></AdminSuspense>} />
      <Route
        path="/admin"
        element={
          <AdminSuspense>
            <ProtectedRoute />
          </AdminSuspense>
        }
      >
        <Route
          element={
            <AdminSuspense>
              <AdminLayout />
            </AdminSuspense>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="temalar" element={<AdminThemesPage />} />
          <Route path="temalar/yeni" element={<AdminThemeFormPage />} />
          <Route path="temalar/:id" element={<AdminThemeFormPage />} />
          <Route path="urunler" element={<AdminProductsPage />} />
          <Route path="urunler/yeni" element={<AdminProductFormPage />} />
          <Route path="urunler/:id" element={<AdminProductFormPage />} />
          <Route path="kategoriler" element={<AdminCategoriesPage />} />
          <Route path="renkler" element={<AdminColorsPage />} />
          <Route path="tema-urun/:themeId" element={<AdminThemeProductsPage />} />
          <Route path="siparisler" element={<AdminOrdersPage />} />
          <Route path="siparisler/:id" element={<AdminOrderDetailPage />} />
          <Route path="ayarlar" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/temalar" element={<ThemesPage />} />
        <Route path="/tema/:slug" element={<ThemeDetailPage />} />
        <Route path="/urun/:slug" element={<ProductDetailPage />} />
        <Route path="/kategori/:slug" element={<CategoryPage />} />
        <Route path="/renkler" element={<ColorsPage />} />
        <Route path="/renk/beyaz" element={<Navigate to="/renk/krem" replace />} />
        <Route path="/renk/lila" element={<Navigate to="/renk/mor" replace />} />
        <Route path="/renk/gri" element={<Navigate to="/renk/gumus" replace />} />
        <Route path="/renk/:slug" element={<ColorDetailPage />} />
        <Route path="/arama" element={<SearchPage />} />
        <Route path="/sepet" element={<CartPage />} />
        <Route path="/odeme" element={<CheckoutPage />} />
        <Route path="/siparis-onay/:orderNumber" element={<OrderConfirmationPage />} />
        <Route path="/hakkimizda" element={<AboutPage />} />
        <Route path="/iletisim" element={<ContactPage />} />
        <Route path="/sss" element={<FaqPage />} />
        <Route path="/kargo-ve-teslimat" element={<ShippingPage />} />
        <Route path="/iade-ve-degisim" element={<ReturnsPage />} />
        <Route path="/gizlilik" element={<PrivacyPage />} />
        <Route path="/mesafeli-satis-sozlesmesi" element={<DistanceSalesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
