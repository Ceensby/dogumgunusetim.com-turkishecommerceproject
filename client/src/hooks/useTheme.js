import { useQuery } from '@tanstack/react-query';
import { fetchTheme, fetchSettings, fetchThemes } from '../api/catalog';

export function useThemeDetail(slug) {
  return useQuery({
    queryKey: ['theme', slug],
    queryFn: () => fetchTheme(slug),
    enabled: Boolean(slug),
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 60_000,
  });
}

export function useThemeList(params) {
  return useQuery({
    queryKey: ['themes', params],
    queryFn: () => fetchTheme(params).catch(() => fetchThemes(params)),
    enabled: false,
  });
}
