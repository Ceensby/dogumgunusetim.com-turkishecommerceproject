import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useUiStore } from '../../store/uiStore';
import { useCart } from '../../hooks/useCart';
import { TR } from '../../constants/tr';
import { formatPrice } from '../../utils/formatPrice';
import CartSetGroup from './CartSetGroup';
import CartLineItem from './CartLineItem';
import EmptyState from '../common/EmptyState';

export default function CartDrawer() {
  const open = useUiStore((s) => s.cartDrawerOpen);
  const close = useUiStore((s) => s.closeCartDrawer);
  const { cart } = useCart();
  const navigate = useNavigate();
  const empty = !cart?.items?.length;

  return (
    <Drawer anchor="right" open={open} onClose={close}>
      <Box sx={{ width: { xs: 320, sm: 400 }, p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{TR.cart.drawerTitle}</Typography>
          <IconButton aria-label={TR.common.close} onClick={close}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {empty ? (
            <EmptyState title={TR.cart.emptyTitle} hint={TR.cart.emptyHint} />
          ) : (
            <Stack spacing={2}>
              {cart.groups?.map((g) => (
                <CartSetGroup key={g.setGroupId} group={g} compact />
              ))}
              {cart.ungroupedItems?.map((item) => (
                <CartLineItem key={item.id} item={item} />
              ))}
            </Stack>
          )}
        </Box>
        {!empty && (
          <Box sx={{ pt: 2 }}>
            <Typography fontWeight={800} sx={{ mb: 1 }}>
              {TR.cart.total}: {formatPrice(cart.total)}
            </Typography>
            <Button fullWidth variant="outlined" onClick={close} sx={{ mb: 1 }}>
              {TR.cart.continue}
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                close();
                navigate('/sepet');
              }}
            >
              {TR.cart.goCart}
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
