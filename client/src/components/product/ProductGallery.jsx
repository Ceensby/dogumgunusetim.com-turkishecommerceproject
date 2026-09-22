import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, Stack } from '@mui/material';
import ImageWithFallback from '../common/ImageWithFallback';
import ProductLightbox from './ProductLightbox';

function sortGallery(images, name) {
  if (!images?.length) return [{ url: null, alt: name }];
  return [...images].sort((a, b) => {
    if (Boolean(b.isPrimary) !== Boolean(a.isPrimary)) return a.isPrimary ? -1 : 1;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });
}

export default function ProductGallery({ images, name, badges, accent }) {
  const list = useMemo(() => sortGallery(images, name), [images, name]);
  const signature = list.map((img) => img.id || img.url || '').join('|');
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState('center center');
  const [lightbox, setLightbox] = useState(false);
  const scrollerRef = useRef(null);

  useEffect(() => {
    setActive(0);
    const el = scrollerRef.current;
    if (el) el.scrollTo({ left: 0 });
  }, [signature]);

  const safeIndex = list.length ? Math.min(Math.max(active, 0), list.length - 1) : 0;
  const current = list[safeIndex] || list[0];

  const goTo = (index) => {
    if (!list.length) return;
    const next = (index + list.length) % list.length;
    setActive(next);
    const el = scrollerRef.current;
    if (el) el.scrollTo({ left: el.clientWidth * next, behavior: 'smooth' });
  };

  const onMobileScroll = (e) => {
    const el = e.currentTarget;
    const width = el.clientWidth || 1;
    const i = Math.round(el.scrollLeft / width);
    if (i !== safeIndex && i >= 0 && i < list.length) setActive(i);
  };

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
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.5, position: 'relative', zIndex: 2 }}>
            {list.map((img, i) => (
              <Box
                key={img.id || img.url || i}
                component="button"
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${name} görsel ${i + 1}`}
                aria-current={i === safeIndex ? 'true' : undefined}
                sx={{
                  width: 72,
                  height: 72,
                  p: 0,
                  borderRadius: 2,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: i === safeIndex ? accent || 'primary.main' : 'divider',
                  bgcolor: 'background.paper',
                  flexShrink: 0,
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
          ref={scrollerRef}
          onScroll={onMobileScroll}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            borderRadius: '24px',
            width: '100%',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {list.map((img, i) => (
            <Box
              key={img.id || img.url || i}
              onClick={() => setLightbox(true)}
              sx={{
                flex: '0 0 100%',
                width: '100%',
                minWidth: '100%',
                scrollSnapAlign: 'start',
                aspectRatio: '1 / 1',
                bgcolor: 'background.paper',
                cursor: 'zoom-in',
              }}
            >
              <ImageWithFallback src={img.url} alt={img.alt || name} letter={name} objectFit="contain" size="lg" />
            </Box>
          ))}
        </Box>
        {list.length > 1 && (
          <Stack direction="row" justifyContent="center" spacing={0.5} sx={{ mt: 1 }}>
            {list.map((img, i) => (
              <Box
                key={img.id || img.url || i}
                component="button"
                type="button"
                aria-label={`Görsel ${i + 1}`}
                onClick={() => goTo(i)}
                sx={{
                  width: 8,
                  height: 8,
                  p: 0,
                  border: 0,
                  borderRadius: '50%',
                  bgcolor: i === safeIndex ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Stack>
        )}
      </Box>

      <ProductLightbox
        open={lightbox}
        images={list}
        index={safeIndex}
        name={name}
        onClose={() => setLightbox(false)}
        onIndex={goTo}
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
