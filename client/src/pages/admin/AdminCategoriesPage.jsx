import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { adminCategories, adminCreateCategory, adminDeleteCategory, adminUpdateCategory } from '../../api/admin';
import Loader from '../../components/common/Loader';

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin-cats'], queryFn: adminCategories });
  const [form, setForm] = useState({ name: '', pluralName: '', unitLabel: 'adet', iconName: '', sortOrder: 0 });
  const create = useMutation({
    mutationFn: adminCreateCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-cats'] });
      setForm({ name: '', pluralName: '', unitLabel: 'adet', iconName: '', sortOrder: 0 });
    },
  });
  const del = useMutation({
    mutationFn: adminDeleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-cats'] }),
  });

  if (query.isLoading) return <Loader />;
  return (
    <>
      <Typography variant="h4" sx={{ mb: 2 }}>Kategoriler</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 3 }}>
        <TextField size="small" label="Ad" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <TextField size="small" label="Çoğul" value={form.pluralName} onChange={(e) => setForm({ ...form, pluralName: e.target.value })} />
        <TextField size="small" label="Birim" value={form.unitLabel} onChange={(e) => setForm({ ...form, unitLabel: e.target.value })} />
        <Button variant="contained" onClick={() => create.mutate(form)}>Ekle</Button>
      </Stack>
      {(query.data || []).map((c) => (
        <Stack key={c.id} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Typography sx={{ flex: 1 }}>{c.name} ({c.slug})</Typography>
          <IconButton aria-label="Sil" onClick={() => del.mutate(c.id)}><DeleteIcon /></IconButton>
        </Stack>
      ))}
    </>
  );
}
