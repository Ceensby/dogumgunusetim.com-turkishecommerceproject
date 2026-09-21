import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { adminStats } from '../../api/admin';
import Loader from '../../components/common/Loader';
import { formatPrice } from '../../utils/formatPrice';

export default function AdminDashboardPage() {
  const query = useQuery({ queryKey: ['admin-stats'], queryFn: adminStats });
  if (query.isLoading) return <Loader />;
  const s = query.data || {};
  const cards = [
    { label: 'Tema', value: s.themeCount },
    { label: 'Ürün', value: s.productCount },
    { label: 'Sipariş', value: s.orderCount },
    { label: 'Bekleyen', value: s.pendingOrders },
  ];
  return (
    <>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Özet
      </Typography>
      <Grid container spacing={2}>
        {cards.map((c) => (
          <Grid item xs={6} md={3} key={c.label}>
            <Card>
              <CardContent>
                <Typography color="text.secondary">{c.label}</Typography>
                <Typography variant="h3">{c.value ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
        Son siparişler
      </Typography>
      {(s.recentOrders || []).map((o) => (
        <Typography key={o.id}>
          {o.orderNumber} — {o.customer?.name} — {formatPrice(o.total)}
        </Typography>
      ))}
    </>
  );
}
