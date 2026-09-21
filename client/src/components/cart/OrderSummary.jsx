import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Divider, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { TR, COUPON_HINT } from '../../constants/tr';
import { formatPrice } from '../../utils/formatPrice';
import { useCartStore } from '../../store/cartStore';
import { useSnackbar } from 'notistack';

export default function OrderSummary({ cart, checkout }) {
  const [code, setCode] = useState(cart?.couponCode || '');
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const apply = async () => {
    const next = await applyCoupon(code);
    if (code && next.couponInvalid) {
      enqueueSnackbar(TR.cart.couponFail, { variant: 'warning' });
    } else if (code) {
      enqueueSnackbar(TR.cart.couponOk, { variant: 'success' });
    }
  };

  return (
    <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper', position: { md: 'sticky' }, top: { md: 96 } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {TR.cart.summary}
      </Typography>
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between">
          <span>{TR.cart.subtotal}</span>
          <strong>{formatPrice(cart.subtotal)}</strong>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <span>{TR.cart.shipping}</span>
          <strong>{cart.shippingFee === 0 ? TR.cart.freeShipping : formatPrice(cart.shippingFee)}</strong>
        </Stack>
        {cart.discount > 0 && (
          <Stack direction="row" justifyContent="space-between">
            <span>{TR.cart.discount}</span>
            <strong>-{formatPrice(cart.discount)}</strong>
          </Stack>
        )}
        <Typography variant="caption" color="text.secondary">
          {TR.cart.freeOver(formatPrice(cart.freeShippingThreshold))}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <TextField
          size="small"
          fullWidth
          label={TR.cart.coupon}
          placeholder={COUPON_HINT}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button onClick={apply} variant="outlined">
          {TR.cart.apply}
        </Button>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">{TR.cart.total}</Typography>
        <Typography variant="h6">{formatPrice(cart.total)}</Typography>
      </Stack>
      {!checkout && (
        <Button fullWidth variant="contained" size="large" onClick={() => navigate('/odeme')}>
          {TR.cart.checkout}
        </Button>
      )}
    </Box>
  );
}

OrderSummary.propTypes = {
  cart: PropTypes.object.isRequired,
  checkout: PropTypes.bool,
};
