import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  adminCategories,
  adminCategoryGroups,
  adminCreateCategory,
  adminCreateCategoryGroup,
  adminDeleteCategory,
  adminDeleteCategoryGroup,
  adminUpdateCategory,
} from '../../api/admin';
import Loader from '../../components/common/Loader';

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const cats = useQuery({ queryKey: ['admin-cats'], queryFn: adminCategories });
  const groups = useQuery({ queryKey: ['admin-cat-groups'], queryFn: adminCategoryGroups });
  const [groupForm, setGroupForm] = useState({ name: '', iconName: '', sortOrder: 0 });
  const [form, setForm] = useState({ name: '', pluralName: '', unitLabel: 'adet', groupId: '' });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin-cats'] });
    qc.invalidateQueries({ queryKey: ['admin-cat-groups'] });
  };

  const createGroup = useMutation({
    mutationFn: adminCreateCategoryGroup,
    onSuccess: () => {
      refresh();
      setGroupForm({ name: '', iconName: '', sortOrder: 0 });
    },
  });
  const delGroup = useMutation({
    mutationFn: adminDeleteCategoryGroup,
    onSuccess: refresh,
  });
  const create = useMutation({
    mutationFn: adminCreateCategory,
    onSuccess: () => {
      refresh();
      setForm({ name: '', pluralName: '', unitLabel: 'adet', groupId: '' });
    },
  });
  const updateCat = useMutation({
    mutationFn: ({ id, payload }) => adminUpdateCategory(id, payload),
    onSuccess: refresh,
  });
  const del = useMutation({
    mutationFn: adminDeleteCategory,
    onSuccess: refresh,
  });

  if (cats.isLoading || groups.isLoading) return <Loader />;
  const groupItems = groups.data || [];

  return (
    <>
      <Typography variant="h4" sx={{ mb: 2 }}>Kategori grupları</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 2 }}>
        <TextField size="small" label="Grup adı" value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} />
        <TextField size="small" label="İkon" value={groupForm.iconName} onChange={(e) => setGroupForm({ ...groupForm, iconName: e.target.value })} />
        <TextField
          size="small"
          type="number"
          label="Sıra"
          value={groupForm.sortOrder}
          onChange={(e) => setGroupForm({ ...groupForm, sortOrder: Number(e.target.value) })}
          sx={{ width: 100 }}
        />
        <Button variant="contained" onClick={() => createGroup.mutate(groupForm)}>Grup ekle</Button>
      </Stack>
      {(groupItems).map((g) => (
        <Stack key={g.id} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Typography sx={{ width: 200 }}>{g.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            {g.slug} · {g._count?.categories ?? 0} kategori · {g.iconName || 'ikon yok'}
          </Typography>
          <IconButton aria-label="Grup sil" onClick={() => delGroup.mutate(g.id)}><DeleteIcon /></IconButton>
        </Stack>
      ))}

      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>Kategoriler</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 3 }}>
        <TextField size="small" label="Ad" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <TextField size="small" label="Çoğul" value={form.pluralName} onChange={(e) => setForm({ ...form, pluralName: e.target.value })} />
        <TextField size="small" label="Birim" value={form.unitLabel} onChange={(e) => setForm({ ...form, unitLabel: e.target.value })} />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Grup</InputLabel>
          <Select
            label="Grup"
            value={form.groupId}
            onChange={(e) => setForm({ ...form, groupId: e.target.value })}
          >
            <MenuItem value="">Grup yok</MenuItem>
            {groupItems.map((g) => (
              <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={() => create.mutate({ ...form, groupId: form.groupId || null })}
        >
          Ekle
        </Button>
      </Stack>
      {(cats.data || []).map((c) => (
        <Stack key={c.id} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Typography sx={{ flex: 1 }}>{c.name} ({c.slug})</Typography>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Grup</InputLabel>
            <Select
              label="Grup"
              value={c.groupId || ''}
              onChange={(e) => updateCat.mutate({ id: c.id, payload: { groupId: e.target.value || null } })}
            >
              <MenuItem value="">Grup yok</MenuItem>
              {groupItems.map((g) => (
                <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton aria-label="Sil" onClick={() => del.mutate(c.id)}><DeleteIcon /></IconButton>
        </Stack>
      ))}
    </>
  );
}
