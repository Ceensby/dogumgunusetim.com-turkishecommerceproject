import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import { useSnackbar } from 'notistack';
import QuantityStepper from '../common/QuantityStepper';
import ImageWithFallback from '../common/ImageWithFallback';
import ProductPrice from './ProductPrice';
import ThemeSetPromoCard from './ThemeSetPromoCard';
import { TR } from '../../constants/tr';
import { formatPrice } from '../../utils/formatPrice';
import { useCartStore } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';

export default function ProductInfoPanel({ product, qty, onQty, themes, accent, addRef, settings }) {
  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);
  const { enqueueSnackbar } = useSnackbar();
  const [added, setAdded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const soldOut = product.trackStock && product.stock <= 0;
  const max = product.trackStock ? product.stock : 99;
  const pieces = qty * (product.packSize || 1);
  const fromTheme = location.state?.fromTheme || themes[0]?.slug;

  const addToCart = async () => {
    try {
      await addItem({ productId: product.id, quantity: qty });
      enqueueSnackbar(TR.product.added, { variant: 'success' });
      openCartDrawer();
      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
    } catch (error) {
      console.error('[ürün] sepete ekleme', error);
      enqueueSnackbar(error.response?.data?.error || 'Eklenemedi', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ position: { md: 'sticky' }, top: { md: 96 } }}>
      {themes[0] && (
        <Chip
          component={RouterLink}
          to={`/tema/${themes[0].slug}`}
          clickable
          avatar={
            <Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', ml: 0.5, '& img': { objectPosition: 'center 65%' } }}>
              <ImageWithFallback src={themes[0].thumbnail} alt="" size="sm" objectFit="cover" />
            </Box>
          }
          label={TR.product.themeChip(themes[0].name)}
          sx={{ mb: 1.5, bgcolor: `${accent}22` }}
        />
      )}
      <Typography component="h1" sx={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
        {product.name}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {TR.product.sku}: {product.sku}
        </Typography>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: soldOut ? 'error.main' : 'success.main' }} />
        <Typography variant="caption" color="text.secondary">
          {soldOut ? TR.product.soldOut : TR.product.inStock}
        </Typography>
      </Stack>
      <ProductPrice price={product.price} compareAt={product.compareAtPrice} packSize={product.packSize} unitLabel={product.unitLabel} />
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }} ref={addRef}>
        <QuantityStepper value={qty} min={1} max={max} onChange={onQty} disabled={soldOut} />
        <Typography variant="body2" color="text.secondary">
          {TR.product.liveTotal(formatPrice(product.price * qty), pieces)}
        </Typography>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Button
          variant="contained"
          size="large"
          startIcon={<ShoppingBagOutlinedIcon />}
          disabled={soldOut}
          onClick={addToCart}
          fullWidth
        >
          {added ? TR.product.added : TR.product.addToCart}
        </Button>
        <Button variant="outlined" color="secondary" size="large" fullWidth onClick={() => navigate(fromTheme ? `/tema/${fromTheme}` : '/temalar')}>
          {TR.product.backToTheme}
        </Button>
      </Stack>
      {soldOut && (
        <Button sx={{ mt: 1 }} onClick={() => enqueueSnackbar(TR.product.notifySoon, { variant: 'info' })}>
          {TR.product.notify}
        </Button>
      )}
      <ThemeSetPromoCard themes={themes} productId={product.id} quantity={qty} accent={accent} />
      <Stack direction="row" spacing={2} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <LocalShippingOutlinedIcon fontSize="small" color="primary" />
          <Typography variant="caption">{TR.product.trustShip}</Typography>
        </Stack>
        <Typography variant="caption">{TR.cart.freeOver(formatPrice(settings?.free_shipping_threshold || 750))}</Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <ReplayOutlinedIcon fontSize="small" color="primary" />
          <Typography variant="caption">{TR.product.trustReturn}</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

ProductInfoPanel.propTypes = {
  product: PropTypes.object.isRequired,
  qty: PropTypes.number,
  onQty: PropTypes.func,
  themes: PropTypes.array,
  accent: PropTypes.string,
  addRef: PropTypes.object,
  settings: PropTypes.object,
};
