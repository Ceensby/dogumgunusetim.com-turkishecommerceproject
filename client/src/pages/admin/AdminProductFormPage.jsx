import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, FormControlLabel, Grid, MenuItem, Switch, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  adminCategories,
  adminColors,
  adminCreateProduct,
  adminProduct,
  adminThemes,
  adminUpdateProduct,
  adminUpload,
} from '../../api/admin';
import Loader from '../../components/common/Loader';

const empty = {
  name: '',
  sku: '',
  slug: '',
  description: '',
  themeId: '',
  categoryId: '',
  colorId: '',
  price: '',
  compareAtPrice: '',
  packSize: 1,
  unitLabel: 'adet',
  stock: 0,
  trackStock: true,
  isActive: true,
  sortOrder: 0,
  imageUrl: '',
  attributes: [{ label: '', value: '' }],
};

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'yeni';
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(!isNew);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const cats = useQuery({ queryKey: ['admin-cats'], queryFn: adminCategories });
  const colors = useQuery({ queryKey: ['admin-colors'], queryFn: adminColors });
  const themes = useQuery({ queryKey: ['admin-themes'], queryFn: adminThemes });

  useEffect(() => {
    if (isNew) return;
    adminProduct(id).then((p) => {
      setForm({
        ...empty,
        ...p,
        themeId: p.themeId || '',
        colorId: p.colorId || '',
        imageUrl: p.images?.[0]?.url || '',
        attributes: p.attributes?.length ? p.attributes.map((a) => ({ label: a.label, value: a.value })) : [{ label: '', value: '' }],
      });
      setLoading(false);
    });
  }, [id, isNew]);

  const set = (k) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      sku: form.sku,
      slug: form.slug || undefined,
      description: form.description,
      themeId: form.themeId ? Number(form.themeId) : null,
      categoryId: Number(form.categoryId),
      colorId: form.colorId ? Number(form.colorId) : null,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      packSize: Number(form.packSize) || 1,
      unitLabel: form.unitLabel,
      stock: Number(form.stock) || 0,
      trackStock: form.trackStock,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
      images: form.imageUrl ? [{ url: form.imageUrl, alt: form.name, isPrimary: true }] : [],
      attributes: (form.attributes || [])
        .filter((a) => a.label && a.value)
        .map((a, i) => ({ label: a.label, value: a.value, sortOrder: i })),
    };
    try {
      if (isNew) await adminCreateProduct(payload);
      else await adminUpdateProduct(id, payload);
      enqueueSnackbar('Kaydedildi', { variant: 'success' });
      navigate('/admin/urunler');
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Kayıt başarısız', { variant: 'error' });
    }
  };

  if (loading) return <Loader />;

  return (
    <Box component="form" onSubmit={submit}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {isNew ? 'Yeni ürün' : 'Ürünü düzenle'}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}><TextField required fullWidth label="Ad" value={form.name} onChange={set('name')} /></Grid>
        <Grid item xs={12} md={6}><TextField required fullWidth label="SKU" value={form.sku} onChange={set('sku')} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth label="Slug" value={form.slug} onChange={set('slug')} /></Grid>
        <Grid item xs={12} md={6}>
          <TextField select fullWidth required label="Kategori" value={form.categoryId} onChange={set('categoryId')}>
            {(cats.data || []).map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField select fullWidth label="Tema (opsiyonel)" value={form.themeId} onChange={set('themeId')}>
            <MenuItem value="">Yok (düz renk)</MenuItem>
            {(themes.data || []).map((t) => (
              <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField select fullWidth label="Renk" value={form.colorId} onChange={set('colorId')}>
            <MenuItem value="">Yok</MenuItem>
            {(colors.data || []).map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}><TextField required fullWidth type="number" label="Fiyat" value={form.price} onChange={set('price')} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth type="number" label="packSize" value={form.packSize} onChange={set('packSize')} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="unitLabel" value={form.unitLabel} onChange={set('unitLabel')} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth type="number" label="Stok" value={form.stock} onChange={set('stock')} /></Grid>
        <Grid item xs={12}><TextField fullWidth multiline minRows={3} label="Açıklama" value={form.description} onChange={set('description')} /></Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Görsel URL" value={form.imageUrl} onChange={set('imageUrl')} />
          <Button component="label" sx={{ mt: 1 }}>
            Görsel yükle
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={async (e) => {
                if (!e.target.files[0]) return;
                const res = await adminUpload(e.target.files[0]);
                setForm((f) => ({ ...f, imageUrl: res.url }));
              }}
            />
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 1 }}>Ürün özellikleri</Typography>
          {(form.attributes || []).map((attr, i) => (
            <Grid container spacing={1} key={i} sx={{ mb: 1 }}>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  size="small"
                  label="Etiket"
                  value={attr.label}
                  onChange={(e) => {
                    const next = [...form.attributes];
                    next[i] = { ...next[i], label: e.target.value };
                    setForm((f) => ({ ...f, attributes: next }));
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  size="small"
                  label="Değer"
                  value={attr.value}
                  onChange={(e) => {
                    const next = [...form.attributes];
                    next[i] = { ...next[i], value: e.target.value };
                    setForm((f) => ({ ...f, attributes: next }));
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  onClick={() => {
                    const next = form.attributes.filter((_, idx) => idx !== i);
                    setForm((f) => ({ ...f, attributes: next.length ? next : [{ label: '', value: '' }] }));
                  }}
                >
                  Sil
                </Button>
              </Grid>
            </Grid>
          ))}
          <Button
            onClick={() => setForm((f) => ({ ...f, attributes: [...(f.attributes || []), { label: '', value: '' }] }))}
          >
            Özellik ekle
          </Button>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel control={<Switch checked={form.isActive} onChange={set('isActive')} />} label="Aktif" />
          <FormControlLabel control={<Switch checked={form.trackStock} onChange={set('trackStock')} />} label="Stok takibi" />
        </Grid>
      </Grid>
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>Kaydet</Button>
    </Box>
  );
}
