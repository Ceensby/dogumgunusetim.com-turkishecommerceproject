import { useQuery } from '@tanstack/react-query';
import { fetchProduct } from '../api/catalog';

export function useProduct(slug) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug),
    enabled: Boolean(slug),
  });
}
