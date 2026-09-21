import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Container, Grid, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCart } from '../hooks/useCart';
import { createOrder } from '../api/cart';
import { useCartStore } from '../store/cartStore';
import { TR } from '../constants/tr';
import SeoHead from '../components/common/SeoHead';
import OrderSummary from '../components/cart/OrderSummary';
import EmptyState from '../components/common/EmptyState';

export default function CheckoutPage() {
  const { cart } = useCart();
  const coupon = useCartStore((s) => s.coupon);
  const refresh = useCartStore((s) => s.refresh);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    district: '',
    addressLine: '',
    postalCode: '',
    note: '',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (!cart?.items?.length) {
    return (
      <Container sx={{ py: 4 }}>
        <EmptyState title={TR.cart.emptyTitle} actionLabel={TR.cart.browse} onAction={() => navigate('/temalar')} />
      </Container>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createOrder({
        customer: { name: form.name, email: form.email, phone: form.phone },
        address: {
          fullName: form.name,
          phone: form.phone,
          city: form.city,
          district: form.district,
          addressLine: form.addressLine,
          postalCode: form.postalCode,
        },
        note: form.note,
        couponCode: coupon || undefined,
      });
      await refresh();
      navigate(`/siparis-onay/${res.data.orderNumber}`);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Sipariş oluşturulamadı', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SeoHead title={TR.checkout.title} path="/odeme" />
      <Typography variant="h2" sx={{ mb: 2 }}>
        {TR.checkout.title}
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        {TR.checkout.paymentNote}
      </Alert>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box component="form" onSubmit={submit}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {TR.checkout.customer}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth label={TR.checkout.name} value={form.name} onChange={set('name')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required type="email" fullWidth label={TR.checkout.email} value={form.email} onChange={set('email')} />
              </Grid>
              <Grid item xs={12}>
                <TextField required fullWidth label={TR.checkout.phone} value={form.phone} onChange={set('phone')} />
              </Grid>
            </Grid>
            <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
              {TR.checkout.address}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth label={TR.checkout.city} value={form.city} onChange={set('city')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth label={TR.checkout.district} value={form.district} onChange={set('district')} />
              </Grid>
              <Grid item xs={12}>
                <TextField required fullWidth multiline minRows={2} label={TR.checkout.line} value={form.addressLine} onChange={set('addressLine')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label={TR.checkout.postal} value={form.postalCode} onChange={set('postalCode')} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline label={TR.checkout.note} value={form.note} onChange={set('note')} />
              </Grid>
            </Grid>
            <Button type="submit" variant="contained" size="large" sx={{ mt: 3 }} disabled={loading}>
              {TR.checkout.submit}
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <OrderSummary cart={cart} checkout />
        </Grid>
      </Grid>
    </Container>
  );
}
