import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, Stack } from '@mui/material';
import ImageWithFallback from '../common/ImageWithFallback';
import ProductLightbox from './ProductLightbox';

export default function ProductGallery({ images, name, badges, accent }) {
  const list = images?.length ? images : [{ url: null, alt: name }];
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState('center center');
  const [lightbox, setLightbox] = useState(false);
  const current = list[active] || list[0];

  return (
    <>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Box
          sx={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            aspectRatio: '1 / 1',
            bgcolor: 'background.paper',
            boxShadow: 1,
            cursor: 'zoom-in',
            '& img': {
              transition: 'transform 200ms ease',
              transformOrigin: origin,
            },
            '&:hover img': { transform: 'scale(1.55)' },
            '@media (prefers-reduced-motion: reduce)': {
              '&:hover img': { transform: 'none' },
            },
          }}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
          }}
          onClick={() => setLightbox(true)}
        >
          <ImageWithFallback src={current.url} alt={current.alt || name} letter={name} objectFit="contain" size="lg" />
          <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}>
            {badges?.map((b) => (
              <Chip key={b.label} size="small" label={b.label} color={b.color || 'primary'} sx={{ bgcolor: b.bg || accent }} />
            ))}
          </Stack>
        </Box>
        {list.length > 1 && (
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            {list.map((img, i) => (
              <Box
                key={img.id || i}
                onClick={() => setActive(i)}
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 2,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: i === active ? accent || 'primary.main' : 'divider',
                }}
              >
                <ImageWithFallback src={img.url} alt={img.alt || name} size="sm" objectFit="contain" />
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Box
          sx={{
            display: 'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            borderRadius: '24px',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {list.map((img) => (
            <Box key={img.id || img.url} sx={{ minWidth: '100%', scrollSnapAlign: 'start', aspectRatio: '1 / 1', bgcolor: 'background.paper' }}>
              <ImageWithFallback src={img.url} alt={img.alt || name} letter={name} objectFit="contain" size="lg" />
            </Box>
          ))}
        </Box>
        {list.length > 1 && (
          <Stack direction="row" justifyContent="center" spacing={0.5} sx={{ mt: 1 }}>
            {list.map((img, i) => (
              <Box key={img.id || i} sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: i === active ? 'primary.main' : 'divider' }} />
            ))}
          </Stack>
        )}
      </Box>

      <ProductLightbox
        open={lightbox}
        images={list}
        index={active}
        name={name}
        onClose={() => setLightbox(false)}
        onIndex={setActive}
      />
    </>
  );
}

ProductGallery.propTypes = {
  images: PropTypes.array,
  name: PropTypes.string,
  badges: PropTypes.array,
  accent: PropTypes.string,
};
