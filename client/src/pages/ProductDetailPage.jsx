import { useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Breadcrumbs, Box, Container, Grid, Skeleton, Typography } from '@mui/material';
import { useProduct } from '../hooks/useProduct';
import { useSettings } from '../hooks/useTheme';
import SeoHead from '../components/common/SeoHead';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import ProductGallery from '../components/product/ProductGallery';
import ProductInfoPanel from '../components/product/ProductInfoPanel';
import ProductTabs from '../components/product/ProductTabs';
import RelatedThemeProducts from '../components/product/RelatedThemeProducts';
import MobileBuyBar from '../components/product/MobileBuyBar';
import { TR } from '../constants/tr';
import { useCartStore } from '../store/cartStore';
import { useUiStore } from '../store/uiStore';
import { useSnackbar } from 'notistack';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const query = useProduct(slug);
  const { data: settings } = useSettings();
  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);
  const { enqueueSnackbar } = useSnackbar();
  const [qty, setQty] = useState(1);
  const [barVisible, setBarVisible] = useState(false);
  const addRef = useRef(null);
  const p = query.data;

  useEffect(() => {
    setQty(1);
  }, [slug]);

  useEffect(() => {
    if (!addRef.current) return undefined;
    const io = new IntersectionObserver(([entry]) => setBarVisible(!entry.isIntersecting), { threshold: 0.2 });
    io.observe(addRef.current);
    return () => io.disconnect();
  }, [p?.id]);

  const themes = useMemo(() => {
    const fromJoin = (p?.themeProducts || []).map((tp) => tp.theme).filter((t) => t?.isActive !== false);
    if (p?.theme && !fromJoin.some((t) => t.id === p.theme.id)) return [p.theme, ...fromJoin];
    return fromJoin.length ? fromJoin : p?.theme ? [p.theme] : [];
  }, [p]);

  const accent = themes[0]?.primaryColor;
  const soldOut = p?.trackStock && p.stock <= 0;

  if (query.isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}><Skeleton variant="rounded" height={480} /></Grid>
          <Grid item xs={12} md={5}>
            <Skeleton height={48} />
            <Skeleton height={80} />
            <Skeleton height={120} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (query.isError) {
    return <Container sx={{ py: 4 }}><ErrorState onRetry={query.refetch} /></Container>;
  }

  if (!p) {
    return (
      <Container sx={{ py: 8 }}>
        <EmptyState title="Ürün bulunamadı" hint="Bu ürün yayında değil veya kaldırılmış." actionLabel={TR.cart.browse} onAction={() => { window.location.href = '/temalar'; }} />
      </Container>
    );
  }

  const desc =
    p.description ||
    `${p.name}, ${themes[0]?.name || ''} temalı ${p.category?.name?.toLowerCase() || 'parti ürünü'}. ${p.unitLabel} olarak satılır.`;

  const discount =
    p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price)
      ? Math.round((1 - Number(p.price) / Number(p.compareAtPrice)) * 100)
      : null;
  const badges = [
    themes[0] && { label: TR.product.themeChip(themes[0].name), color: 'primary' },
    p.trackStock && p.stock > 0 && p.stock <= 5 && { label: TR.product.lastLeft(p.stock), color: 'warning' },
    discount && { label: TR.product.off(discount), color: 'secondary' },
  ].filter(Boolean);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      image: p.images?.[0]?.url,
      sku: p.sku,
      description: desc,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'TRY',
        price: p.price,
        availability: soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: TR.product.home, item: '/' },
        { '@type': 'ListItem', position: 2, name: TR.nav.themes, item: '/temalar' },
        themes[0] && { '@type': 'ListItem', position: 3, name: themes[0].name, item: `/tema/${themes[0].slug}` },
        { '@type': 'ListItem', position: 4, name: p.name },
      ].filter(Boolean),
    },
  ];

  const addToCart = async () => {
    try {
      await addItem({ productId: p.id, quantity: qty });
      openCartDrawer();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Eklenemedi', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, pb: { xs: 14, md: 6 } }}>
      <SeoHead
        title={p.seoTitle || p.name}
        description={p.seoDescription || desc}
        image={p.images?.[0]?.url}
        path={`/urun/${p.slug}`}
        jsonLd={jsonLd}
      />
      <Breadcrumbs sx={{ mb: 3 }}>
        <Typography component={RouterLink} to="/" color="inherit" sx={{ textDecoration: 'none' }}>{TR.product.home}</Typography>
        <Typography component={RouterLink} to="/temalar" color="inherit" sx={{ textDecoration: 'none' }}>{TR.nav.themes}</Typography>
        {themes[0] && (
          <Typography component={RouterLink} to={`/tema/${themes[0].slug}`} color="inherit" sx={{ textDecoration: 'none' }}>
            {themes[0].name}
          </Typography>
        )}
        <Typography color="text.primary">{p.name}</Typography>
      </Breadcrumbs>
      <Box sx={{ bgcolor: accent ? `${accent}14` : 'transparent', borderRadius: 4, p: { xs: 0, md: 1 } }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6} lg={7}>
            <ProductGallery images={p.images} name={`${p.name}, ${p.unitLabel}`} badges={badges} accent={accent} />
          </Grid>
          <Grid item xs={12} md={6} lg={5}>
            <ProductInfoPanel
              product={p}
              qty={qty}
              onQty={setQty}
              themes={themes}
              accent={accent}
              addRef={addRef}
              settings={settings}
            />
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ mt: 6 }}>
        <ProductTabs
          attributes={p.attributes}
          description={desc}
          shippingText={[settings?.shipping_text, settings?.returns_text].filter(Boolean).join('\n\n')}
        />
      </Box>
      <RelatedThemeProducts products={p.relatedProducts || []} theme={themes[0]} fromTheme={themes[0]?.slug} />
      <MobileBuyBar
        visible={barVisible}
        price={p.price}
        qty={qty}
        onQty={setQty}
        max={p.trackStock ? p.stock : 99}
        disabled={soldOut}
        onAdd={addToCart}
      />
    </Container>
  );
}
