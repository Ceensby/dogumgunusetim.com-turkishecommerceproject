import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Typography } from '@mui/material';
import { fetchColor } from '../api/catalog';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '../components/product/ProductCard';
import SeoHead from '../components/common/SeoHead';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';

export default function ColorDetailPage() {
  const { slug } = useParams();
  const query = useQuery({
    queryKey: ['color', slug],
    queryFn: () => fetchColor(slug, { limit: 48 }),
  });
  const items = query.data?.items || [];
  const color = query.data?.color;

  const groups = useMemo(() => {
    const map = new Map();
    for (const p of items) {
      const title = p.category?.pluralName || p.category?.name || 'Diğer';
      if (!map.has(title)) {
        map.set(title, {
          title,
          sortOrder: p.category?.sortOrder ?? 99,
          items: [],
        });
      }
      const group = map.get(title);
      group.items.push(p);
      group.sortOrder = Math.min(group.sortOrder, p.category?.sortOrder ?? 99);
    }
    return [...map.values()].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [items]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SeoHead title={color?.name || 'Renk'} path={`/renk/${slug}`} />
      <Typography variant="h2" sx={{ mb: 3 }}>
        {color?.name}
      </Typography>
      {query.isError && <ErrorState onRetry={query.refetch} />}
      {!query.isLoading && items.length === 0 && <EmptyState title="Bu renkte ürün yok" />}
      {groups.map((group) => (
        <div key={group.title}>
          <Typography variant="h5" sx={{ mb: 2, mt: 1 }}>
            {group.title}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {group.items.map((p) => (
              <Grid item xs={6} md={3} key={p.id}>
                <ProductCard product={p} />
              </Grid>
            ))}
          </Grid>
        </div>
      ))}
    </Container>
  );
}
