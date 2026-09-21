import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { formatPrice } from '../../utils/formatPrice';
import { TR } from '../../constants/tr';

export default function ProductPrice({ price, compareAt, packSize, unitLabel }) {
  const per = packSize > 1 ? Number(price) / packSize : null;
  const discount =
    compareAt && Number(compareAt) > Number(price)
      ? Math.round((1 - Number(price) / Number(compareAt)) * 100)
      : null;

  return (
    <Box sx={{ my: 2 }}>
      <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: 'primary.main', lineHeight: 1.1 }}>
        {formatPrice(price)}
        {compareAt && Number(compareAt) > Number(price) && (
          <Typography component="span" sx={{ ml: 1.5, fontSize: '1rem', color: 'text.secondary', textDecoration: 'line-through', fontWeight: 500 }}>
            {formatPrice(compareAt)}
          </Typography>
        )}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {TR.product.perPiece(unitLabel, formatPrice(per || price))}
        {discount ? ` · ${TR.product.off(discount)}` : ''}
      </Typography>
    </Box>
  );
}

ProductPrice.propTypes = {
  price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  compareAt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  packSize: PropTypes.number,
  unitLabel: PropTypes.string,
};
