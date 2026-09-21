import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { adminOrders } from '../../api/admin';
import Loader from '../../components/common/Loader';
import { formatPrice } from '../../utils/formatPrice';
import { ORDER_STATUS } from '../../constants/tr';

export default function AdminOrdersPage() {
  const query = useQuery({ queryKey: ['admin-orders'], queryFn: () => adminOrders() });
  if (query.isLoading) return <Loader />;
  return (
    <>
      <Typography variant="h4" sx={{ mb: 2 }}>Siparişler</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>No</TableCell>
            <TableCell>Müşteri</TableCell>
            <TableCell>Durum</TableCell>
            <TableCell>Tutar</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {(query.data || []).map((o) => (
            <TableRow key={o.id}>
              <TableCell>{o.orderNumber}</TableCell>
              <TableCell>{o.customer?.name}</TableCell>
              <TableCell>{ORDER_STATUS[o.status] || o.status}</TableCell>
              <TableCell>{formatPrice(o.total)}</TableCell>
              <TableCell>
                <Button component={RouterLink} to={`/admin/siparisler/${o.id}`}>Detay</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
