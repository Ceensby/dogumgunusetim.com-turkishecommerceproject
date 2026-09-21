import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import ImageWithFallback from '../common/ImageWithFallback';
import { TR } from '../../constants/tr';
import { mergeSetBuilderQuantity } from '../../utils/setBuilderStorage';

export default function ThemeSetPromoCard({ themes, productId, quantity, accent }) {
  const list = (themes || []).filter((t) => t?.slug);
  if (!list.length) return null;
  const main = list[0];

  const goBuild = () => {
    mergeSetBuilderQuantity(main.slug, productId, quantity);
  };

  return (
    <Box
      sx={{
        mt: 3,
        p: 2,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${accent || '#7C4DFF'}22, #FF4D8D22)`,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ width: 64, height: 64, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
          <ImageWithFallback src={main.thumbnail} alt={main.name} letter={main.name} size="sm" />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={800}>{TR.product.inSetTitle(main.name)}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {TR.product.inSetBody(main.name)}
          </Typography>
          <Button component={RouterLink} to={`/tema/${main.slug}`} variant="contained" onClick={goBuild} size="small">
            {TR.product.buildSet}
          </Button>
        </Box>
      </Stack>
      {list.length > 1 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
          <Typography variant="caption" sx={{ width: '100%' }}>{TR.product.alsoIn}</Typography>
          {list.slice(1).map((t) => (
            <Chip
              key={t.slug}
              component={RouterLink}
              to={`/tema/${t.slug}`}
              clickable
              label={t.name}
              size="small"
              onClick={() => mergeSetBuilderQuantity(t.slug, productId, quantity)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

ThemeSetPromoCard.propTypes = {
  themes: PropTypes.array,
  productId: PropTypes.number,
  quantity: PropTypes.number,
  accent: PropTypes.string,
};
