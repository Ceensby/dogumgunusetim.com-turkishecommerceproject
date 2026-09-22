import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Skeleton, Typography } from '@mui/material';
import { imageSizes, imageSrcSet, sizedImageUrl, stripSizeToken } from '../../utils/imageUrl';

function fallbackSrc(src) {
  if (!src) return null;
  const base = stripSizeToken(src);
  if (/\.(jpg|jpeg|png|webp)$/i.test(base)) {
    return base.replace(/\.(jpg|jpeg|png|webp)$/i, '.svg');
  }
  return null;
}

export default function ImageWithFallback({ src, alt, letter, sx, size = 'lg', objectFit = 'cover', ...rest }) {
  const [failed, setFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const sized = useMemo(() => sizedImageUrl(src, size), [src, size]);
  const svgSrc = useMemo(() => fallbackSrc(src), [src]);
  const initial = (letter || alt || '?').trim().charAt(0).toUpperCase();

  useEffect(() => {
    setFailed(false);
    setFallbackFailed(false);
    setLoaded(false);
  }, [sized]);

  if (!src || (failed && (!svgSrc || fallbackFailed))) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.light',
          color: 'white',
          p: 2,
          ...sx,
        }}
        role="img"
        aria-label={alt}
      >
        <Typography sx={{ fontFamily: '"Baloo 2", cursive', fontSize: 40, lineHeight: 1 }}>
          {initial}
        </Typography>
        {alt && (
          <Typography variant="caption" sx={{ textAlign: 'center', mt: 1, opacity: 0.9 }}>
            {alt}
          </Typography>
        )}
      </Box>
    );
  }

  const current = failed && svgSrc ? svgSrc : sized;
  const srcSet = !failed ? imageSrcSet(src) : undefined;

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', ...sx }}>
      {!loaded && (
        <Skeleton
          variant="rectangular"
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
      )}
      <Box
        component="img"
        src={current}
        srcSet={srcSet}
        sizes={imageSizes(size)}
        alt={alt || ''}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!failed) setFailed(true);
          else setFallbackFailed(true);
        }}
        sx={{
          width: '100%',
          height: '100%',
          objectFit,
          display: 'block',
          opacity: loaded ? 1 : 0,
        }}
        {...rest}
      />
    </Box>
  );
}

ImageWithFallback.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  letter: PropTypes.string,
  sx: PropTypes.object,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  objectFit: PropTypes.string,
};
