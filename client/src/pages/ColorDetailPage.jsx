import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Container, Grid, Typography } from '@mui/material';
import { fetchColor } from '../api/catalog';
import ProductCard from '../components/product/ProductCard';
import SeoHead from '../components/common/SeoHead';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';

export default function ColorDetailPage() {
  const { slug } = useParams();
  const query = useQuery({ queryKey: ['color', slug], queryFn: () => fetchColor(slug) });
  const items = query.data?.items || [];
  const color = query.data?.color;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SeoHead title={color?.name || 'Renk'} path={`/renk/${slug}`} />
      <Typography variant="h2" sx={{ mb: 3 }}>
        {color?.name}
      </Typography>
      {query.isError && <ErrorState onRetry={query.refetch} />}
      {!query.isLoading && items.length === 0 && <EmptyState title="Bu renkte ürün yok" />}
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
