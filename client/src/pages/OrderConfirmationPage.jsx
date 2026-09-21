import { Link as RouterLink, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Container, Typography } from '@mui/material';
import { fetchOrder } from '../api/cart';
import { TR } from '../constants/tr';
import { formatPrice } from '../utils/formatPrice';
import SeoHead from '../components/common/SeoHead';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const query = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => fetchOrder(orderNumber),
  });

  if (query.isLoading) return <Loader />;
  if (query.isError) return <Container sx={{ py: 4 }}><ErrorState onRetry={query.refetch} /></Container>;
  const order = query.data;

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <SeoHead title={TR.order.thanks} path={`/siparis-onay/${orderNumber}`} />
      <Typography variant="h2">{TR.order.thanks}</Typography>
      <Typography sx={{ mt: 2 }}>
        {TR.order.number}: <strong>{order.orderNumber}</strong>
      </Typography>
      <Typography color="text.secondary" sx={{ my: 1 }}>
        {formatPrice(order.total)}
      </Typography>
      <Typography sx={{ mb: 3 }}>{TR.order.hint}</Typography>
      <Button component={RouterLink} to="/" variant="contained">
        {TR.order.backHome}
      </Button>
    </Container>
  );
}
