import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MenuItem, TextField, Typography } from '@mui/material';
import { adminOrder, adminUpdateOrder } from '../../api/admin';
import Loader from '../../components/common/Loader';
import { formatPrice } from '../../utils/formatPrice';
import { ORDER_STATUS } from '../../constants/tr';

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin-order', id], queryFn: () => adminOrder(id) });
  const mut = useMutation({
    mutationFn: (status) => adminUpdateOrder(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-order', id] }),
  });
  if (query.isLoading) return <Loader />;
  const o = query.data;
  return (
    <>
      <Typography variant="h4">{o.orderNumber}</Typography>
      <Typography sx={{ my: 1 }}>{o.customer?.name} · {o.customer?.email}</Typography>
      <Typography sx={{ mb: 2 }}>{formatPrice(o.total)}</Typography>
      <TextField
        select
        label="Durum"
        value={o.status}
        onChange={(e) => mut.mutate(e.target.value)}
        sx={{ mb: 3, minWidth: 220 }}
      >
        {Object.entries(ORDER_STATUS).map(([k, v]) => (
          <MenuItem key={k} value={k}>{v}</MenuItem>
        ))}
      </TextField>
      {o.items?.map((item) => (
        <Typography key={item.id}>
          {item.setName ? `[${item.setName}] ` : ''}
          {item.productName} × {item.quantity} = {formatPrice(item.total)}
        </Typography>
      ))}
    </>
  );
}
