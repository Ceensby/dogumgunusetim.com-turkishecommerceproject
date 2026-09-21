import PropTypes from 'prop-types';
import { Box, Button, Stack, Typography } from '@mui/material';
import { TR } from '../../constants/tr';
import { formatPrice } from '../../utils/formatPrice';
import QuantityStepper from '../common/QuantityStepper';

export default function MobileBuyBar({ visible, price, qty, onQty, max, disabled, onAdd }) {
  if (!visible) return null;
  return (
    <Box
      sx={{
        display: { xs: 'block', md: 'none' },
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        p: 1.5,
        pb: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box>
          <Typography fontWeight={800}>{formatPrice(price * qty)}</Typography>
          <QuantityStepper value={qty} min={1} max={max} onChange={onQty} disabled={disabled} />
        </Box>
        <Button variant="contained" fullWidth disabled={disabled} onClick={onAdd}>
          {TR.product.addToCart}
        </Button>
      </Stack>
    </Box>
  );
}

MobileBuyBar.propTypes = {
  visible: PropTypes.bool,
  price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  qty: PropTypes.number,
  onQty: PropTypes.func,
  max: PropTypes.number,
  disabled: PropTypes.bool,
  onAdd: PropTypes.func,
};
