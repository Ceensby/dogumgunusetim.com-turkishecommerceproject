import { useRef, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Container,
  Grid,
  Skeleton,
  ThemeProvider,
  createTheme,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSnackbar } from 'notistack';
import { fetchThemes } from '../api/catalog';
import { useThemeDetail, useSettings } from '../hooks/useTheme';
import { useSetBuilder } from '../hooks/useSetBuilder';
import { useCartStore } from '../store/cartStore';
import { useUiStore } from '../store/uiStore';
import { TR } from '../constants/tr';
import { formatPrice } from '../utils/formatPrice';
import baseTheme from '../theme/theme';
import SeoHead from '../components/common/SeoHead';
import ThemeHero from '../components/theme/ThemeHero';
import ThemeCard from '../components/theme/ThemeCard';
import CategoryGroup from '../components/product/CategoryGroup';
import PartySizeSelector from '../components/setbuilder/PartySizeSelector';
import SetSummaryPanel from '../components/setbuilder/SetSummaryPanel';
import MobileSummaryBar from '../components/setbuilder/MobileSummaryBar';
import ErrorState from '../components/common/ErrorState';

export default function ThemeDetailPage() {
  const { slug } = useParams();
  const { data: theme, isLoading, isError, refetch } = useThemeDetail(slug);
  const { data: settings } = useSettings();
  const builder = useSetBuilder(theme);
  const addSet = useCartStore((s) => s.addSet);
  const updateSet = useCartStore((s) => s.updateSet);
  const refresh = useCartStore((s) => s.refresh);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const listRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const relatedQuery = useQuery({
    queryKey: ['related-themes', theme?.gender, theme?.ageGroup],
    queryFn: () =>
      fetchThemes({
        active: true,
        gender: theme?.gender,
        ageGroup: theme?.ageGroup,
        limit: 8,
      }),
    enabled: Boolean(theme),
  });

  if (isLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <Skeleton variant="rounded" height={420} />
      </Container>
    );
  }
  if (isError || !theme) {
    return (
      <Container sx={{ py: 4 }}>
        <ErrorState onRetry={refetch} />
      </Container>
    );
  }

  const accent = theme.primaryColor || baseTheme.palette.primary.main;
  const themed = createTheme(baseTheme, {
    palette: {
      primary: { main: accent, contrastText: '#fff' },
    },
  });

  const shippingHint = settings
    ? TR.cart.freeOver(formatPrice(settings.free_shipping_threshold))
    : '';

  const faq = (() => {
    try {
      return JSON.parse(settings?.faq_json || '[]');
    } catch {
      return [];
    }
  })();

  const related = (relatedQuery.data?.items || []).filter((t) => t.slug !== theme.slug).slice(0, 4);

  const summaryProps = {
    theme,
    selected: builder.selected,
    quantities: builder.quantities,
    totalProducts: builder.products.length,
    subtotal: builder.subtotal,
    shippingHint,
    missingRequired: builder.missingRequired,
    isEditing: builder.isEditing,
    loading: saving,
    onComplete: handleComplete,
    onReset: builder.reset,
  };

  async function handleComplete() {
    const items = builder.selected.map((p) => ({
      productId: p.id,
      quantity: builder.quantities[p.id],
    }));
    if (!items.length) return;
    setSaving(true);
    try {
      if (builder.isEditing) {
        await updateSet(builder.setGroupId, items);
        enqueueSnackbar(TR.theme.update, { variant: 'success' });
        await refresh();
        navigate('/sepet');
      } else {
        const setGroupId = crypto.randomUUID();
        console.log('[set] tamamlanıyor', { themeId: theme.id, setGroupId, items });
        await addSet({
          themeId: theme.id,
          setName: `${theme.name} Set`,
          setGroupId,
          items,
        });
        enqueueSnackbar(TR.theme.added(`${theme.name} Setin`), { variant: 'success' });
        openCartDrawer();
      }
    } catch (error) {
      console.error('[set] tamamlama hatası', error);
      enqueueSnackbar(error.response?.data?.error || 'Sepete eklenemedi', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  }

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: theme.title,
      description: theme.shortDescription,
      image: theme.heroImage,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana sayfa', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'Temalar', item: '/temalar' },
        { '@type': 'ListItem', position: 3, name: theme.name },
      ],
    },
  ];

  return (
    <ThemeProvider theme={themed}>
      <Box sx={{ '--theme-accent': accent, pb: { xs: 12, md: 6 } }}>
        <SeoHead
          title={theme.seoTitle || theme.title}
          description={theme.seoDescription || theme.shortDescription}
          image={theme.heroImage}
          path={`/tema/${theme.slug}`}
          jsonLd={jsonLd}
        />
        <ThemeHero theme={theme} onScrollToProducts={() => listRef.current?.scrollIntoView({ behavior: 'smooth' })} />
        <Container maxWidth="lg" sx={{ py: 4 }} ref={listRef}>
          <PartySizeSelector
            value={builder.partySize}
            onChange={(size) => {
              if (size === 'custom') return;
              builder.applyPartySize(size);
            }}
          />
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {(theme.groupedProducts || []).filter((group) => group.products?.length).map((group) => (
                <CategoryGroup
                  key={group.category.id}
                  group={group}
                  quantities={builder.quantities}
                  onQuantity={builder.setQuantity}
                  accent={accent}
                  themeSlug={theme.slug}
                />
              ))}
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
              <SetSummaryPanel {...summaryProps} />
            </Grid>
          </Grid>

          {related.length > 0 && (
            <Box sx={{ mt: 8 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>
                {TR.theme.related}
              </Typography>
              <Grid container spacing={2}>
                {related.map((t) => (
                  <Grid item xs={6} md={3} key={t.id}>
                    <ThemeCard theme={t} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {faq.length > 0 && (
            <Box sx={{ mt: 6 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>
                {TR.theme.faq}
              </Typography>
              {faq.map((item) => (
                <Accordion key={item.q}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>{item.q}</AccordionSummary>
                  <AccordionDetails>{item.a}</AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </Container>
        <MobileSummaryBar {...summaryProps} />
      </Box>
    </ThemeProvider>
  );
}
