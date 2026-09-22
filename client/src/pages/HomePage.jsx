import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ReplayIcon from '@mui/icons-material/Replay';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CelebrationIcon from '@mui/icons-material/Celebration';
import TuneIcon from '@mui/icons-material/Tune';
import HomeIcon from '@mui/icons-material/Home';
import { fetchCategories, fetchColors, fetchThemes } from '../api/catalog';

function isLightHex(hex) {
  const h = String(hex || '').replace('#', '');
  if (h.length !== 6) return false;
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 200;
}
import { TR, PAGE_SIZE } from '../constants/tr';
import { useSettings } from '../hooks/useTheme';
import SeoHead from '../components/common/SeoHead';
import ThemeGrid from '../components/theme/ThemeGrid';
import ConfettiBg from '../components/home/ConfettiBg';
import ErrorState from '../components/common/ErrorState';

const FILTER_CHIPS = [
  { label: TR.filters.girl, to: '/temalar?gender=kiz&ageGroup=cocuk' },
  { label: TR.filters.boy, to: '/temalar?gender=erkek&ageGroup=cocuk' },
  { label: TR.filters.baby, to: '/temalar?ageGroup=bebek' },
  { label: TR.filters.unisex, to: '/temalar?gender=unisex' },
  { label: TR.filters.adult, to: '/temalar?ageGroup=yetiskin' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { data: settings } = useSettings();
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);

  const themesQuery = useQuery({
    queryKey: ['themes-home', limit],
    queryFn: () => fetchThemes({ active: true, limit, page: 1 }),
  });
  const catsQuery = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const colorsQuery = useQuery({ queryKey: ['colors'], queryFn: fetchColors });

  const items = themesQuery.data?.items || [];
  const hasMore = (themesQuery.data?.total || 0) > items.length;

  const trust = useMemo(
    () => [
      { icon: <LocalShippingIcon />, label: TR.home.trustShip },
      { icon: <VerifiedUserIcon />, label: TR.home.trustPay },
      { icon: <ReplayIcon />, label: TR.home.trustReturn },
      { icon: <WhatsAppIcon />, label: TR.home.trustWhatsapp },
    ],
    [],
  );

  return (
    <>
      <SeoHead
        title={settings?.site_name || TR.brand}
        description={settings?.site_tagline || TR.hero.cta}
        path="/"
      />
      <Box sx={{ position: 'relative', py: { xs: 6, md: 10 } }}>
        <ConfettiBg />
        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center' }}>
          <Typography variant="h1" sx={{ mb: 2 }}>
            {settings?.homepage_hero_title || TR.hero.cta}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, fontSize: { xs: 16, md: 18 } }}>
            {settings?.homepage_hero_subtitle}
          </Typography>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) navigate(`/arama?q=${encodeURIComponent(q.trim())}`);
            }}
          >
            <TextField
              fullWidth
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={TR.hero.searchPlaceholder}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Button component={RouterLink} to="/temalar" variant="contained" size="large" sx={{ mt: 3 }}>
            {TR.hero.cta}
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center" sx={{ mb: 6 }}>
          {FILTER_CHIPS.map((c) => (
            <Chip key={c.label} label={c.label} component={RouterLink} to={c.to} clickable />
          ))}
        </Stack>

        <Typography variant="h2" sx={{ mb: 3 }}>
          {TR.home.allThemes}
        </Typography>
        {themesQuery.isLoading && (
          <Grid container spacing={2}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Skeleton variant="rounded" height={260} />
              </Grid>
            ))}
          </Grid>
        )}
        {themesQuery.isError && <ErrorState onRetry={() => themesQuery.refetch()} />}
        {items.length > 0 && (
          <ThemeGrid items={items} hasMore={hasMore} onLoadMore={() => setLimit((n) => n + PAGE_SIZE)} />
        )}
      </Container>

      <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" sx={{ mb: 4 }}>
            {TR.how.title}
          </Typography>
          <Grid container spacing={3}>
            {[
              { icon: <CelebrationIcon color="primary" />, t: TR.how.step1Title, d: TR.how.step1 },
              { icon: <TuneIcon color="secondary" />, t: TR.how.step2Title, d: TR.how.step2 },
              { icon: <HomeIcon color="success" />, t: TR.how.step3Title, d: TR.how.step3 },
            ].map((s) => (
              <Grid item xs={12} md={4} key={s.t}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  {s.icon}
                  <Typography variant="h5" sx={{ mt: 1 }}>
                    {s.t}
                  </Typography>
                  <Typography color="text.secondary">{s.d}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h2" sx={{ mb: 3 }}>
          {TR.home.shopByCategory}
        </Typography>
        <Grid container spacing={2}>
          {(catsQuery.data || []).map((c) => (
            <Grid item xs={6} sm={4} md={3} key={c.id}>
              <Paper
                component={RouterLink}
                to={`/kategori/${c.slug}`}
                sx={{
                  p: 2,
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 200ms ease',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <Typography fontWeight={700}>{c.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {c.unitLabel}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 10 } }}>
        <Typography variant="h2" sx={{ mb: 3 }}>
          {TR.home.solidColors}
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          {(colorsQuery.data || []).map((c) => (
            <Box
              key={c.id}
              component={RouterLink}
              to={`/renk/${c.slug}`}
              aria-label={c.name}
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: c.hexCode,
                border: '2px solid',
                borderColor: isLightHex(c.hexCode) ? 'divider' : 'transparent',
                boxShadow: 1,
              }}
            />
          ))}
        </Stack>
      </Container>

      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 3 }}>
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {trust.map((t) => (
              <Grid item xs={6} md={3} key={t.label}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                  {t.icon}
                  <Typography fontWeight={700}>{t.label}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
}
