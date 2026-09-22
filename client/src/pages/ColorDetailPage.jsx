import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Chip, Container, Stack, Typography } from '@mui/material';
import { fetchColor } from '../api/catalog';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '../components/product/ProductCard';
import SeoHead from '../components/common/SeoHead';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { CategoryGroupIcon } from '../utils/categoryIcons';

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
    const ungrouped = [];
    for (const p of items) {
      const group = p.category?.group;
      if (!group || !group.isActive) {
        ungrouped.push(p);
        continue;
      }
      if (!map.has(group.id)) {
        map.set(group.id, {
          id: group.id,
          slug: group.slug,
          name: group.name,
          iconName: group.iconName,
          sortOrder: group.sortOrder ?? 99,
          items: [],
        });
      }
      map.get(group.id).items.push(p);
    }
    for (const g of map.values()) {
      g.items.sort((a, b) => (a.category?.sortOrder ?? 99) - (b.category?.sortOrder ?? 99) || a.name.localeCompare(b.name, 'tr'));
    }
    const listed = [...map.values()].sort((a, b) => a.sortOrder - b.sortOrder);
    if (ungrouped.length) {
      ungrouped.sort((a, b) => (a.category?.sortOrder ?? 99) - (b.category?.sortOrder ?? 99));
      listed.push({
        id: 'diger',
        slug: 'diger',
        name: 'Diğer',
        iconName: 'Category',
        sortOrder: 99,
        items: ungrouped,
      });
    }
    return listed;
  }, [items]);

  const scrollTo = (id) => {
    if (!id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <SeoHead title={color?.name || 'Renk'} path={`/renk/${slug}`} />
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: color?.hexCode || '#ddd',
            border: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        />
        <Box>
          <Typography variant="h2" sx={{ mb: 0, lineHeight: 1.15 }}>
            {color?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {items.length} ürün
          </Typography>
        </Box>
      </Stack>
      {query.isError && <ErrorState onRetry={query.refetch} />}
      {!query.isLoading && items.length === 0 && <EmptyState title="Bu renkte ürün yok" />}
      {groups.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: 'sticky',
            top: { xs: 56, md: 72 },
            zIndex: 8,
            bgcolor: 'background.default',
            py: 1,
            mb: 1.5,
            overflowX: 'auto',
          }}
        >
          <Chip label="Tümü" onClick={() => scrollTo(null)} clickable />
          {groups.map((g) => (
            <Chip key={g.slug} label={g.name} onClick={() => scrollTo(`renk-grup-${g.slug}`)} clickable />
          ))}
        </Stack>
      )}
      {groups.map((group) => (
        <Box
          key={group.slug}
          id={`renk-grup-${group.slug}`}
          sx={{ scrollMarginTop: { xs: 112, md: 132 }, mb: 2.5 }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <CategoryGroupIcon name={group.iconName} fontSize="small" color="primary" />
            <Typography variant="h5">{group.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {group.items.length}
            </Typography>
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(3, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
                lg: 'repeat(5, minmax(0, 1fr))',
              },
              gap: 1.25,
            }}
          >
            {group.items.map((p) => (
              <ProductCard key={p.id} product={p} compact quickAdd />
            ))}
          </Box>
        </Box>
      ))}
    </Container>
  );
}
