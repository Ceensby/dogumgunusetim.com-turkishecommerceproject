import { useNavigate } from 'react-router-dom';
import { Container, Grid, Typography } from '@mui/material';
import { useCart } from '../hooks/useCart';
import { TR } from '../constants/tr';
import SeoHead from '../components/common/SeoHead';
import EmptyState from '../components/common/EmptyState';
import CartSetGroup from '../components/cart/CartSetGroup';
import CartLineItem from '../components/cart/CartLineItem';
import OrderSummary from '../components/cart/OrderSummary';
import Loader from '../components/common/Loader';

export default function CartPage() {
  const { cart, isLoading } = useCart();
  const navigate = useNavigate();

  if (isLoading && !cart) return <Loader />;

  const empty = !cart?.items?.length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SeoHead title={TR.cart.title} path="/sepet" />
      <Typography variant="h2" sx={{ mb: 3 }}>
        {TR.cart.title}
      </Typography>
      {empty ? (
        <EmptyState
          title={TR.cart.emptyTitle}
          hint={TR.cart.emptyHint}
          actionLabel={TR.cart.browse}
          onAction={() => navigate('/temalar')}
        />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {cart.groups?.map((g) => (
              <CartSetGroup key={g.setGroupId} group={g} />
            ))}
            {cart.ungroupedItems?.length > 0 && (
              <>
                <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
                  {TR.cart.other}
                </Typography>
                {cart.ungroupedItems.map((item) => (
                  <CartLineItem key={item.id} item={item} />
                ))}
              </>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <OrderSummary cart={cart} />
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
