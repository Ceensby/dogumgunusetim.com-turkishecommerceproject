import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Card, CardContent, Chip, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from 'notistack';
import ImageWithFallback from '../common/ImageWithFallback';
import PriceText from '../common/PriceText';
import { primaryImageUrl } from '../../utils/imageUrl';
import { useCartStore } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';
import { TR } from '../../constants/tr';

export default function ProductCard({ product, fromTheme, compact, quickAdd }) {
  const img = primaryImageUrl(product);
  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);
  const { enqueueSnackbar } = useSnackbar();
  const categoryLabel = product.category?.name;

  const onQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addItem({ productId: product.id, quantity: 1 });
      openCartDrawer();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || 'Eklenemedi', { variant: 'error' });
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        component={RouterLink}
        to={`/urun/${product.slug}`}
        state={fromTheme ? { fromTheme } : undefined}
        sx={{ aspectRatio: '1 / 1', overflow: 'hidden', bgcolor: 'background.paper' }}
      >
        <ImageWithFallback
          src={img}
          alt={product.name}
          letter={product.name}
          size={compact ? 'sm' : 'md'}
          objectFit="contain"
        />
      </Box>
      <CardContent sx={{ flex: 1, py: compact ? 1 : 2, px: compact ? 1.25 : 2, '&:last-child': { pb: compact ? 1.25 : 2 } }}>
        <Typography
          variant={compact ? 'subtitle2' : 'h6'}
          component={RouterLink}
          to={`/urun/${product.slug}`}
          state={fromTheme ? { fromTheme } : undefined}
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: compact ? 40 : undefined,
          }}
        >
          {product.name}
        </Typography>
        {compact && quickAdd && categoryLabel ? (
          <Chip label={categoryLabel} size="small" variant="outlined" sx={{ mt: 0.5, height: 22, fontSize: 11 }} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            {product.unitLabel}
          </Typography>
        )}
        <Box sx={{ mt: compact ? 0.75 : 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
          <PriceText value={product.price} compareAt={product.compareAtPrice} />
          {quickAdd && (
            <IconButton
              aria-label={TR.product.addToCart}
              size="small"
              color="primary"
              onClick={onQuickAdd}
              sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' }, width: 32, height: 32 }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          )}
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
  quickAdd: PropTypes.bool,
};
