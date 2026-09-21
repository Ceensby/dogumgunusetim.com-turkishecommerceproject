import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import { formatPrice } from '../../utils/formatPrice';

export default function PriceText({ value, compareAt, variant = 'body1' }) {
  return (
    <Typography component="span" variant={variant} sx={{ fontWeight: 800 }}>
      {formatPrice(value)}
      {compareAt && Number(compareAt) > Number(value) && (
        <Typography
          component="span"
          sx={{ ml: 1, textDecoration: 'line-through', color: 'text.secondary', fontWeight: 500 }}
        >
          {formatPrice(compareAt)}
        </Typography>
      )}
    </Typography>
  );
}

PriceText.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  compareAt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  variant: PropTypes.string,
};
