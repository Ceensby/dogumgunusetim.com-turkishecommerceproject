import { Link as RouterLink } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import { adminDeleteProduct, adminProducts } from '../../api/admin';
import Loader from '../../components/common/Loader';
import { formatPrice } from '../../utils/formatPrice';

export default function AdminProductsPage() {
  const [q, setQ] = useState('');
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin-products', q], queryFn: () => adminProducts(q) });
  const del = useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
  if (query.isLoading) return <Loader />;
  return (
    <>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Ürünler</Typography>
        <Button component={RouterLink} to="/admin/urunler/yeni" variant="contained">
          Yeni ürün
        </Button>
      </Stack>
      <TextField size="small" label="Ara" value={q} onChange={(e) => setQ(e.target.value)} sx={{ mb: 2 }} />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Ad</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Fiyat</TableCell>
            <TableCell>Stok</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {(query.data || []).map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.sku}</TableCell>
              <TableCell>{formatPrice(p.price)}</TableCell>
              <TableCell>{p.stock}</TableCell>
              <TableCell>
                <Button component={RouterLink} to={`/admin/urunler/${p.id}`}>
                  Düzenle
                </Button>
                <IconButton aria-label="Sil" onClick={() => del.mutate(p.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
