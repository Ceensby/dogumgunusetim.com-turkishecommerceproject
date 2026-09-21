import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import ImageWithFallback from '../common/ImageWithFallback';
import PriceText from '../common/PriceText';

export default function ProductCard({ product, fromTheme, compact }) {
  const img = product.images?.[0]?.url;
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        component={RouterLink}
        to={`/urun/${product.slug}`}
        state={fromTheme ? { fromTheme } : undefined}
        sx={{ aspectRatio: '1 / 1', overflow: 'hidden', bgcolor: 'background.paper' }}
      >
        <ImageWithFallback src={img} alt={product.name} letter={product.name} size="md" objectFit="contain" />
      </Box>
      <CardContent sx={{ flex: 1 }}>
        <Typography
          variant={compact ? 'subtitle1' : 'h6'}
          component={RouterLink}
          to={`/urun/${product.slug}`}
          state={fromTheme ? { fromTheme } : undefined}
          sx={{ textDecoration: 'none', color: 'inherit' }}
        >
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.unitLabel}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <PriceText value={product.price} compareAt={product.compareAtPrice} />
        </Box>
        {!compact && (
          <Button component={RouterLink} to={`/urun/${product.slug}`} state={fromTheme ? { fromTheme } : undefined} sx={{ mt: 1 }} fullWidth>
            İncele
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

ProductCard.propTypes = {
  product: PropTypes.object.isRequired,
  fromTheme: PropTypes.string,
  compact: PropTypes.bool,
};
