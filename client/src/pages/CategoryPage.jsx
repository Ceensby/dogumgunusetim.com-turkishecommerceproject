import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Container, Grid, Skeleton, Typography } from '@mui/material';
import { fetchCategory } from '../api/catalog';
import ProductCard from '../components/product/ProductCard';
import SeoHead from '../components/common/SeoHead';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';

export default function CategoryPage() {
  const { slug } = useParams();
  const query = useQuery({ queryKey: ['category', slug], queryFn: () => fetchCategory(slug) });
  const items = query.data?.items || [];
  const category = query.data?.category;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SeoHead title={category?.name || 'Kategori'} description={category?.description} path={`/kategori/${slug}`} />
      <Typography variant="h2" sx={{ mb: 3 }}>
        {category?.pluralName || category?.name || 'Kategori'}
      </Typography>
      {query.isLoading && (
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={6} md={3} key={i}><Skeleton height={240} variant="rounded" /></Grid>
          ))}
        </Grid>
      )}
      {query.isError && <ErrorState onRetry={query.refetch} />}
      {!query.isLoading && items.length === 0 && <EmptyState title="Bu kategoride henüz ürün yok" hint="Admin panelinden ürün ekleyebilirsin." />}
      <Grid container spacing={2}>
        {items.map((p) => (
          <Grid item xs={6} md={3} key={p.id}>
            <ProductCard product={p} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
