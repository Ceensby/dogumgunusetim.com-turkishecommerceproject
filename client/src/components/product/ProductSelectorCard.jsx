import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, Chip, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageWithFallback from '../common/ImageWithFallback';
import QuantityStepper from '../common/QuantityStepper';
import PriceText from '../common/PriceText';
import { formatPrice } from '../../utils/formatPrice';
import { lineTotal } from '../../utils/calcSet';
import { TR } from '../../constants/tr';
import { primaryImageUrl } from '../../utils/imageUrl';

export default function ProductSelectorCard({ product, quantity, onQuantity, accent, themeSlug }) {
  const img = primaryImageUrl(product);
  const soldOut = product.trackStock && product.stock <= 0;
  const max = product.trackStock ? product.stock : 99;
  const included = quantity > 0;
  const total = lineTotal(product.price, quantity);

  return (
    <Card
      sx={{
        p: 2,
        opacity: soldOut ? 0.5 : included ? 1 : 0.55,
        border: '2px solid',
        borderColor: soldOut ? 'divider' : included ? accent || 'primary.main' : '#c5c0ce',
        position: 'relative',
        bgcolor: soldOut ? 'action.hover' : 'background.paper',
      }}
    >
      {included && (
        <CheckCircleIcon
          aria-label={TR.theme.included}
          sx={{ position: 'absolute', top: 12, right: 12, color: accent || 'primary.main' }}
        />
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Box
          component={RouterLink}
          to={`/urun/${product.slug}`}
          state={themeSlug ? { fromTheme: themeSlug } : undefined}
          sx={{ width: { xs: '100%', sm: 140 }, height: 140, borderRadius: 2, overflow: 'hidden', flexShrink: 0, bgcolor: 'background.paper' }}
        >
          <ImageWithFallback src={img} alt={product.name} letter={product.name} size="md" objectFit="contain" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to={`/urun/${product.slug}`}
            state={themeSlug ? { fromTheme: themeSlug } : undefined}
            sx={{ textDecoration: 'none', color: 'inherit' }}
          >
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {product.description}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
            <Chip size="small" label={product.unitLabel} />
            {product.isRecommended && <Chip size="small" color="secondary" label={TR.theme.recommended} />}
            {soldOut && <Chip size="small" label={TR.theme.soldOut} />}
            {!included && !soldOut && (
              <Chip size="small" variant="outlined" label={TR.theme.notInSet} />
            )}
          </Stack>
          <PriceText value={product.price} compareAt={product.compareAtPrice} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mt: 1.5 }}>
            <QuantityStepper
              value={quantity}
              onChange={onQuantity}
              max={max}
              disabled={soldOut}
            />
            {included && (
              <Typography variant="body2" color="text.secondary">
                {quantity} × {formatPrice(product.price)} = {formatPrice(total)}
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

ProductSelectorCard.propTypes = {
  product: PropTypes.object.isRequired,
  quantity: PropTypes.number.isRequired,
  onQuantity: PropTypes.func.isRequired,
  accent: PropTypes.string,
  themeSlug: PropTypes.string,
};
