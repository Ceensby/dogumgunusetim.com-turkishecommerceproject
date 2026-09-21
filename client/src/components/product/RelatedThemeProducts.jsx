import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Box, IconButton, Typography } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useSnackbar } from 'notistack';
import ProductCard from './ProductCard';
import { TR } from '../../constants/tr';
import { useCartStore } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';

export default function RelatedThemeProducts({ products, theme, fromTheme }) {
  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);
  const { enqueueSnackbar } = useSnackbar();
  if (!products?.length && !theme) return null;

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        {TR.product.related(theme?.name || '')}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          pb: 1,
          '&::-webkit-scrollbar': { height: 6 },
        }}
      >
        {products.map((p) => (
          <Box key={p.id} sx={{ minWidth: 220, maxWidth: 220, scrollSnapAlign: 'start', position: 'relative' }}>
            <ProductCard product={p} fromTheme={fromTheme} compact />
            <IconButton
              aria-label={TR.product.addToCart}
              size="small"
              sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
              onClick={async () => {
                try {
                  await addItem({ productId: p.id, quantity: 1 });
                  openCartDrawer();
                } catch (e) {
                  enqueueSnackbar(e.response?.data?.error || 'Eklenemedi', { variant: 'error' });
                }
              }}
            >
              <AddShoppingCartIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        {theme && (
          <Box
            component={RouterLink}
            to={`/tema/${theme.slug}`}
            sx={{
              minWidth: 220,
              scrollSnapAlign: 'start',
              borderRadius: 3,
              border: '2px dashed',
              borderColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              textAlign: 'center',
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 800,
            }}
          >
            {TR.product.relatedCta}
          </Box>
        )}
      </Box>
    </Box>
  );
}

RelatedThemeProducts.propTypes = {
  products: PropTypes.array,
  theme: PropTypes.object,
  fromTheme: PropTypes.string,
};
