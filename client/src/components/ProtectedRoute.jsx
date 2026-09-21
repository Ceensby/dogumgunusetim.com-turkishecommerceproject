import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ADMIN_TOKEN_KEY } from '../constants/tr';
import { adminMe } from '../api/admin';
import Loader from './common/Loader';

export default function ProtectedRoute() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const location = useLocation();
  const query = useQuery({
    queryKey: ['admin-me'],
    queryFn: adminMe,
    enabled: Boolean(token),
    retry: false,
  });

  if (!token) {
    return <Navigate to="/admin/giris" replace state={{ from: location }} />;
  }
  if (query.isLoading) return <Loader />;
  if (query.isError) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    return <Navigate to="/admin/giris" replace />;
  }
  return <Outlet />;
}
