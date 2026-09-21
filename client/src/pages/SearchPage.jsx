import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Container, Grid, TextField, Typography } from '@mui/material';
import { fetchSearch } from '../api/catalog';
import { useDebounce } from '../hooks/useDebounce';
import ThemeCard from '../components/theme/ThemeCard';
import ProductCard from '../components/product/ProductCard';
import SeoHead from '../components/common/SeoHead';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const debounced = useDebounce(q, 300);
  const query = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => fetchSearch(debounced),
    enabled: debounced.length >= 2,
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SeoHead title="Arama" path="/arama" />
      <TextField
        fullWidth
        autoFocus
        label="Ara"
        value={q}
        onChange={(e) => setParams({ q: e.target.value })}
        sx={{ mb: 3 }}
      />
      {query.isLoading && <Loader />}
      {debounced.length >= 2 && query.data && !query.data.themes.length && !query.data.products.length && (
        <EmptyState title="Sonuç yok" hint="Başka bir tema adı dene — örn. Unicorn" />
      )}
      {query.data?.themes?.length > 0 && (
        <>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Temalar
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {query.data.themes.map((t) => (
              <Grid item xs={6} md={3} key={t.id}>
                <ThemeCard theme={t} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
      {query.data?.products?.length > 0 && (
        <>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Ürünler
          </Typography>
          <Grid container spacing={2}>
            {query.data.products.map((p) => (
              <Grid item xs={6} md={3} key={p.id}>
                <ProductCard product={p} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
}
