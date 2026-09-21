import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { adminColors, adminCreateColor, adminDeleteColor } from '../../api/admin';
import Loader from '../../components/common/Loader';

export default function AdminColorsPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin-colors'], queryFn: adminColors });
  const [form, setForm] = useState({ name: '', hexCode: '#FF6FA5' });
  const create = useMutation({
    mutationFn: adminCreateColor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-colors'] });
      setForm({ name: '', hexCode: '#FF6FA5' });
    },
  });
  const del = useMutation({
    mutationFn: adminDeleteColor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-colors'] }),
  });
  if (query.isLoading) return <Loader />;
  return (
    <>
      <Typography variant="h4" sx={{ mb: 2 }}>Renkler</Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <TextField size="small" label="Ad" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <TextField size="small" label="Hex" value={form.hexCode} onChange={(e) => setForm({ ...form, hexCode: e.target.value })} />
        <Button variant="contained" onClick={() => create.mutate(form)}>Ekle</Button>
      </Stack>
      {(query.data || []).map((c) => (
        <Stack key={c.id} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Box sx={{ width: 24, height: 24, bgcolor: c.hexCode, borderRadius: '50%', border: '1px solid #ddd' }} />
          <Typography sx={{ flex: 1 }}>{c.name}</Typography>
          <IconButton aria-label="Sil" onClick={() => del.mutate(c.id)}><DeleteIcon /></IconButton>
        </Stack>
      ))}
    </>
  );
}
