import PropTypes from 'prop-types';
import { IconButton, Stack, Typography, Box } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import QuantityStepper from '../common/QuantityStepper';
import ImageWithFallback from '../common/ImageWithFallback';
import { formatPrice } from '../../utils/formatPrice';
import { primaryImageUrl } from '../../utils/imageUrl';
import { useCartStore } from '../../store/cartStore';

export default function CartLineItem({ item, compact }) {
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const img = primaryImageUrl(item.product);
  const max = item.product?.trackStock ? item.product.stock : 99;

  return (
    <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ py: 0.5 }}>
      <Box sx={{ width: compact ? 48 : 64, height: compact ? 48 : 64, borderRadius: 1, overflow: 'hidden', flexShrink: 0 }}>
        <ImageWithFallback src={img} alt={item.product?.name} letter={item.product?.name} size="sm" objectFit="contain" />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap fontWeight={600}>
          {item.product?.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatPrice(item.unitPriceSnapshot)}
        </Typography>
        <QuantityStepper
          value={item.quantity}
          max={max}
          onChange={(q) => updateItem(item.id, q)}
        />
      </Box>
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography fontWeight={700} variant="body2">
          {formatPrice(item.unitPriceSnapshot * item.quantity)}
        </Typography>
        <IconButton aria-label="Kaldır" onClick={() => removeItem(item.id)} size="small">
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Box>
    </Stack>
  );
}

CartLineItem.propTypes = {
  item: PropTypes.object.isRequired,
  compact: PropTypes.bool,
};
