import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Dialog, Skeleton, Stack, Typography } from '@mui/material';
import ImageWithFallback from '../common/ImageWithFallback';
import { TR } from '../../constants/tr';

export default function ThemeHero({ theme, onScrollToProducts }) {
  const [lightbox, setLightbox] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(!theme.heroImage);
  const images = theme.images?.length
    ? theme.images
    : [{ url: theme.heroImage, alt: theme.title, isPrimary: true }];
  const accent = theme.primaryColor || '#C77DFF';
  const aspectRatio = theme.heroAspectRatio || '16 / 5';

  useEffect(() => {
    setLoaded(false);
    setFailed(!theme.heroImage);
  }, [theme.heroImage]);

  return (
    <>
      <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 }, pb: { xs: 2, md: 7 } }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto', position: 'relative' }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio,
              borderRadius: { xs: 2, md: '24px' },
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${accent} 0%, ${theme.secondaryColor || '#1F1B2E'} 100%)`,
            }}
          >
            {!failed && theme.heroImage && (
              <Box
                component="img"
                src={theme.heroImage}
                alt={theme.title}
                onLoad={() => setLoaded(true)}
                onError={() => setFailed(true)}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block',
                }}
              />
            )}
            {!loaded && !failed && (
              <Skeleton
                variant="rectangular"
                animation="wave"
                sx={{ position: 'absolute', inset: 0, height: '100%' }}
              />
            )}
          </Box>
          {images.length > 1 && (
            <Stack direction="row" spacing={1} sx={{ py: 2, overflowX: 'auto' }}>
              {images.map((img) => (
                <Box
                  key={img.id || img.url}
                  onClick={() => setLightbox(img)}
                  sx={{
                    width: 88,
                    height: 64,
                    flex: '0 0 auto',
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: 'divider',
                  }}
                >
                  <ImageWithFallback src={img.url} alt={img.alt || theme.name} />
                </Box>
              ))}
            </Stack>
          )}
          <Box
            sx={{
              maxWidth: 900,
              mx: 'auto',
              mt: { xs: 2, md: '-40px' },
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: 3,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ width: 4, flexShrink: 0, bgcolor: accent }} aria-hidden />
            <Box sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 2.5, md: 3 }, flex: 1 }}>
              <Typography variant="h1" sx={{ mb: 1 }}>
                {theme.title}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {theme.shortDescription}
              </Typography>
              <Button variant="contained" color="secondary" onClick={onScrollToProducts}>
                {TR.theme.buildCta}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
      <Dialog open={Boolean(lightbox)} onClose={() => setLightbox(null)} maxWidth="md">
        {lightbox && (
          <Box sx={{ width: { xs: 320, sm: 560, md: 800 }, height: 480 }}>
            <ImageWithFallback src={lightbox.url} alt={lightbox.alt || theme.name} />
          </Box>
        )}
      </Dialog>
    </>
  );
}

ThemeHero.propTypes = {
  theme: PropTypes.object.isRequired,
  onScrollToProducts: PropTypes.func,
};
