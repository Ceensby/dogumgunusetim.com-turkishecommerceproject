import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Dialog, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ImageWithFallback from '../common/ImageWithFallback';
import { TR } from '../../constants/tr';

export default function ProductLightbox({ open, images, index, name, onClose, onIndex }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onIndex((index + images.length - 1) % images.length);
      if (e.key === 'ArrowRight') onIndex((index + 1) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, images.length, onClose, onIndex]);

  const current = images[index];
  if (!current) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{ position: 'relative', bgcolor: 'background.paper', p: 1 }}>
        <IconButton aria-label={TR.common.close} onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
          <CloseIcon />
        </IconButton>
        {images.length > 1 && (
          <>
            <IconButton
              aria-label="Önceki görsel"
              onClick={() => onIndex((index + images.length - 1) % images.length)}
              sx={{ position: 'absolute', left: 8, top: '50%', zIndex: 2 }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              aria-label="Sonraki görsel"
              onClick={() => onIndex((index + 1) % images.length)}
              sx={{ position: 'absolute', right: 8, top: '50%', zIndex: 2 }}
            >
              <ChevronRightIcon />
            </IconButton>
          </>
        )}
        <Box sx={{ aspectRatio: '1 / 1', maxHeight: '80vh' }}>
          <ImageWithFallback src={current.url} alt={current.alt || name} letter={name} objectFit="contain" size="lg" />
        </Box>
      </Box>
    </Dialog>
  );
}

ProductLightbox.propTypes = {
  open: PropTypes.bool,
  images: PropTypes.array,
  index: PropTypes.number,
  name: PropTypes.string,
  onClose: PropTypes.func,
  onIndex: PropTypes.func,
};
