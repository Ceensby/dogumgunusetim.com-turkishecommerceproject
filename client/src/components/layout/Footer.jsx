import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Grid, IconButton, Stack, Typography } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { TR } from '../../constants/tr';
import { useSettings } from '../../hooks/useTheme';

export default function Footer() {
  const { data: settings } = useSettings();
  const year = new Date().getFullYear();

  const cols = [
    {
      title: TR.footer.corporate,
      links: [
        { to: '/hakkimizda', label: TR.footer.about },
        { to: '/iletisim', label: TR.footer.contact },
        { to: '/gizlilik', label: TR.footer.privacy },
        { to: '/mesafeli-satis-sozlesmesi', label: TR.footer.distance },
      ],
    },
    {
      title: TR.footer.help,
      links: [
        { to: '/sss', label: TR.footer.faq },
        { to: '/kargo-ve-teslimat', label: TR.footer.shipping },
        { to: '/iade-ve-degisim', label: TR.footer.returns },
      ],
    },
    {
      title: TR.footer.categories,
      links: [
        { to: '/kategori/karton-tabak', label: 'Tabak' },
        { to: '/kategori/karton-bardak', label: 'Bardak' },
        { to: '/kategori/masa-ortusu', label: 'Masa örtüsü' },
        { to: '/kategori/flama', label: 'Flama' },
      ],
    },
  ];

  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', mt: { xs: 6, md: 10 }, py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {cols.map((col) => (
            <Grid item xs={6} md={3} key={col.title}>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                {col.title}
              </Typography>
              <Stack spacing={1}>
                {col.links.map((l) => (
                  <Typography
                    key={l.to}
                    component={RouterLink}
                    to={l.to}
                    color="text.secondary"
                    sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                  >
                    {l.label}
                  </Typography>
                ))}
              </Stack>
            </Grid>
          ))}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              {TR.footer.contact}
            </Typography>
            <Typography color="text.secondary">{settings?.contact_email}</Typography>
            <Typography color="text.secondary">{settings?.contact_phone}</Typography>
            <Stack direction="row" sx={{ mt: 1 }}>
              {settings?.instagram && (
                <IconButton
                  aria-label="Instagram"
                  href={`https://instagram.com/${settings.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <InstagramIcon />
                </IconButton>
              )}
              {settings?.whatsapp && (
                <IconButton
                  aria-label="WhatsApp"
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <WhatsAppIcon />
                </IconButton>
              )}
            </Stack>
          </Grid>
        </Grid>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          © {year} {TR.brand} — {TR.footer.rights}
        </Typography>
      </Container>
    </Box>
  );
}
