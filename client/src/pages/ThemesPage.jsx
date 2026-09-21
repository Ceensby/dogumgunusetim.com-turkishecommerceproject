import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Container, Skeleton, TextField, Grid } from '@mui/material';
import { fetchThemes } from '../api/catalog';
import { TR } from '../constants/tr';
import SeoHead from '../components/common/SeoHead';
import ThemeGrid from '../components/theme/ThemeGrid';
import ThemeFilters from '../components/theme/ThemeFilters';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { useDebounce } from '../hooks/useDebounce';

export default function ThemesPage() {
  const [params, setParams] = useSearchParams();
  const gender = params.get('gender') || '';
  const ageGroup = params.get('ageGroup') || '';
  const q = params.get('q') || '';
  const limit = Number(params.get('limit') || 12);
  const debouncedQ = useDebounce(q, 300);

  const query = useQuery({
    queryKey: ['themes', { gender, ageGroup, q: debouncedQ, limit }],
    queryFn: () =>
      fetchThemes({
        active: true,
        gender: gender || undefined,
        ageGroup: ageGroup || undefined,
        q: debouncedQ || undefined,
        page: 1,
        limit,
      }),
  });

  const setFilter = (next) => {
    const n = new URLSearchParams();
    if (next.gender) n.set('gender', next.gender);
    if (next.ageGroup) n.set('ageGroup', next.ageGroup);
    if (q) n.set('q', q);
    setParams(n);
  };

  const items = query.data?.items || [];
  const title = useMemo(() => TR.nav.themes, []);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <SeoHead title={title} description="Tüm doğum günü temalarını keşfet." path="/temalar" />
      <TextField
        fullWidth
        sx={{ mb: 2 }}
        label={TR.common.search}
        value={q}
        onChange={(e) => {
          const n = new URLSearchParams(params);
          if (e.target.value) n.set('q', e.target.value);
          else n.delete('q');
          n.delete('page');
          setParams(n);
        }}
      />
      <ThemeFilters value={{ gender, ageGroup }} onChange={setFilter} />
      {query.isLoading && (
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Skeleton variant="rounded" height={240} />
            </Grid>
          ))}
        </Grid>
      )}
      {query.isError && <ErrorState onRetry={() => query.refetch()} />}
      {!query.isLoading && items.length === 0 && <EmptyState title="Tema bulunamadı" />}
      {items.length > 0 && (
        <ThemeGrid
          items={items}
          hasMore={items.length < (query.data?.total || 0)}
          onLoadMore={() => {
            const n = new URLSearchParams(params);
            n.set('limit', String(limit + 12));
            setParams(n);
          }}
        />
      )}
    </Container>
  );
}
